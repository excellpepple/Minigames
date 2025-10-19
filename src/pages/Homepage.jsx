import { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { startCamera } from "../lib/cursor/camera.js";

export default function Homepage() {
  //camera bg
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  //poppable bubbles
  const [bubbles, setBubbles] = useState(() => [
    { id: 1, xPct: 15, yPct: 25, r: 60, popped: false },
    { id: 2, xPct: 75, yPct: 40, r: 50, popped: false },
    { id: 3, xPct: 40, yPct: 70, r: 55, popped: false },
    { id: 4, xPct: 60, yPct: 60, r: 45, popped: false },
  ]);
  const [boot, setBoot] = useState("init"); //init | loading | ready | error

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  //start camera using camera.js (mirrored)
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

    if (navigator.mediaDevices?.getUserMedia) {
      initCamera();
    } else {
      setCameraError(true);
    }

    //Cleanup function
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  //load her virtual-cursor pipeline once Holistic AND camera are ready
  useEffect(() => {
    //Don't start cursor until camera is loaded
    if (!isLoaded) return;
    
    let cancelled = false;

    const waitForHolistic = (timeoutMs = 12000) =>
      new Promise((resolve, reject) => {
        const start = Date.now();
        (function check() {
          if (cancelled) return;
          const ok =
            (typeof window !== "undefined" && window.Holistic) ||
            (typeof window !== "undefined" &&
              window.holistic &&
              window.holistic.Holistic);
          if (ok) return resolve();
          if (Date.now() - start > timeoutMs)
            return reject(new Error("Holistic not available"));
          requestAnimationFrame(check);
        })();
      });

    (async () => {
      try {
        setBoot("loading");
        await waitForHolistic();
        //Extra wait to ensure video is really ready
        await new Promise((r) => setTimeout(r, 500));
        const url = new URL("../lib/cursor/main.js", import.meta.url).href;
        await import(/* @vite-ignore */ url);
        console.log("✅ Virtual cursor initialized");
        if (!cancelled) setBoot("ready");
      } catch (e) {
        console.error("❌ Failed to init virtual cursor:", e);
        if (!cancelled) setBoot("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded]); //Only run when camera is loaded

  const pop = (id) =>
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, popped: true } : b)));

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden">
      {/* ===== CAMERA BACKGROUND ===== */}
      {!cameraError ? (
        <>
          <video
            ref={videoRef}
            id="video"
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-purple-600/30 to-purple-900/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-pink-500" />
      )}

      {/* ===== HER VIRTUAL CURSOR ===== */}
      <div
        id="cursor"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 24,
          height: 24,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.95)",
          boxShadow:
            "0 0 0 2px rgba(59,130,246,0.9), 0 0 10px rgba(255,255,255,0.85)",
          zIndex: 5,
        }}
      />

      {/* ===== DARKER FLOATING BUBBLES (poppable) ===== */}
      {!reducedMotion && (
        <div className="absolute inset-0" style={{ zIndex: 2 }}>
          {bubbles.map((b) =>
            b.popped ? null : (
              <button
                key={b.id}
                onClick={() => pop(b.id)}
                className="absolute rounded-full bg-white/40 backdrop-blur-[2px] animate-float"
                style={{
                  left: `${b.xPct}%`,
                  top: `${b.yPct}%`,
                  width: `${b.r * 2}px`,
                  height: `${b.r * 2}px`,
                  marginLeft: `-${b.r}px`,
                  marginTop: `-${b.r}px`,
                  boxShadow:
                    "inset 0 0 35px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.12)",
                }}
                aria-label="Pop bubble"
                data-clickable=""
              />
            )
          )}
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-7xl font-extrabold text-white drop-shadow-2xl animate-fade-in-up">
          Mini Vision Games
        </h1>
        <p className="text-2xl text-white/90 animate-fade-in-up-delay-1">
          Hover your finger cursor over a bubble or a button to click ✨
        </p>

        <div className="flex gap-6 text-5xl animate-fade-in-up-delay-2">
          <span className="animate-bounce-slow">✊</span>
          <span className="animate-bounce-slow-delay-1">✋</span>
          <span className="animate-bounce-slow-delay-2">✌️</span>
          <span className="animate-bounce-slow">🎮</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-fade-in-up-delay-3">
          <Link
            to="/login"
            className="group relative overflow-hidden rounded-xl border-2 border-blue-400 bg-white/90 backdrop-blur-sm px-12 py-5 text-xl font-bold text-blue-600 transition-all hover:scale-105 hover:shadow-2xl"
            aria-label="Login"
            data-clickable=""
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              Let's Go! 🚀
            </span>
          </Link>

          <Link
            to="/signup"
            className="group relative overflow-hidden rounded-xl border-2 border-green-400 bg-white/90 backdrop-blur-sm px-12 py-5 text-xl font-bold text-green-600 transition-all hover:scale-105 hover:shadow-2xl"
            aria-label="Create Account"
            data-clickable=""
          >
            <span className="relative z-10">Create Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              Join Now! 🎯
            </span>
          </Link>
        </div>

        {!cameraError && (
          <div className="absolute bottom-8 left-8 flex items-center gap-2 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-white font-medium">
              {isLoaded ? "Camera Active" : "Starting camera…"}
            </span>
            <span className="ml-2 text-xs text-white/80">({boot})</span>
          </div>
        )}
      </div>

      {/* ===== animations ===== */}
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes fadeInUp { from{opacity:0; transform:translateY(30px)} to{opacity:1; transform:translateY(0)} }
        .animate-fade-in-up { animation: fadeInUp .8s ease-out forwards }
        .animate-fade-in-up-delay-1 { animation: fadeInUp .8s ease-out .2s forwards; opacity:0 }
        .animate-fade-in-up-delay-2 { animation: fadeInUp .8s ease-out .4s forwards; opacity:0 }
        .animate-fade-in-up-delay-3 { animation: fadeInUp .8s ease-out .6s forwards; opacity:0 }
        @keyframes bounceSlow { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }
        .animate-bounce-slow { animation: bounceSlow 2s ease-in-out infinite; }
        .animate-bounce-slow-delay-1 { animation: bounceSlow 2s ease-in-out infinite; animation-delay: .3s; }
        .animate-bounce-slow-delay-2 { animation: bounceSlow 2s ease-in-out infinite; animation-delay: .6s; }
      `}</style>
    </div>
  );
}