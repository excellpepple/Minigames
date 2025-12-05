import React, { useState, useEffect } from "react";
import { Routes, Route, NavLink, Link, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import { useVirtualCursor, useDwellToClick } from "./hooks/useVirtualCursor.js";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";
import Games from "./pages/Games.jsx";
import GamePlay from "./pages/GamePlay.jsx";
import GameDetails from "./pages/GameDetails.jsx";
import Aboutpage from "./pages/Aboutpage.jsx";

import FlappyBird from "./pages/play/FlappyBird.jsx";

export default function App() {
  const location = useLocation();

  // 🎮 Detect ALL /play/* routes
  const isAnyGameRoute = location.pathname.startsWith("/play/");

  // 🎯 Disable virtual cursor tracking on ALL game pages
  const {
    videoRef,
    cameraError,
    isLoaded,
    boot
  } = useVirtualCursor(!isAnyGameRoute);

  const [virtualCursorEnabled, setVirtualCursorEnabled] = useState(() => {
    const saved = localStorage.getItem("virtualCursorEnabled");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("virtualCursorEnabled", virtualCursorEnabled.toString());
  }, [virtualCursorEnabled]);

  // Show cursor when allowed + loaded
const showCursor = true;


  useDwellToClick(!isAnyGameRoute);

  useEffect(() => {
    const cursorEl = document.getElementById("cursor");
    if (cursorEl) {
      cursorEl.style.opacity = showCursor ? "1" : "0";
      cursorEl.style.pointerEvents = "none";
    }
  }, [showCursor]);

  // Fullscreen fix
  useEffect(() => {
    const handleFullscreenChange = () => {
      const cursorEl = document.getElementById("cursor");
      if (!cursorEl) return;

      const fullscreen =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement;

      cursorEl.style.zIndex = fullscreen ? "9999" : "60";
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100">

        {/* 🎥 Camera only active when virtual cursor is active */}
        {!isAnyGameRoute && (
          <video
            ref={videoRef}
            id="video"
            autoPlay
            playsInline
            muted
            className="fixed inset-0 h-full w-full object-cover pointer-events-none"
            style={{
              display: "block",
              zIndex: 0,
              transform: "scaleX(-1)",
            }}
          />
        )}

        {/* Virtual cursor */}
        <div
          id="cursor"
          className="pointer-events-none fixed"
          style={{
            width: 24,
            height: 24,
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.95)",
            boxShadow:
              "0 0 0 2px rgba(59,130,246,0.9), 0 0 10px rgba(255,255,255,0.85)",
            zIndex: 60,
            transition: "opacity 0.3s ease-in-out",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* HEADER UI (unchanged) */}
        <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/80">
          <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-purple-500 text-white shadow">
                MV
              </span>
              <span className="text-lg">Mini Vision Games</span>
            </Link>

            <nav className="flex items-center gap-4 text-sm font-semibold">
              {[
                { to: "/", label: "Home" },
                { to: "/games", label: "Games" },
                { to: "/about", label: "About" },
                { to: "/login", label: "Login" },
                { to: "/signup", label: "Sign Up" },
              ].map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2 transition-colors hover:text-sky-700 dark:hover:text-sky-400 ${
                      isActive
                        ? "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30"
                        : "text-slate-600 dark:text-slate-300"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* MAIN ROUTES */}
        <main id="main">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/profile-setup" element={<ProfileSetup />} />
            <Route path="/games" element={<Games />} />
            <Route path="/game/:slug" element={<GameDetails />} />
            <Route path="/play/:slug" element={<GamePlay />} />
            <Route path="/about" element={<Aboutpage />} />

            {/* Direct game route */}
            <Route path="/flappy-bird" element={<FlappyBird />} />

            <Route path="*" element={<div className="p-8">Page not found</div>} />
          </Routes>
        </main>

        {/* FOOTER (unchanged) */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-black/80">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
            <p>© {new Date().getFullYear()} Mini Vision Games</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Prototype
            </p>
          </div>
        </footer>

      </div>
    </ThemeProvider>
  );
}



