import React from "react";
import { Link } from "react-router-dom";

export default function Aboutpage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-10 shadow-lg text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-purple-800">About Mini Vision Games</h1>

        <p className="mb-6 text-lg text-slate-700 leading-relaxed">
          Welcome to <strong>Mini Vision Games</strong> — a fun and interactive web app
          where you can play mini games powered by computer vision and AI! 🎮✨
        </p>

        <p className="mb-6 text-slate-700 leading-relaxed">
          The project is built entirely with <strong>React</strong> and styled using{" "}
          <strong>Tailwind CSS</strong>. For now, authentication and results are handled
          locally on your device, but future updates will include real-time multiplayer
          and cloud storage for your progress.
        </p>

        <p className="text-slate-600 italic">
          Made with ❤️ by the Mini Vision Games Team.
        </p>

        <div className="mt-10">
          <Link
            to="/"
            className="rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
