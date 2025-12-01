import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import CameraGame from "./CameraGame.jsx";
import CameraBubble from "./CameraBubble.jsx";

//Common Tailwind CSS button styles for reusability
const buttonStyle =
  "rounded-md border-2 border-sky-400 bg-white px-10 py-3 text-2xl font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white";

//Stores metadata for each game (title + icons)
const GAME_DETAILS = {
  "rps": { title: "Rock, Paper, Scissors", icons: "✊ ✋ ✌️" },
  "emoji-challenge": { title: "Emoji Challenge", icons: "🙂 😐 🙁" },
  "flappy-bird": { title: "Flappy Bird", icons: "🐦" },
  "pose-runner": { title: "Pose Runner", icons: "🏃‍♂️🟦" },
};

export default function GamePlay() {
  const { slug } = useParams();
  const currentGame = GAME_DETAILS[slug] || { title: "Game", icons: "🎮" };

  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isGameActive && containerRef.current) {
      const element = containerRef.current;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.error("Error attempting to enable fullscreen:", err);
        });
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  }, [isGameActive]);

  useEffect(() => {
    return () => {
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      ) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      }
    };
  }, []);

  function handleStartGame() {
    setIsGameActive(true);
    setPlayerScore(0);
    setComputerScore(0);
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="mb-4 text-2xl font-semibold text-slate-700">
        Game
      </h2>

      <div className="relative rounded-xl bg-purple-100 p-6 md:p-8" ref={containerRef}>
        {/*Score display section */}
        <div className="text-sm md:text-base">
          <div className="font-semibold">
            Your Score: <span className="font-normal">{playerScore}</span>
          </div>
          <div className="font-semibold">
            AI Score: <span className="font-normal">{computerScore}</span>
          </div>
        </div>

        {/*Game info in top-right corner */}
        <div className="absolute right-4 top-4 rounded-md bg-white/70 p-3 text-right text-xs">
          <div className="mb-1 font-semibold">{currentGame.title}</div>
          <div>{currentGame.icons}</div>
        </div>

        {/*Main game area */}
        <div className="grid h-[60vh] place-items-center gap-4">
          {!isGameActive ? (
            <button onClick={handleStartGame} className={buttonStyle}>
              Start
            </button>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {slug === "flappy-bird" ? (
                <CameraGame />
              ) : slug === "bubble-popper" ? (
                <CameraBubble />
              ) : (
                <div className="w-full max-w-6xl h-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Game in progress... (logic coming soon)
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/*Back to games link */}
        <div className="absolute bottom-4 left-4 text-sm">
          <Link to="/games" className="text-sky-700 hover:underline">
            ← Back to Game Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
