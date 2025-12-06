import React, { useRef, useEffect } from "react";
import { createTracker } from "../lib/tracking/phaserTracker.js";
import { startCamera } from "../lib/tracking/camera.js";

export default function MainGame({ configFile }) {
  const videoRef = useRef(null);
  const holisticRef = useRef(null);
  const trackingActive = useRef(true);
  const gameRef = useRef(null);

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

    import("../lib/phaser/games/rock-paper-scissors/RPSConfig.js")
      .then(({ default: createGame }) => {
        const container = document.getElementById("game-container");
        if (container) {
          gameRef.current = createGame("game-container");
        }
      });

    return () => {
      trackingActive.current = false;

      // ⭐ STOP MEDIAPIPE — THIS FIXES THE “width of null” ERROR
      if (holisticRef.current) {
        try {
          holisticRef.current.close();
        } catch (e) {
          console.warn("Holistic cleanup warn:", e);
        }
      }
      holisticRef.current = null;

      // ⭐ SAFELY DESTROY PHASER
      if (gameRef.current) {
        const game = gameRef.current;

        try {
          // Stop update loop
          game.step = () => {};

          // Stop all scenes
          game.scene.getScenes(true).forEach((scene) => {
            try {
              scene.sys.shutdown();
              scene.sys.destroy();
            } catch {}
          });

          // Destroy renderer BEFORE removing canvas
          if (game.renderer) {
            const gl = game.renderer.gl;
            const loseCtx = gl?.getExtension("WEBGL_lose_context");
            loseCtx?.loseContext();

            game.renderer.destroy();
          }

          // Remove canvas
          if (game.canvas && game.canvas.parentNode) {
            game.canvas.parentNode.removeChild(game.canvas);
          }

          game.destroy(true);
        } catch (e) {
          console.warn("Phaser cleanup warn:", e);
        }
      }

      gameRef.current = null;
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


