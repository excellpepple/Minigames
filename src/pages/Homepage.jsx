import { useEffect, useRef, useState, useMemo } from "react";
import { startCamera } from "../lib/tracking/camera.js"; // <-- ensure 'cursor' matches your folder
import { initHoverClick } from "../lib/cursor/hoverClick.js";

export default function Homepage() {
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [boot, setBoot] = useState("init");

  
  const [bubbles, setBubbles] = useState(() => [
    { id: 1, xPct: 15, yPct: 25, r: 60, popped: false },
    { id: 2, xPct: 75, yPct: 40, r: 50, popped: false },
    { id: 3, xPct: 40, yPct: 70, r: 55, popped: false },
    { id: 4, xPct: 60, yPct: 60, r: 45, popped: false },
  ]);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  // Show video background on Homepage
  useEffect(() => {
    const video = document.getElementById("video");
    if (video) {
      video.style.opacity = "1";
    }
    return () => {
      if (video) {
        video.style.opacity = "0";
      }
    };
  }, []);

  const pop = (id) =>
    setBubbles((prev) => prev.map((b) => (b.id === id ? { ...b, popped: true } : b)));

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Video background and cursor are now global in App.jsx */}

      {/* ===== DARKER FLOATING BUBBLES ===== */}
      {!reducedMotion && (
        <div className="absolute inset-0 pointer-events-auto" style={{ zIndex: 2 }}>
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
                  boxShadow: "inset 0 0 35px rgba(255,255,255,0.35), 0 8px 24px rgba(0,0,0,0.12)",
                }}
                aria-label="Pop bubble"
                data-clickable="true"
              />
            )
          )}
        </div>
      )}

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
        <h1 className="text-6xl font-extrabold text-white drop-shadow-2xl animate-fade-in-up">
          Mini Vision Games
        </h1>
        <p className="text-xl text-white/90 animate-fade-in-up-delay-1">
          Hands-free interaction powered by vision. Hover to click.
        </p>

        {/* ===== Login / Signup as <a> so they're trivially clickable ===== */}
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