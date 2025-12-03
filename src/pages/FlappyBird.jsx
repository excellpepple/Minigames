import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function FlappyBird({ onScoreChange }) {
  //initalize the camera and start tracking
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const phaserStarted = useRef(false);

  useEffect(() => {
    const startTracking = async () => {
      holisticRef.current = createTracker();
      await startCamera(videoRef.current);

      const processFrame = async () => {
        await holisticRef.current.send({ image: videoRef.current });
        requestAnimationFrame(processFrame);
      };
      processFrame();
    };

    startTracking();

    // start phaser
    if (!phaserStarted.current) {
      phaserStarted.current = true;
      //import the games config to use it's 'create game' function, which will put the game in the container on the webpage
      import("../lib/phaser/games/gameConfig.js").then(({ default: createGame }) => {
        const container = document.getElementById("game-container");
        if (container) createGame("game-container", { onScoreChange });
      });
    }
  }, [onScoreChange]);
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
          opacity: "0",
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


