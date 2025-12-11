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
    // Start camera tracking (runs in parallel, doesn't block game)
    const startTracking = async () => {
      try {
        holisticRef.current = createTracker();
        const globalVideo = document.getElementById("video");
        if (globalVideo && globalVideo.srcObject && videoRef.current) {
          // Reuse global stream
          videoRef.current.srcObject = globalVideo.srcObject;
        } else if (videoRef.current) {
          await startCamera(videoRef.current);
        }
        const processFrame = async () => {
          if (cancelled) return;
          try {
            if (holisticRef.current && videoRef.current) {
              await holisticRef.current.send({ image: videoRef.current });
            }
          } catch (e) {}
          rafId = requestAnimationFrame(processFrame);
        };
        rafId = requestAnimationFrame(processFrame);
      } catch (error) {
        console.error('CameraBubble: Failed to start tracking:', error);
      }
    };
    startTracking();

    // Start Phaser bubble game immediately (don't wait for camera)
    if (!phaserStarted.current) {
      phaserStarted.current = true;
      // Use setTimeout to ensure DOM is ready - increased delay
      setTimeout(() => {
        const container = document.getElementById("game-container");
        if (!container) {
          console.error('CameraBubble: game-container not found');
          return;
        }
        
        import("../lib/phaser/games/bubbleGameConfig.js").then((module) => {
          // destroy any previous game instance on this container
          if (container._phaserGame) {
            try { container._phaserGame.destroy(true); } catch (e) {}
            delete container._phaserGame;
          }
          // Use default export which is createBubbleGame
          const createGame = module.default || module.createBubbleGame;
          if (createGame) {
            console.log('CameraBubble: Creating game instance...');
            const gameInstance = createGame("game-container");
            if (gameInstance) {
              container._phaserGame = gameInstance;
              console.log('CameraBubble: Game instance created successfully', gameInstance);
              // Check if canvas was created
              const canvas = container.querySelector('canvas');
              if (canvas) {
                console.log('CameraBubble: Canvas found', canvas);
                canvas.style.display = 'block';
                canvas.style.visibility = 'visible';
              } else {
                console.warn('CameraBubble: Canvas not found in container');
              }
            } else {
              console.error('CameraBubble: Game instance is null');
            }
          } else {
            console.error('CameraBubble: createGame function not found');
          }
        }).catch((error) => {
          console.error('CameraBubble: Failed to load bubble game config:', error);
        });
      }, 100);
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
        muted
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          transform: "scaleX(-1)",
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
          pointerEvents: "auto",
          visibility: "visible",
          opacity: 1
        }}
      />
    </div>
  );
}
