import React, { useState, useEffect, useRef } from "react";
import CameraGame from "./CameraGame.jsx";
import BubblePop from "./BubblePop.jsx";
import { useParams, useNavigate } from "react-router-dom";

// Common Tailwind CSS button styles for reusability
const buttonStyle =
  "rounded-md border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-900 px-10 py-3 text-2xl font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-400 dark:hover:bg-sky-500 hover:text-white";

// Stores metadata for each game (title + icons)
const GAME_DETAILS = {
  "rock-paper-scissors": { title: "Rock Paper Scissors", icons: "✊ ✋ ✌️" },
  "emoji-challenge": { title: "Emoji Challenge", icons: "🙂 😐 🙁" },
  "flappy-bird": { title: "Flappy Bird", icons: "🐦" },
  "bubble-popper": { title: "Bubble Popper", icons: "🫧" },
  "pose-runner": { title: "Pose Runner", icons: "🏃‍♂️" },
};

export default function GamePlay() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const currentGame = GAME_DETAILS[slug] || { title: "Game", icons: "🎮" };

  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0); // session-only high score
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Enter fullscreen when game starts
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

  // Exit fullscreen when leaving
  useEffect(() => {
    return () => {
      if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
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
    setGameEnded(false);
    setPlayerScore(0);
    setComputerScore(0);
  }

  function handleGameEnd(finalScore) {
    setGameEnded(true);
    setIsGameActive(false);
    if (finalScore > highestScore) {
      setHighestScore(finalScore);
    }
  }

  function handleScoreUpdate(newScore) {
    setPlayerScore(newScore);
    // Update highest score if current score exceeds it (for bubble-popper only)
    if (slug === "bubble-popper" && newScore > highestScore) {
      setHighestScore(newScore);
    }
  }

  function handleGoBack() {
    // Exit fullscreen before navigating
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    navigate("/games");
  }

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-slate-50 dark:bg-black">
      {/* Top Right Corner - Scores and Menu */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-3">
        {/* Score Display - Top Right */}
        {(isGameActive || gameEnded) && slug !== "flappy-bird" && (
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 dark:border-slate-900 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-4 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Your Score</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{playerScore}</div>
              </div>
              {slug !== "bubble-popper" && (
                <>
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">AI Score</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{computerScore}</div>
              </div>
                </>
              )}
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Highest</div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{highestScore}</div>
              </div>
            </div>
          </div>
        )}

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
          aria-label="Menu"
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-6 bg-slate-700 dark:bg-slate-300 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </div>
        </button>
      </div>

      {/* Menu Dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed top-20 right-4 z-50 w-48 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl">
            <button
              onClick={handleGoBack}
              className="w-full rounded-t-lg px-4 py-3 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              ← Go Back to Games
            </button>
          </div>
        </>
      )}

      {/* Main Game Content */}
      <div className="flex h-full flex-col items-center justify-center p-6">
        {!isGameActive ? (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">{currentGame.title}</h1>
              <p className="mt-2 text-2xl text-slate-600 dark:text-slate-400">{currentGame.icons}</p>
            </div>
            <button onClick={handleStartGame} className={buttonStyle}>
              Start Game
            </button>
          </>
        ) : gameEnded ? (
          <div className="w-full max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-100">Game Over!</h2>
            <div className="mb-6 space-y-2">
              <div className="text-xl text-slate-600 dark:text-slate-400">Final Score</div>
              <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{playerScore}</div>
              <div className="text-lg text-slate-600 dark:text-slate-400">High Score: {highestScore}</div>
            </div>
            <button onClick={handleStartGame} className={buttonStyle}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {slug === "flappy-bird" ? (
              <CameraGame />
            ) : slug === "bubble-popper" ? (
              <BubblePop onGameEnd={handleGameEnd} onScoreUpdate={handleScoreUpdate} />
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
    </div>
  );
}
