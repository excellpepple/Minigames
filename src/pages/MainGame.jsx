import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function MainGame({configFile, onPlayerScoreChange, onComputerScoreChange}) {
  //initalize the camera and start tracking
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const phaserStarted = useRef(false);
  const gameInstanceRef = useRef(null);
  const trackingActive = useRef(true);

  useEffect(() => {
    trackingActive.current = true;

    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        if (!trackingActive.current) return;
        if (holisticRef.current)
          await holisticRef.current.send({ image: videoRef.current });

        requestAnimationFrame(processFrame);
      };

      processFrame();
    };

    startTracking();

    // Clean up previous game instance if it exists
    if (gameInstanceRef.current) {
      try {
        gameInstanceRef.current.destroy(true);
      } catch (e) {
        console.warn("Error destroying previous game:", e);
      }
      gameInstanceRef.current = null;
    }

    // Reset phaser started flag to allow recreation
    phaserStarted.current = false;

    // start phaser
    if (!phaserStarted.current) {
      phaserStarted.current = true;
      //import the games config to use it's 'create game' function, which will put the game in the container on the webpage
      import("../lib/phaser/games/rock-paper-scissors/RPSConfig.js").then(({ default: createGame }) => {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          const container = document.getElementById("game-container");
          if (container) {
            const game = createGame("game-container", { 
              onPlayerScoreChange: onPlayerScoreChange || (() => {}), 
              onComputerScoreChange: onComputerScoreChange || (() => {})
            });
            gameInstanceRef.current = game;
          } else {
            console.error("game-container not found");
          }
        }, 100);
      });
    }

    // Cleanup function
    return () => {
      if (gameInstanceRef.current) {
        try {
          gameInstanceRef.current.destroy(true);
        } catch (e) {
          console.warn("Error destroying game on unmount:", e);
        }
        gameInstanceRef.current = null;
      }
      phaserStarted.current = false;
    };
  }, [onPlayerScoreChange, onComputerScoreChange]);
//styling for the video feed, and then the game container.
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
          zIndex: 0,
          transform: "scaleX(-1)"
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


