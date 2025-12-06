import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function FlappyBird({ onScoreChange }) {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const trackingActive = useRef(true);
  const gameRef = useRef(null);

  useEffect(() => {
    trackingActive.current = true;

    // ⭐ START CAMERA + TRACKING (Mediapipe)
    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        if (!trackingActive.current) return; // ⭐ stop loop on unmount
        await holisticRef.current.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startTracking();

    // ⭐ START PHASER GAME
    import("../lib/phaser/games/gameConfig.js").then(({ default: createGame }) => {
      const container = document.getElementById("game-container");

      if (container) {
        gameRef.current = createGame("game-container", { onScoreChange });

        // ⭐ IMPORTANT: CLEANUP EVENTS WHEN PHASER DESTROYS SCENE
        gameRef.current.events?.on("destroy", () => {
          trackingActive.current = false;
        });
      }
    });

    // ⭐ CLEANUP WHEN LEAVING PAGE
    return () => {
      // Stop Mediapipe frame loop
      trackingActive.current = false;

      // Destroy Phaser instance safely
      if (gameRef.current) {
        try {
          gameRef.current.destroy(true);
        } catch (err) {
          console.warn("Phaser destroy warning:", err);
        }

        gameRef.current = null;
      }
    };
  }, [onScoreChange]);

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
      ></div>
    </div>
  );
}

