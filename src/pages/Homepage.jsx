import { useEffect, useRef, useState, useMemo } from "react";
import { startCamera } from "../lib/tracking/camera.js"; // <-- ensure 'cursor' matches your folder
import { initHoverClick } from "../lib/cursor/hoverClick.js";

export default function Homepage() {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [boot, setBoot] = useState("init");
  const audioRef= useRef(null);



  //===== Start camera using her camera.js =====
  useEffect(() => {
    let stream = null;
    async function initCamera() {
      if (!videoRef.current) return;
      try {
        await startCamera(videoRef.current); //her helper attaches stream to #video
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

  //===== Load her virtual-cursor pipeline once camera is ready =====
  useEffect(() => {
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
        await new Promise((r) => setTimeout(r, 300)); //let video settle
        const url = new URL("../lib/tracking/main.js", import.meta.url).href; //her entrypoint
        await import(/* @vite-ignore */ url);
        console.log("✅ Virtual cursor initialized");
        if (!cancelled) setBoot("ready");
      } catch (e) {
        console.error("❌ Failed to init virtual cursor:", e);
        if (!cancelled) setBoot("error");
      }
    })();

    return () => { cancelled = true; };
  }, [isLoaded]);

useEffect(() => {
    if (!isLoaded || boot !== "ready") return;
    const cleanup = initHoverClick("#cursor", 600);
    return cleanup;
  }, [isLoaded, boot]);


  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  const [bubbles, setBubbles] = useState(() => [
    { id: 1, xPct: 15, yPct: 25, r: 60, popped: false },
    { id: 2, xPct: 75, yPct: 40, r: 50, popped: false },
    { id: 3, xPct: 40, yPct: 70, r: 55, popped: false },
    { id: 4, xPct: 60, yPct: 60, r: 45, popped: false },
  ]);

  // ⭐ AUDIO SETUP
  useEffect(() => {
    audioRef.current = new Audio("/audio/bubble_pop_sound.mp3");
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) audioRef.current.pause();
    };
  }, []);

  // ⭐ SHOW GLOBAL VIDEO BACKGROUND
  useEffect(() => {
    const video = document.getElementById("video");
    if (video) video.style.opacity = "1";

    return () => {
      if (video) video.style.opacity = "0";
    };
  }, []);

  // ⭐ OPTIONAL: Enable cursor ONLY on Homepage
  useEffect(() => {
    initHoverClick(true); // enable dwell-click only here
    return () => initHoverClick(false); // disable when leaving
  }, []);

  const pop = (id) => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setBubbles((prev) =>
      prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* ===== CAMERA BACKGROUND ===== */}
      {!cameraError ? (
        <>
          <video
            ref={videoRef}
            id="video" //her code references this id
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }} //mirror (selfie)
          />
          {/* pink/purple gradient tint — IMPORTANT: don't block clicks */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-purple-600/30 to-purple-900/40 pointer-events-none" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-purple-400 to-pink-500" />
      )}

      {/* ===== HER VIRTUAL CURSOR (moved by her code) ===== */}
      <div
        id="cursor"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 24,
          height: 24,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.95)",
          boxShadow: "0 0 0 2px rgba(59,130,246,0.9), 0 0 10px rgba(255,255,255,0.85)",
          zIndex: 5,
        }}
      />

      {/* ===== FLOATING BUBBLES ===== */}
      {!reducedMotion && (
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{ zIndex: 2 }}
        >
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
                data-clickable="true"
              />
            )
          )}
        </div>
      )}

      {/* ===== PAGE TITLE ===== */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-6xl font-extrabold text-white drop-shadow-2xl animate-fade-in-up">
          Mini Vision Games
        </h1>

        <p className="text-xl text-white/90 animate-fade-in-up-delay-1">
          Hands-free interaction powered by vision. Hover to click.
        </p>

        {/* ===== LOGIN + SIGNUP BUTTONS ===== */}
        <div className="flex flex-col sm:flex-row gap-6 mt-8 animate-fade-in-up-delay-3">
          <a
            href="/login"
            data-clickable="true"
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-10 py-4 text-lg font-semibold text-slate-800 transition-all hover:shadow-lg cursor-pointer"
          >
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-slate-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>

          <a
            href="/signup"
            data-clickable="true"
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white/90 backdrop-blur-sm px-10 py-4 text-lg font-semibold text-slate-800 transition-all hover:shadow-lg cursor-pointer"
          >
            <span className="relative z-10">Create Account</span>
            <div className="absolute inset-0 bg-slate-900/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </a>
        </div>
      </div>

      {/* ===== ANIMATIONS ===== */}
      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes fadeInUp { from{opacity:0; transform:translateY(30px)} to{opacity:1; transform:translateY(0)} }
        .animate-fade-in-up { animation: fadeInUp .8s ease-out forwards }
        .animate-fade-in-up-delay-1 { animation: fadeInUp .8s ease-out .2s forwards; opacity:0 }
        .animate-fade-in-up-delay-3 { animation: fadeInUp .8s ease-out .6s forwards; opacity:0 }
      `}</style>
    </div>
  );
}
