import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

/**
 * MainGame wrapper that:
 * - Starts Mediapipe tracking
 * - Loads the Phaser RPS game
 * - Passes score updates + onGameEnd back to GamePlay.jsx
 */
export default function MainGame({
  configFile,
  onPlayerScoreChange,
  onComputerScoreChange,
  onGameEnd
}) {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);

  const gameInstanceRef = useRef(null);
  const trackingActive = useRef(true);
  const phaserStarted = useRef(false);

  useEffect(() => {
    trackingActive.current = true;

    // --------------------------
    // START MEDIAPIPE TRACKING
    // --------------------------
    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        if (!trackingActive.current) return;
        if (holisticRef.current) {
          await holisticRef.current.send({ image: videoRef.current });
        }
        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startTracking();

    // --------------------------
    // DESTROY ANY PREVIOUS GAME
    // --------------------------
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy(true);
      } catch (err) {
        console.warn("Error destroying previous Phaser instance:", err);
      }
      gameInstanceRef.current = null;
    }

    phaserStarted.current = false;

    // --------------------------
    // LOAD PHASER RPS GAME
    // --------------------------
    if (!phaserStarted.current) {
      phaserStarted.current = true;

      import("../lib/phaser/games/rock-paper-scissors/RPSConfig.js")
        .then(({ default: createGame }) => {
          setTimeout(() => {
            const container = document.getElementById("game-container");
            if (!container) {
              console.error("game-container not found");
              return;
            }

            const game = createGame("game-container", {
              onPlayerScoreChange: onPlayerScoreChange || (() => {}),
              onComputerScoreChange: onComputerScoreChange || (() => {}),
              onGameEnd: onGameEnd || (() => {})   // ⭐ IMPORTANT
            });

            gameInstanceRef.current = game;
          }, 100);
        })
        .catch((err) => console.error("Error loading RPS game:", err));
    }

    // --------------------------
    // CLEANUP WHEN COMPONENT UNMOUNTS
    // --------------------------
    return () => {
      trackingActive.current = false;

      // ⭐ FORCE GAME END IF USER EXITS WITHOUT NATURAL GAMEOVER
      if (gameInstanceRef.current) {
        try {
          const scene = gameInstanceRef.current.scene?.keys?.MainScene;
          const finalScore = scene?.playerScore || 0;

          if (typeof onGameEnd === "function") {
            console.log("React → forcing game end on unmount (RPS)", finalScore);
            onGameEnd(finalScore);
          }
        } catch (err) {
          console.warn("Error reading final score during unmount:", err);
        }

        // Destroy instance
        try {
          gameInstanceRef.current.destroy(true);
        } catch (err) {
          console.warn("Error destroying Phaser game:", err);
        }
        gameInstanceRef.current = null;
      }

      phaserStarted.current = false;
    };
  }, [onPlayerScoreChange, onComputerScoreChange, onGameEnd]);

  // --------------------------
  // RENDER VIDEO + GAME CANVAS
  // --------------------------
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: "scaleX(-1)",
          zIndex: 0
        }}
      />

      <div
        id="game-container"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none"
        }}
      />
    </div>
  );
}
