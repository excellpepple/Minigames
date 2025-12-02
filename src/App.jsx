import React from "react";
import { Routes, Route, Link } from "react-router-dom";

import Homepage from "./pages/Homepage.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProfileSetup from "./pages/ProfileSetup.jsx";
import Games from "./pages/Games.jsx";
import GamePlay from "./pages/GamePlay.jsx";
import Aboutpage from "./pages/Aboutpage.jsx";
import FlappyBird from "./pages/FlappyBird.jsx";

export default function App() {
  return (
    <>
      <header className="p-4 bg-purple-50">
        <nav className="flex gap-4 text-sky-600 font-medium">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/login" className="hover:underline">Login</Link>
          <Link to="/signup" className="hover:underline">Sign Up</Link>
          <Link to="/games" className="hover:underline">Games</Link>
          <Link to="/about" className="hover:underline">About</Link>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile-setup" element={<ProfileSetup />} />
        <Route path="/games" element={<Games />} />
        <Route path="/play/:slug" element={<GamePlay />} />
        <Route path="/about" element={<Aboutpage />} />
        <Route path="/flappy-bird" element={<FlappyBird />} />
        <Route path="*" element={<div className="p-8">Page not found</div>} />
      </Routes>
    </>
  );
}