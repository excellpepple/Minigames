import React, { useRef, useEffect } from "react";
import { createTracker } from "../../lib/tracking/phaserTracker.js";
import { startCamera } from "../../lib/tracking/camera.js";

export default function MainGame({ configFile }) {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const trackingActive = useRef(true);  // ⭐ needed to stop frame loop
  const gameRef = useRef(null);         // ⭐ store Phaser instance

  useEffect(() => {
    trackingActive.current = true;

    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        if (!trackingActive.current) return; // ⭐ stops tracking after unmount
        await holisticRef.current.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startTracking();

    // ⭐ Start RPS Phaser game
    import("../../lib/phaser/games/rock-paper-scissors/RPSConfig.js")
      .then(({ default: createGame }) => {
        const container = document.getElementById("game-container");
        if (container) {
          gameRef.current = createGame("game-container");
        }
      });

    // ⭐ CLEANUP ON LEAVE
    return () => {
      trackingActive.current = false;  // stop Mediapipe loop

      // Destroy Phaser instance
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
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



