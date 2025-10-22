import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Simple placeholder for user info
function UserAvatarSmall() {
  return (
    <Link to="/profile-setup" className="inline-flex items-center gap-2">
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-sky-300 bg-white">
        <span className="text-xs font-semibold text-sky-700">U</span>
      </div>
      <span className="text-sky-700 hover:underline">Profile</span>
    </Link>
  );
}

// Modal for viewing details
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-xl bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50"
            >
              Close
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// GameCard component
function GameCard({ title, subtitle, icon, onPlay, onView }) {
  return (
    <div className="rounded-2xl border border-sky-200 bg-white p-6">
      <div className="mb-3 flex items-start justify-between">
        <h3 className="text-2xl font-semibold">{title}</h3>
        <span className="text-sm text-slate-500">{subtitle}</span>
      </div>

      <div className="mb-4 text-3xl">{icon}</div>

      <div className="mb-4 flex flex-wrap items-center gap-4 text-slate-700">
        <span className="rounded-md border border-green-300 bg-green-50 px-2 py-1 text-sm">
          Wins: <strong>0</strong>
        </span>
        <span className="rounded-md border border-rose-300 bg-rose-50 px-2 py-1 text-sm">
          Lost games: <strong>0</strong>
        </span>
        <button
          onClick={onView}
          className="ml-auto text-sky-700 underline-offset-2 hover:underline"
        >
          View more details
        </button>
      </div>

      <button
        onClick={onPlay}
        className="rounded-md border-2 border-sky-400 bg-white px-4 py-2 font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white"
      >
        Play
      </button>
    </div>
  );
}

// Main Games page
export default function Games() {
  const nav = useNavigate();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");

  function openDetails(title) {
    setSelectedGame(title);
    setDetailsOpen(true);
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <UserAvatarSmall />
        <Link to="/" className="text-sky-600 hover:underline">
          ← Back to Home
        </Link>
      </div>

      <div className="rounded-xl bg-[#efe4fb] p-10">
        <h1 className="mb-6 text-4xl font-bold">Game Selection</h1>
        <p className="mb-8 text-slate-600">Pick a game to play! (front-end only for now)</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <GameCard
            title="Rock • Paper • Scissors"
            subtitle="Easy"
            icon="✊ ✋ ✌️"
            onPlay={() => nav("/play/rps")}
            onView={() => openDetails("Rock • Paper • Scissors")}
          />
          <GameCard
            title="Emoji Challenge"
            subtitle="Medium"
            icon="🙂 😐 🙁"
            onPlay={() => nav("/play/emoji-challenge")}
            onView={() => openDetails("Emoji Challenge")}
          />
          <GameCard
            title="Flappy Bird"
            subtitle="Medium"
            icon="🐦"
            onPlay={() => nav("/play/flappy-bird")}
            onView={() => openDetails("Flappy Bird")}
          />
          <GameCard
            title="Pose Runner"
            subtitle="Hard"
            icon="🏃‍♂️🟦"
            onPlay={() => nav("/play/pose-runner")}
            onView={() => openDetails("Pose Runner")}
          />
        </div>
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={`${selectedGame} — Stats`}>
        <p className="text-slate-600">No stats available yet (front-end only).</p>
      </Modal>
    </div>
  );
}
