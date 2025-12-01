import React, { useState } from "react";
import { Link, useParams } from "react-router-dom";

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
  //Extracts the dynamic part of the route (like /games/:slug)
  const { slug } = useParams();

  //Gets the metadata for the current game from GAME_DETAILS
  //If no match, defaults to a generic game
  const currentGame = GAME_DETAILS[slug] || { title: "Game", icons: "🎮" };

  //Player's current score
  const [playerScore, setPlayerScore] = useState(0);

  //AI opponent's current score
  const [computerScore, setComputerScore] = useState(0);

  //Boolean flag to track if the game is running
  const [isGameActive, setIsGameActive] = useState(false);

  //Starts or restarts the game
  function handleStartGame() {
    setIsGameActive(true);     //sets game as active
    setPlayerScore(0);         //resets player score
    setComputerScore(0);       //resets AI score
    //later: trigger actual game logic (e.g., animations, rounds, etc.)
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="mb-4 text-2xl font-semibold text-slate-700">
        Game
      </h2>

      <div className="relative rounded-xl bg-purple-100 p-6 md:p-8">
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
            <p className="text-lg font-medium text-slate-700">
              Game in progress... (logic coming soon)
            </p>
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
