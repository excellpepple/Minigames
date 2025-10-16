import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

const btn =
  "rounded-md border-2 border-sky-400 bg-white px-10 py-3 text-2xl font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white";

const GAME_META = {
  "rps": { title: "Rock, Paper, Scissors", icons: "✊ ✋ ✌️" },
  "emoji-challenge": { title: "Emoji Challenge", icons: "🙂 😐 🙁" },
  "flappy-bird": { title: "Flappy Bird", icons: "🐦" },
  "pose-runner": { title: "Pose Runner", icons: "🏃‍♂️🟦" },
};

export default function GamePlay() {
  const { slug } = useParams();
  const meta = GAME_META[slug] || { title: "Game", icons: "🎮" };

  const [your, setYour] = useState(0);
  const [ai, setAi] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  function startGame() {
    setIsPlaying(true);
    setYour(0);
    setAi(0);
    // You could add logic here to start the actual game later
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="mb-4 text-2xl font-semibold text-slate-700">Game</h2>

      <div className="relative rounded-xl bg-purple-100 p-6 md:p-8">
        {/* top-left scores */}
        <div className="text-sm md:text-base">
          <div className="font-semibold">
            Your Score: <span className="font-normal">{your}</span>
          </div>
          <div className="font-semibold">
            AI Score: <span className="font-normal">{ai}</span>
          </div>
        </div>

        {/* top-right game info */}
        <div className="absolute right-4 top-4 rounded-md bg-white/70 p-3 text-right text-xs">
          <div className="mb-1 font-semibold">{meta.title}</div>
          <div>{meta.icons}</div>
        </div>

        {/* game area */}
        <div className="grid h-[60vh] place-items-center gap-4">
          {!isPlaying ? (
            <button onClick={startGame} className={btn}>
              Start
            </button>
          ) : (
            <p className="text-lg font-medium text-slate-700">
              Game in progress... (logic coming soon)
            </p>
          )}
        </div>

        {/* bottom-left back link */}
        <div className="absolute bottom-4 left-4 text-sm">
          <Link to="/games" className="text-sky-700 hover:underline">
            ← Back to Game Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
