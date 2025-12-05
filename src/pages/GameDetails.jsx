import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// Extended game metadata with descriptions, controls, and uploader info
const GAME_DATA = {
  "rock-paper-scissors": {
    title: "Rock Paper Scissors",
    icon: "✊ ✋ ✌️",
    difficulty: "Easy",
    tags: ["gesture", "vision", "prototype"],
    description: "Classic Rock Paper Scissors with a twist! Use hand gestures to play against the AI. Show your hand to the camera and let computer vision recognize your choice.",
    howToPlay: "Use hand gestures to make your choice:\n• ✊ Closed fist = Rock\n• ✋ Open palm = Paper\n• ✌️ Two fingers = Scissors\n\nHold your hand gesture steady for 1 second to lock in your choice. The AI will then reveal its move!",
    controls: "Hand Gestures (Vision-based)",
    controlsDetails: "Position yourself in front of the camera and hold your chosen gesture. The game uses computer vision to detect your hand shape.",
    uploader: {
      name: "Mini Vision Team",
      description: "Built by the Mini Vision Games team to showcase hands-free interaction capabilities.",
    },
    topScore: 0,
  },
  "emoji-challenge": {
    title: "Emoji Challenge",
    icon: "🙂 😐 🙁",
    difficulty: "Medium",
    tags: ["face", "expression", "vision"],
    description: "Test your facial expression skills! Match the emoji shown on screen by making the corresponding facial expression. Can you nail every expression?",
    howToPlay: "Watch the screen for an emoji. Make the matching facial expression:\n• 🙂 = Happy smile\n• 😐 = Neutral, no expression\n• 🙁 = Sad or disappointed\n\nThe camera will analyze your expression and give you points for accuracy!",
    controls: "Facial Expressions (Vision-based)",
    controlsDetails: "Use your face to express the shown emoji. The game uses facial recognition to detect your expressions in real-time.",
    uploader: {
      name: "Mini Vision Team",
      description: "A fun way to test facial recognition technology while having a good time!",
    },
    topScore: 0,
  },
  "flappy-bird": {
    title: "Flappy Bird",
    icon: "🐦",
    difficulty: "Medium",
    tags: ["pose", "fun", "classic"],
    description: "The classic Flappy Bird game. Use your nose to guide the bird through obstacles",
    howToPlay: "Control the bird with your nose:\n• Move your nose up and down to make the bird jump and duck \n• Navigate through the pipes without crashing. \n• Each successful pipe pass gives you 1 point!",
    controls: "Nose Detection",
    controlsDetails: "Use your nose to control the bird. Sit in front of the camera and move your nose up and down to make the bird jump and duck. The game tracks your pose in real-time.",
    uploader: {
      name: "Mini Vision Team",
      description: "A nostalgic classic with a modern twist - play with your nose!",
    },
    topScore: 0,
  },
  "bubble-popper": {
    title: "Bubble Popper",
    icon: "🫧",
    difficulty: "Easy",
    tags: ["bubbles", "fun", "gesture"],
    description: "Pop as many bubbles as you can! Pop them by hovering with your hand or tapping the screen.",
    howToPlay: "• Move your hand in front of the camera and use your index finger to make the cursor pop bubbles. \n• Each bubble pops instantly and new bubbles spawn. \n• Try to pop as many bubbles as you can in 30 seconds!",
    controls: "Hand gestures (Vision-based)",
    controlsDetails: "Use a tracked point (index finger) to aim. Hold steady over a bubble to pop or tap/click to pop.",
    uploader: {
      name: "Mini Vision Team",
      description: "A relaxing bubble popping game that demonstrates gesture-based interaction.",
    },
    topScore: 0,
  },
  "pose-runner": {
    title: "Pose Runner",
    icon: "🏃‍♂️",
    difficulty: "Hard",
    tags: ["pose", "hard", "prototype"],
    description: "An endless runner where you control the character with your body movements. Run in place, jump, and dodge obstacles using full-body pose detection!",
    howToPlay: "Use your body to control the runner:\n• Run in place = Move forward\n• Jump up = Jump over obstacles\n• Lean left/right = Move lanes\n• Duck/Squat = Slide under obstacles\n\nSurvive as long as you can and rack up points!",
    controls: "Full Body Pose Detection",
    controlsDetails: "This game uses advanced pose detection to track your entire body. Stand in front of the camera with enough space to move around. The game tracks your joints and movements in real-time.",
    uploader: {
      name: "Mini Vision Team",
      description: "Our most advanced game yet! Requires full-body tracking and lots of movement space.",
    },
    topScore: 0,
  },
};

export default function GameDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const game = GAME_DATA[slug] || GAME_DATA["rock-paper-scissors"];

  function handlePlay() {
    navigate(`/play/${slug}`);
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black">
      {/* Hero Section */}
      <div className="relative h-[50vh] overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 dark:from-black dark:via-slate-950 dark:to-black">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 text-7xl">{game.icon}</div>
            <h1 className="text-4xl font-bold text-white md:text-5xl">{game.title}</h1>
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur">
              {game.difficulty} difficulty
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50 dark:from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 pb-24">
        <div className="relative -mt-16 grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">About this game</h2>
              <p className="mb-6 whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">{game.description}</p>

              <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">How to play</h2>
              <p className="mb-6 whitespace-pre-line text-slate-700 dark:text-slate-300 leading-relaxed">{game.howToPlay}</p>

              <div className="mb-6 rounded-lg border border-sky-200 dark:border-sky-900 bg-sky-50 dark:bg-sky-900/20 p-4">
                <h3 className="mb-2 font-semibold text-sky-900 dark:text-sky-300">Controls: {game.controls}</h3>
                <p className="text-sm text-sky-800 dark:text-sky-300">{game.controlsDetails}</p>
              </div>

              {/* Uploader Section */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-slate-100">Uploaded by</h2>
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-200 dark:bg-slate-800 text-lg font-semibold text-slate-700 dark:text-slate-300">
                    {game.uploader.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">{game.uploader.name}</h3>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{game.uploader.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-4">
              {/* Stats Card */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Your Stats</h3>
                <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-4 py-3">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Top Score</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{game.topScore}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Play Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-900 bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              to="/games"
              className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              ← Back to Games
            </Link>
            <div className="hidden sm:block">
              <div className="font-semibold text-slate-900 dark:text-slate-100">{game.title}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">{game.difficulty} difficulty</div>
            </div>
          </div>
          <button
            onClick={handlePlay}
            data-clickable="true"
            className="rounded-lg bg-sky-600 dark:bg-sky-500 px-8 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-sky-700 dark:hover:bg-sky-600"
          >
            Play Now →
          </button>
        </div>
      </div>
    </div>
  );
}

