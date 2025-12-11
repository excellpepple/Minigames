import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function FlappyBird({ onScoreChange, onGameEnd }) {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const trackingActive = useRef(true);
  const gameRef = useRef(null);
  const currentScoreRef = useRef(0);

  // Safe wrapper for updating score
  const handleScoreChange = (newScore) => {
    if (!trackingActive.current) return; // stop updates if game is ending
    currentScoreRef.current = newScore;
    onScoreChange(newScore);
  };

  useEffect(() => {
    trackingActive.current = true;

    // ⭐ START CAMERA + TRACKING (Mediapipe)
    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        if (!trackingActive.current) return; // stop loop on unmount
        await holisticRef.current.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startTracking();

    // ⭐ START PHASER GAME - runs only once
    import("../lib/phaser/games/gameConfig.js").then(({ default: createGame }) => {
      const container = document.getElementById("game-container");
      if (!container) return;

      gameRef.current = createGame("game-container", { onScoreChange: handleScoreChange });

      // Cleanup events when Phaser destroys scene
      gameRef.current.events?.on("destroy", () => {
        trackingActive.current = false;
        onGameEnd(currentScoreRef.current); // send final score safely
      });

      gameRef.current.events?.on("gameover", () => {
        console.log("Game Over");
        onGameEnd(currentScoreRef.current);
      });
    });

    // ⭐ CLEANUP ON UNMOUNT
    return () => {
      trackingActive.current = false;

      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (err) {
          console.warn("Phaser destroy warning:", err);
        }
        gameRef.current = null;
      }
    };
  }, []); // ← empty dependency array ensures Phaser is created once

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
          opacity: 0,
          zIndex: 0,
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
          pointerEvents: "none",
        }}
      ></div>
    </div>
  );
}
