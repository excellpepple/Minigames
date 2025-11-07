import React from "react";
import { Routes, Route, NavLink, Link } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";
import Games from "./pages/Games.jsx";
import GamePlay from "./pages/GamePlay.jsx";
import GameDetails from "./pages/GameDetails.jsx";
import Aboutpage from "./pages/Aboutpage.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-800 dark:text-slate-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 rounded-md bg-white dark:bg-slate-900 px-3 py-2 text-sm font-semibold text-sky-700 dark:text-sky-400 shadow">Skip to content</a>

      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-black/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-black/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-sky-500 to-purple-500 text-white shadow">MV</span>
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
                    isActive ? "text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-900/30" : "text-slate-600 dark:text-slate-300"
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
          <Route path="*" element={<div className="p-8">Page not found</div>} />
        </Routes>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white/60 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 text-sm text-slate-600 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Mini Vision Games</p>
          <p className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Prototype</p>
        </div>
      </footer>
      </div>
    </ThemeProvider>
  );
}