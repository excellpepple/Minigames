import React, { useEffect, useRef, useState } from "react";
import { startCamera } from "../lib/tracking/camera.js";

export default function BubblePop({ onGameEnd, onScoreUpdate }) {
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [boot, setBoot] = useState("init");
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [hoveredBubbleId, setHoveredBubbleId] = useState(null);
  const hoverStartTimeRef = useRef(0);
  const cursorPositionRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const HOVER_DWELL_MS = 400;

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/audio/bubble_pop_sound.mp3');
    audioRef.current.volume = 0.5; // Set volume to 50%
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Initialize camera
  useEffect(() => {
    let stream = null;
    async function initCamera() {
      if (!videoRef.current) return;
      try {
        await startCamera(videoRef.current);
        stream = videoRef.current.srcObject;
        setIsLoaded(true);
      } catch (err) {
        console.error("Camera initialization failed:", err);
        setCameraError(true);
      }
    }
    if (navigator.mediaDevices?.getUserMedia) initCamera();
    else setCameraError(true);

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Load virtual cursor system
  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;

    const waitForHolistic = (timeoutMs = 12000) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
          if (cancelled) return;
          const ok = window.Holistic || window.holistic?.Holistic;
          if (ok) return resolve();
          if (Date.now() - start > timeoutMs) return reject(new Error("Holistic not available"));
          requestAnimationFrame(check);
        })();
      });

    (async () => {
      try {
        setBoot("loading");
        await waitForHolistic();
        await new Promise((r) => setTimeout(r, 300));
        const url = new URL("../lib/cursor/main.js", import.meta.url).href;
        await import(/* @vite-ignore */ url);
        if (!cancelled) setBoot("ready");
      } catch (e) {
        console.error("❌ Failed to init virtual cursor:", e);
        if (!cancelled) setBoot("error");
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded]);

  // Track cursor position
  useEffect(() => {
    if (boot !== "ready") return;

    const updateCursorPosition = () => {
      const cursorEl = document.getElementById("cursor");
      if (cursorEl) {
        const rect = cursorEl.getBoundingClientRect();
        cursorPositionRef.current = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
      }
      requestAnimationFrame(updateCursorPosition);
    };

    const rafId = requestAnimationFrame(updateCursorPosition);
    return () => cancelAnimationFrame(rafId);
  }, [boot]);

  // Create initial bubbles
  useEffect(() => {
    const initialBubbles = [];
    const minDistance = 150;
    
    for (let i = 0; i < 8; i++) {
      let attempts = 0;
      let x, y, radius;
      let validPosition = false;
      
      while (!validPosition && attempts < 50) {
        radius = 50 + Math.random() * 30;
        x = radius + Math.random() * (window.innerWidth - radius * 2);
        y = 100 + Math.random() * (window.innerHeight - 200);
        
        validPosition = initialBubbles.every(bubble => {
          const distance = Math.sqrt(Math.pow(x - bubble.x, 2) + Math.pow(y - bubble.y, 2));
          return distance >= (radius + bubble.radius + minDistance);
        });
        attempts++;
      }
      
      initialBubbles.push({ id: `bubble-${i}`, x, y, radius });
    }
    setBubbles(initialBubbles);
  }, []);

  const popBubble = (bubbleId) => {
    // Play pop sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset to start
      audioRef.current.play().catch(err => {
        console.log("Audio play failed:", err);
      });
    }
    
    setBubbles(prev => prev.filter(b => b.id !== bubbleId));
    setScore(prev => {
      const newScore = prev + 10;
      onScoreUpdate(newScore);
      return newScore;
    });
    setHoveredBubbleId(null);
    hoverStartTimeRef.current = 0;
  };

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      const saved = localStorage.getItem('bubble-pop-high-score');
      const highScore = saved ? parseInt(saved, 10) : 0;
      if (score > highScore) {
        localStorage.setItem('bubble-pop-high-score', score.toString());
      }
      onGameEnd(score);
      return;
    }

    const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, score, onGameEnd]);

  // Check cursor hover on bubbles
  useEffect(() => {
    if (boot !== "ready" || bubbles.length === 0) return;

    let rafId = null;
    const checkHover = () => {
      const cursorX = cursorPositionRef.current.x;
      const cursorY = cursorPositionRef.current.y;
      const now = performance.now();
      let foundBubble = null;

      bubbles.forEach(bubble => {
        const distance = Math.sqrt(Math.pow(cursorX - bubble.x, 2) + Math.pow(cursorY - bubble.y, 2));
        if (distance <= bubble.radius) foundBubble = bubble;
      });

      if (foundBubble) {
        if (hoveredBubbleId !== foundBubble.id) {
          setHoveredBubbleId(foundBubble.id);
          hoverStartTimeRef.current = now;
        } else if (now - hoverStartTimeRef.current >= HOVER_DWELL_MS) {
          popBubble(foundBubble.id);
        }
      } else {
        if (hoveredBubbleId) {
          setHoveredBubbleId(null);
          hoverStartTimeRef.current = 0;
        }
      }

      rafId = requestAnimationFrame(checkHover);
    };

    rafId = requestAnimationFrame(checkHover);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [boot, bubbles, hoveredBubbleId]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ background: "transparent", zIndex: 1 }}>
      {!cameraError ? (
        <video
          ref={videoRef}
          id="video"
          autoPlay
          playsInline
          muted
          className="fixed inset-0 h-full w-full object-cover"
          style={{ transform: "scaleX(-1)", zIndex: 1 }}
        />
      ) : (
        <div className="fixed inset-0 bg-transparent" style={{ zIndex: 1 }} />
      )}

      <div
        id="cursor"
        className="pointer-events-none fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 24,
          height: 24,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 0 0 2px rgba(59,130,246,0.9), 0 0 10px rgba(255,255,255,0.85)",
          zIndex: 60,
        }}
      />

      {bubbles.map(bubble => {
        const isHovered = hoveredBubbleId === bubble.id;
        return (
          <div
            key={bubble.id}
            onClick={() => popBubble(bubble.id)}
            className="absolute rounded-full cursor-pointer pointer-events-auto animate-float"
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.radius * 2}px`,
              height: `${bubble.radius * 2}px`,
              marginLeft: `-${bubble.radius}px`,
              marginTop: `-${bubble.radius}px`,
              zIndex: 10,
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(2px)',
              boxShadow: isHovered
                ? 'inset 0 0 40px rgba(255,255,255,0.5), 0 8px 32px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.6)'
                : 'inset 0 0 35px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.12)',
              transition: 'box-shadow 0.2s ease',
            }}
          />
        );
      })}

      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-3 shadow-lg">
        <div className={`text-4xl font-bold ${timeLeft <= 10 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
          {timeLeft}s
        </div>
      </div>

      {!cameraError && boot === "ready" && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-white/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Camera Active
        </div>
      )}

      <style>{`
        @keyframes float { 
          0%, 100% { transform: translateY(0) } 
          50% { transform: translateY(-14px) } 
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
