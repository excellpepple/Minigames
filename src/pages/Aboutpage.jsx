import React from "react";
import { Link } from "react-router-dom";

//About Page
export default function Aboutpage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 p-10 shadow-lg text-center">
        <h1 className="mb-6 text-5xl font-extrabold text-purple-800 dark:text-purple-400">About Mini Vision Games</h1>

        <p className="mb-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
          Welcome to <strong>Mini Vision Games</strong> — a fun and interactive web app
          where you can play mini games powered by computer vision and AI! 🎮✨
        </p>

        <p className="mb-6 text-slate-700 dark:text-slate-300 leading-relaxed">
          The project is built entirely with <strong>React</strong> and styled using{" "}
          <strong>Tailwind CSS</strong>. For now, authentication and results are handled
          locally on your device, but future updates will include real-time multiplayer
          and cloud storage for your progress.
        </p>

        <p className="text-slate-600 dark:text-slate-400 italic">
          Made with ❤️ by the Mini Vision Games Team.
        </p>

        <div className="mt-10">
          <Link
            to="/"
            className="rounded-md border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-900 px-6 py-3 text-lg font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-400 dark:hover:bg-sky-500 hover:text-white"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}