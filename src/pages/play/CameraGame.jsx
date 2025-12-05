
import React, { useRef, useEffect } from "react";
import { createTracker } from "../../lib/tracking/phaserTracker.js";
import { startCamera } from "../../lib/tracking/camera.js";

export default function CameraGame() {
  //initalize the camera and start tracking
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const phaserStarted = useRef(false);

  useEffect(() => {
    let rafId = null;
    let cancelled = false;
    
    const startTracking = async () => {
      holisticRef.current = createTracker();
      // Try to reuse global video stream if available
      const globalVideo = document.getElementById("video");
      if (globalVideo && globalVideo.srcObject && videoRef.current) {
        videoRef.current.srcObject = globalVideo.srcObject;
      } else {
        await startCamera(videoRef.current);
      }

      const processFrame = async () => {
        if (cancelled) return;
        try {
          await holisticRef.current.send({ image: videoRef.current });
        } catch (e) {
          // Silently handle errors
        }
        rafId = requestAnimationFrame(processFrame);
      };
      rafId = requestAnimationFrame(processFrame);
    };

    startTracking();

    // start phaser
    if (!phaserStarted.current) {
      phaserStarted.current = true;
      //import the games config to use it's 'create game' function, which will put the game in the container on the webpage
      import("../../lib/phaser/games/gameConfig.js").then(({ default: createGame }) => {
        const container = document.getElementById("game-container");
        if (container) createGame("game-container");
      });
    }
    
    // Cleanup on unmount
    return () => {
      cancelled = true;
      if (typeof rafId === "number") cancelAnimationFrame(rafId);
      try {
        if (holisticRef.current && typeof holisticRef.current.close === "function") {
          holisticRef.current.close();
        }
      } catch (e) {}
      try {
        const container = document.getElementById("game-container");
        if (container && container._phaserGame) {
          container._phaserGame.destroy(true);
          delete container._phaserGame;
        }
      } catch (e) {}
    };
  }, []);
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
