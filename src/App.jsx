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


import CameraGame from "./pages/CameraGame.jsx";

export default function App() {
  const { videoRef, cameraError, isLoaded, boot } = useVirtualCursor();
  const location = useLocation();

  const [virtualCursorEnabled, setVirtualCursorEnabled] = useState(() => {
    const saved = localStorage.getItem("virtualCursorEnabled");
    return saved !== null ? saved === "true" : true;
  });

  useEffect(() => {
    localStorage.setItem("virtualCursorEnabled", virtualCursorEnabled.toString());
  }, [virtualCursorEnabled]);

  const isInPlayRoute = location.pathname.startsWith("/play/");
  const showCursor = virtualCursorEnabled && isLoaded && boot === "ready";

  useDwellToClick(showCursor);

  useEffect(() => {
    const cursor = document.getElementById("cursor");
    if (cursor) {
      if (showCursor) {
        cursor.style.opacity = "1";
        cursor.style.pointerEvents = "none";
      } else {
        cursor.style.opacity = "0";
        cursor.style.pointerEvents = "none";
      }
    }
  }, [virtualCursorEnabled, isLoaded, boot]);

  // Handle fullscreen - move cursor into fullscreen container
  useEffect(() => {
    const handleFullscreenChange = () => {
      const cursor = document.getElementById("cursor");
      if (!cursor) return;

      const fullscreenElement = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.msFullscreenElement;

      if (fullscreenElement) {
        // Move cursor into fullscreen container if not already there
        if (cursor.parentElement !== fullscreenElement) {
          fullscreenElement.appendChild(cursor);
        }
        cursor.style.position = "fixed";
        cursor.style.zIndex = "9999";
      } else {
        // Move cursor back to body when exiting fullscreen
        if (cursor.parentElement !== document.body) {
          document.body.appendChild(cursor);
        }
        cursor.style.position = "fixed";
        cursor.style.zIndex = "60";
      }
    };

    // Check initial state
    handleFullscreenChange();

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
            opacity: 0,
            transform: "scaleX(-1)",
          }}
        />

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
            opacity: showCursor ? 1 : 0,
            transition: "opacity 0.3s ease-in-out",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

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

            <Route path="/camera-game" element={<CameraGame />} />

          <Route path="*" element={<div className="p-8">Page not found</div>} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Mini Vision Games</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Prototype
            </p>
        </div>
      </footer>

        <button
          onClick={() => setVirtualCursorEnabled(!virtualCursorEnabled)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-5 py-3 shadow-lg hover:shadow-xl transition-all hover:scale-105"
        >
          {virtualCursorEnabled ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-sky-600 dark:text-sky-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span className="text-sm font-semibold">Virtual Cursor ON</span>
              <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-slate-400 dark:text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                />
              </svg>
              <span className="text-sm font-semibold">Mouse/Keyboard</span>
              <div className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600"></div>
            </>
          )}
        </button>
      </div>
    </ThemeProvider>
  );
}
