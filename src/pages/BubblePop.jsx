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
  const bubbleIdCounter = useRef(0);
  const TARGET_BUBBLES = 18;
  const [combo, setCombo] = useState(0);
  const comboTimeoutRef = useRef(null);
  const lastPopTimeRef = useRef(0);
  const [scorePopups, setScorePopups] = useState([]);
  const timeLeftRef = useRef(timeLeft);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/audio/bubble_pop_sound.mp3');
    audioRef.current.volume = 0.5;
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
        const url = new URL("../lib/tracking/main.js", import.meta.url).href;
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
  }, []);

  // Bubble generator
  const generateBubble = () => {
    const radius = 50 + Math.random() * 30;
    const margin = 100;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = margin + Math.random() * (window.innerHeight - margin * 2);

    const baseSpeed = 3.5 + (30 - timeLeftRef.current) * 0.15;
    const speed = baseSpeed + Math.random() * 2.5;
    const angle = Math.random() * Math.PI * 2;

    const rand = Math.random();
    let type = "normal";
    let pointValue = 10;
    let color = "rgba(255, 255, 255, 0.4)";

    if (rand < 0.15) {
      type = "small";
      pointValue = 20;
      color = "rgba(135, 206, 250, 0.5)";
    } else if (rand < 0.20) {
      type = "large";
      pointValue = 5;
      color = "rgba(255, 182, 193, 0.5)";
    }

    return {
      id: `bubble-${bubbleIdCounter.current++}`,
      x,
      y,
      radius: type === "small" ? radius * 0.7 : type === "large" ? radius * 1.3 : radius,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      type,
      pointValue,
      color,
    };
  };

  // Initial bubbles
  useEffect(() => {
    const initial = [];
    for (let i = 0; i < TARGET_BUBBLES; i++) initial.push(generateBubble());
    setBubbles(initial);
  }, []);

  // Animate bubbles
  useEffect(() => {
    if (bubbles.length === 0) return;
    let rafId = null;

    const animate = () => {
      setBubbles(prev =>
        prev.map(b => {
          let { x, y, vx, vy, radius } = b;
          const margin = 100;

          x += vx;
          y += vy;

          if (x - radius <= margin || x + radius >= window.innerWidth - margin) {
            vx = -vx;
          }
          if (y - radius <= margin || y + radius >= window.innerHeight - margin) {
            vy = -vy;
          }

          return { ...b, x, y, vx, vy };
        })
      );
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [bubbles.length]);

  const popBubble = (bubbleId) => {
    const popped = bubbles.find(b => b.id === bubbleId);
    if (!popped) return;

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }

    const now = performance.now();
    const diff = now - lastPopTimeRef.current;
    let newCombo = 1;
    if (diff < 1000) newCombo = combo + 1;

    setCombo(newCombo);
    lastPopTimeRef.current = now;

    if (comboTimeoutRef.current) clearTimeout(comboTimeoutRef.current);
    comboTimeoutRef.current = setTimeout(() => setCombo(0), 1500);

    const basePoints = popped.pointValue;
    const multiplier = Math.min(1 + (newCombo - 1) * 0.2, 3);
    const earned = Math.round(basePoints * multiplier);

    setScorePopups(prev => [...prev, {
      id: Date.now(),
      x: popped.x,
      y: popped.y,
      points: earned,
      isCombo: newCombo > 1
    }]);

    setTimeout(() => {
      setScorePopups(prev => prev.slice(1));
    }, 1000);

    setBubbles(prev => {
      const filtered = prev.filter(b => b.id !== bubbleId);
      if (filtered.length < TARGET_BUBBLES) filtered.push(generateBubble());
      return filtered;
    });

    setScore(prev => {
      const updated = prev + earned;
      onScoreUpdate(updated);
      return updated;
    });

    setHoveredBubbleId(null);
    hoverStartTimeRef.current = 0;
  };

  // Timer
  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onGameEnd(score);
      return;
    }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, score, onGameEnd]);

  // Hover → pop
  useEffect(() => {
    if (bubbles.length === 0) return;
    let rafId = null;

    const checkHover = () => {
      const cursorX = cursorPositionRef.current.x;
      const cursorY = cursorPositionRef.current.y;
      const now = performance.now();

      let found = null;

      for (const bubble of bubbles) {
        const d = Math.hypot(cursorX - bubble.x, cursorY - bubble.y);
        if (d <= bubble.radius) found = bubble;
      }

      if (found) {
        if (hoveredBubbleId !== found.id) {
          setHoveredBubbleId(found.id);
          hoverStartTimeRef.current = now;
        } else if (now - hoverStartTimeRef.current >= HOVER_DWELL_MS) {
          popBubble(found.id);
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
    return () => cancelAnimationFrame(rafId);
  }, [bubbles, hoveredBubbleId]);


  // --------------------------------------------------------
  // ---------------------- RENDER --------------------------
  // --------------------------------------------------------

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden" style={{ background: "transparent", zIndex: 1 }}>

      {/* ⭐️ HAND-TRACKING CURSOR ADDED HERE ⭐️ */}
      <div
        id="cursor"
        className="pointer-events-none fixed"
        style={{
          width: 22,
          height: 22,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 0 0 2px rgba(59,130,246,0.9)",
          zIndex: 9999,
        }}
      />

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

      {bubbles.map(bubble => {
        const isHovered = hoveredBubbleId === bubble.id;
        return (
          <div
            key={bubble.id}
            onClick={() => popBubble(bubble.id)}
            data-clickable="true"
            role="button"
            className="absolute rounded-full cursor-pointer pointer-events-auto"
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.radius * 2}px`,
              height: `${bubble.radius * 2}px`,
              marginLeft: `-${bubble.radius}px`,
              marginTop: `-${bubble.radius}px`,
              zIndex: 10,
              background: bubble.color,
              backdropFilter: 'blur(2px)',
              boxShadow: isHovered
                ? 'inset 0 0 40px rgba(255,255,255,0.5), 0 8px 32px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.6)'
                : 'inset 0 0 35px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.12)',
              transition: 'box-shadow 0.2s ease, left 0.1s linear, top 0.1s linear',
            }}
          />
        );
      })}

      {/* Score Popups */}
      {scorePopups.map(popup => (
        <div
          key={popup.id}
          className="absolute pointer-events-none z-30"
          style={{
            left: popup.x,
            top: popup.y,
            transform: 'translate(-50%, -50%)',
            animation: 'scorePopup 1s ease-out forwards',
          }}
        >
          <div className={`text-2xl font-bold ${popup.isCombo ? 'text-yellow-400' : 'text-white'} drop-shadow-lg`}>
            +{popup.points} {popup.isCombo && `COMBO x${combo}!`}
          </div>
        </div>
      ))}

      {/* Combo Display */}
      {combo > 1 && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-2 rounded-full shadow-lg animate-pulse">
            <span className="text-xl font-bold">🔥 {combo}x COMBO! 🔥</span>
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="fixed bottom-4 right-4 z-50 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-3 shadow-lg">
        <div className={`text-4xl font-bold ${timeLeft <= 10 ? "text-red-600 dark:text-red-400" : "text-slate-900 dark:text-slate-100"}`}>
          {timeLeft}s
        </div>
      </div>

      {/* Camera Active Indicator */}
      {!cameraError && boot === "ready" && (
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-lg border border-white/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Camera Active
        </div>
      )}

    </div>
  );
}

