import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function CameraBubble() {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const phaserStarted = useRef(false);

  useEffect(() => {
    let rafId = null;
    let cancelled = false;
    const startTracking = async () => {
      holisticRef.current = createTracker();
      const globalVideo = document.getElementById("video");
      if (globalVideo && globalVideo.srcObject && videoRef.current) {
        // Reuse global stream
        videoRef.current.srcObject = globalVideo.srcObject;
      } else {
        await startCamera(videoRef.current);
      }
      const processFrame = async () => {
        if (cancelled) return;
        try {
          await holisticRef.current.send({ image: videoRef.current });
        } catch (e) {}
        rafId = requestAnimationFrame(processFrame);
      };
      rafId = requestAnimationFrame(processFrame);
    };
    startTracking();

    // Start Phaser bubble game
    if (!phaserStarted.current) {
      phaserStarted.current = true;
      import("../lib/phaser/games/bubbleGameConfig.js").then(({ default: createGame }) => {
        const container = document.getElementById("game-container");
          if (container) {
            console.log('CameraBubble: creating Phaser bubble game');
          // destroy any previous game instance on this container
          if (container._phaserGame) {
            try { container._phaserGame.destroy(true); } catch (e) {}
            delete container._phaserGame;
          }
          const gameInstance = createGame("game-container");
          if (gameInstance) container._phaserGame = gameInstance;
        }
      });
    }

    return () => {
      cancelled = true;
      if (typeof rafId === "number") cancelAnimationFrame(rafId);
      try {
        if (holisticRef.current && typeof holisticRef.current.close === "function") holisticRef.current.close();
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
        }}
      />
      <div
        id="game-container"
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1, pointerEvents: "auto" }}
      />
    </div>
  );
}
