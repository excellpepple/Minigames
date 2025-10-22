import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

//Animated user avatar with pulse effect
function UserAvatarSmall() {
  return (
    <button className="group inline-flex items-center gap-2">
      <div className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border-2 border-sky-400 bg-gradient-to-br from-sky-300 to-sky-500 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
        <span className="text-sm font-bold text-white">U</span>
        <div className="absolute inset-0 animate-pulse rounded-full bg-sky-300 opacity-0 group-hover:opacity-30"></div>
      </div>
      <span className="font-semibold text-sky-700 transition-all group-hover:text-sky-900 group-hover:underline">Profile</span>
    </button>
  );
}

//Enhanced modal with animation
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl animate-[slideUp_0.3s_ease-out] rounded-2xl bg-gradient-to-br from-white to-sky-50 p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="bg-gradient-to-r from-sky-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-lg border-2 border-sky-300 bg-white px-4 py-2 text-sm font-semibold text-sky-600 transition-all hover:scale-105 hover:border-sky-400 hover:bg-sky-50 hover:shadow-md"
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

//Super animated GameCard
function GameCard({ title, subtitle, icon, onPlay, onView, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="group relative animate-[slideUp_0.5s_ease-out] rounded-2xl border-2 border-sky-300 bg-gradient-to-br from-white to-sky-50 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-sky-400/0 to-purple-400/0 opacity-0 transition-opacity duration-300 group-hover:from-sky-400/10 group-hover:to-purple-400/10 group-hover:opacity-100"></div>
      
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <h3 className="text-2xl font-bold text-slate-800 transition-colors group-hover:text-sky-700">{title}</h3>
          <span className="rounded-full bg-gradient-to-r from-sky-400 to-purple-400 px-3 py-1 text-xs font-bold text-white shadow-md">{subtitle}</span>
        </div>

        <div className={`mb-4 text-5xl transition-all duration-300 ${isHovered ? 'scale-110 animate-bounce' : 'scale-100'}`}>
          {icon}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-slate-700">
          <span className="animate-[pulse_2s_ease-in-out_infinite] rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-green-100 px-3 py-1.5 text-sm font-semibold shadow-sm">
            🏆 Wins: <strong className="text-green-700">0</strong>
          </span>
          <span className="animate-[pulse_2s_ease-in-out_infinite_0.5s] rounded-lg border-2 border-rose-400 bg-gradient-to-r from-rose-50 to-rose-100 px-3 py-1.5 text-sm font-semibold shadow-sm">
            💔 Lost: <strong className="text-rose-700">0</strong>
          </span>
          <button
            onClick={onView}
            className="ml-auto font-semibold text-sky-600 underline-offset-2 transition-all hover:scale-105 hover:text-sky-800 hover:underline"
          >
            📊 Details
          </button>
        </div>

        {/*Play Now button navigation */}
        <button
          onClick={onPlay}
          className="relative w-full overflow-hidden rounded-xl border-2 border-sky-500 bg-gradient-to-r from-sky-500 to-purple-500 px-6 py-3 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <span className="relative z-10">▶️ Play Now!</span>
          <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"></div>
        </button>
      </div>
    </div>
  );
}

//Floating particle background
function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4
  }));

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute h-2 w-2 animate-[float_3s_ease-in-out_infinite] rounded-full bg-sky-300/40"
          style={{
            left: p.left,
            top: '-10px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`
          }}
        />
      ))}
    </div>
  );
}

//Main Games page with navigation
export default function Games() {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState("");
  const [notification, setNotification] = useState("");
  const navigate = useNavigate(); //hook for navigation

  function openDetails(title) {
    setSelectedGame(title);
    setDetailsOpen(true);
  }

  function handlePlay(game) {
    setNotification(`🎮 Launching ${game}...`);
    setTimeout(() => setNotification(""), 2000);
    navigate(`/play/${game.toLowerCase().replaceAll(" ", "-")}`); //navigate to GamePlay
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100">
      <FloatingParticles />
      
      {notification && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-[slideDown_0.3s_ease-out] rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 font-bold text-white shadow-2xl">
          {notification}
        </div>
      )}
      
      <div className="relative z-10 mx-auto max-w-5xl p-6">
        <div className="mb-6 flex animate-[slideDown_0.5s_ease-out] items-center justify-between">
          <UserAvatarSmall />
          <button 
            className="group inline-flex items-center gap-2 rounded-lg border-2 border-sky-400 bg-white px-4 py-2 font-semibold text-sky-600 shadow-md transition-all hover:scale-105 hover:bg-sky-50 hover:shadow-lg"
            onClick={() => navigate("/")}
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Back to Home
          </button>
        </div>

        <div className="animate-[slideUp_0.6s_ease-out] rounded-3xl bg-gradient-to-br from-purple-200/80 via-sky-200/80 to-pink-200/80 p-10 shadow-2xl backdrop-blur-sm">
          <div className="mb-8 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-sky-600 via-purple-600 to-pink-600 bg-clip-text text-5xl font-black text-transparent animate-[pulse_2s_ease-in-out_infinite]">
              🎮 Game Selection 🎮
            </h1>
            <p className="text-lg font-semibold text-slate-700">
              Pick your challenge and let the games begin! 🚀
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <GameCard
              title="Rock Paper Scissors"
              subtitle="Easy"
              icon="✊ ✋ ✌️"
              onPlay={() => handlePlay("Rock Paper Scissors")}
              onView={() => openDetails("Rock Paper Scissors")}
            />
            <GameCard
              title="Emoji Challenge"
              subtitle="Medium"
              icon="🙂 😐 🙁"
              onPlay={() => handlePlay("Emoji Challenge")}
              onView={() => openDetails("Emoji Challenge")}
              delay={100}
            />
            <GameCard
              title="Flappy Bird"
              subtitle="Medium"
              icon="🐦"
              onPlay={() => handlePlay("Flappy Bird")}
              onView={() => openDetails("Flappy Bird")}
              delay={200}
            />
            <GameCard
              title="Pose Runner"
              subtitle="Hard"
              icon="🏃‍♂️🟦"
              onPlay={() => handlePlay("Pose Runner")}
              onView={() => openDetails("Pose Runner")}
              delay={300}
            />
          </div>
        </div>
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title={`${selectedGame} — Stats`}>
        <div className="space-y-4">
          <p className="text-center text-lg text-slate-600">
            🎯 No stats available yet — start playing to track your progress!
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-gradient-to-br from-green-100 to-green-200 p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-green-700">0</div>
              <div className="text-sm text-green-600">Games Won</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-rose-700">0</div>
              <div className="text-sm text-rose-600">Games Lost</div>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-sky-100 to-sky-200 p-4 text-center shadow-md">
              <div className="text-3xl font-bold text-sky-700">0</div>
              <div className="text-sm text-sky-600">Total Played</div>
            </div>
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
          10%, 90% { opacity: 0.5; }
          100% { transform: translateY(100vh) translateX(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
