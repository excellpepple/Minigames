import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startCamera } from "../../lib/tracking/camera.js";

//Animated user avatar with pulse effect
function UserAvatarSmall({ onClick }) {
  return (
    <button onClick={onClick} data-clickable="true" aria-label="Open profile" className="group inline-flex items-center gap-2">
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <span className="text-sm font-semibold">U</span>
      </div>
      <span className="font-semibold text-slate-700 dark:text-slate-300 transition-colors group-hover:text-slate-900 dark:group-hover:text-slate-100">Profile</span>
    </button>
  );
}

// Super animated GameCard
function GameCard({ title, subtitle, icon, cover, tags = [], slug, onView, delay = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover */}
      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
        {cover ? (
          <img src={cover} alt="cover" className="h-28 w-full object-cover" />
        ) : (
          <div className="relative grid h-28 w-full place-items-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900">
            <div className={`text-4xl transition-transform ${isHovered ? "scale-110" : "scale-100"}`}>{icon}</div>
          </div>
        )}
      </div>

      {/* Title + subtitle */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle} difficulty</p>
        </div>
      </div>

      {/* Tags */}
      {tags?.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">{t}</span>
          ))}
        </div>
      )}

      <div className="mb-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
        Top Score: <span className="font-semibold text-slate-800 dark:text-slate-200">0</span>
      </div>

      <button
        data-clickable="true"
        onClick={onView}
        className="w-full rounded-lg bg-sky-600 dark:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 dark:hover:bg-sky-600"
      >
        View Details →
      </button>
    </div>
  );
}

//Main Games page with navigation
export default function Games() {
  const navigate = useNavigate(); //hook for navigation
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);
  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      xPct: 8 + ((i * 12) % 84),
      yPct: 20 + ((i * 9) % 40),
      r: 16 + (i % 3) * 6,
      popped: false,
    }))
  );

  // Local data for cards
    const GAMES = [
    { title: "Rock Paper Scissors", subtitle: "Easy", icon: "✊ ✋ ✌️", slug: "rock-paper-scissors", tags: ["gesture", "vision", "prototype"] },
    { title: "Emoji Challenge", subtitle: "Medium", icon: "🙂 😐 🙁", slug: "emoji-challenge", tags: ["face", "expression", "vision"] },
    { title: "Flappy Bird", subtitle: "Medium", icon: "🐦", slug: "flappy-bird", tags: ["pose", "fun", "classic"] },
      { title: "Bubble Popper", subtitle: "Easy", icon: "🫧", slug: "bubble-popper", tags: ["bubbles", "fun", "gesture"] },
    { title: "Pose Runner", subtitle: "Hard", icon: "🏃‍♂️🟦", slug: "pose-runner", tags: ["pose", "hard", "prototype"] },
  ];

  // Filters
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const allTags = useMemo(() => {
    const set = new Set();
    GAMES.forEach(g => g.tags?.forEach(t => set.add(t)));
    return Array.from(set).sort();
  }, []);
  const filtered = GAMES.filter(g => {
    const q = query.trim().toLowerCase();
    const matchesQ = !q || g.title.toLowerCase().includes(q) || g.subtitle.toLowerCase().includes(q) || g.tags?.some(t => t.includes(q));
    const matchesTag = !tagFilter || g.tags?.includes(tagFilter);
    return matchesQ && matchesTag;
  });

  useEffect(() => {
    let stream = null;
    async function initCamera() {
      if (!videoRef.current) return;
      try {
        await startCamera(videoRef.current);
        stream = videoRef.current.srcObject;
        setIsLoaded(true);
      } catch (err) {
        setCameraError(true);
      }
    }
    if (navigator.mediaDevices?.getUserMedia) initCamera();
    else setCameraError(true);
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Dwell-to-click using homepage virtual cursor if present
  useEffect(() => {
    const cursorEl = typeof document !== "undefined" ? document.getElementById("cursor") : null;
    if (!cursorEl) return;
    let rafId = 0;
    let lastTarget = null;
    let lastStart = 0;
    const DWELL_MS = 600;
    const isClickable = (el) => !!(el?.matches && el.matches("button, a, [data-clickable], [role='button']"));
    const findClickable = (el) => { while (el) { if (isClickable(el)) return el; el = el.parentElement; } return null; };
    const loop = () => {
      try {
        const rect = cursorEl.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let target = document.elementFromPoint(cx, cy);
        const clickable = findClickable(target);
        const now = performance.now();
        if (clickable !== lastTarget) { lastTarget = clickable; lastStart = now; }
        else if (clickable && now - lastStart >= DWELL_MS) {
          clickable.click?.();
          lastStart = now + 1e9;
          setTimeout(() => { lastStart = performance.now(); }, 350);
        }
      } catch {}
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  function openDetails(slug) {
    navigate(`/game/${slug}`);
  }

  const scrollUp = () => {
    window.scrollBy({ top: -300, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollBy({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-screen">
      <section className="relative h-[46vh] overflow-hidden rounded-xl bg-slate-100">
        {!cameraError ? (
          <>
            <video
              ref={videoRef}
              id="video-games"
              autoPlay
              playsInline
              muted
              className="absolute inset-0 h-full w-full object-cover"
              style={{ transform: "scaleX(-1)" }}
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-slate-900/40 via-slate-900/30 to-slate-900/60" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900" />
        )}

        {!reducedMotion && (
          <div className="absolute inset-0" style={{ zIndex: 2 }}>
            {bubbles.map((b, i) =>
              b.popped ? null : (
                <button
                  key={b.id}
                  onClick={() => setBubbles((prev) => prev.map((x) => (x.id === b.id ? { ...x, popped: true } : x)))}
                  className="absolute rounded-full bg-white/30 backdrop-blur-[1.5px] transition-transform hover:scale-105"
                  style={{
                    left: `${b.xPct}%`,
                    top: `${b.yPct}%`,
                    width: `${b.r * 2}px`,
                    height: `${b.r * 2}px`,
                    marginLeft: `-${b.r}px`,
                    marginTop: `-${b.r}px`,
                    boxShadow: "inset 0 0 22px rgba(255,255,255,0.35), 0 6px 18px rgba(0,0,0,0.12)",
                    animation: `float ${5 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
                  }}
                  aria-label="Pop bubble"
                  data-clickable="true"
                />
              )
            )}
          </div>
        )}

        <div className="relative z-10 flex h-full items-end">
          <div className="w-full p-8">
            <div className="flex items-end justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Discover Games</h1>
                <p className="mt-1 max-w-xl text-sm text-white/85">Pick a game and play hands‑free. Use tags and search to filter.</p>
              </div>
              <div className="hidden sm:block rounded-md bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">Beta</div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        `}</style>
      </section>
      
      <div className="relative z-10 mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <UserAvatarSmall onClick={() => navigate("/profile-setup")} />
          <button 
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => navigate("/")}
          >
            ← Back to Home
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Game Selection</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Choose a game to get started.</p>
            </div>
            <div className="flex w-full max-w-xl flex-col gap-3 md:flex-row md:items-center">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games…"
                className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none ring-sky-300 dark:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 text-slate-900 dark:text-slate-100"
              />
              <select
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none ring-sky-300 dark:ring-sky-500 focus:ring-2 text-slate-900 dark:text-slate-100"
              >
                <option value="">All tags</option>
                {allTags.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g, idx) => (
              <GameCard
                key={g.slug}
                title={g.title}
                subtitle={g.subtitle}
                icon={g.icon}
                tags={g.tags}
                slug={g.slug}
                onView={() => openDetails(g.slug)}
                delay={idx * 60}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-10 text-center text-sm text-slate-600 dark:text-slate-400">No games match your search.</div>
            )}
          </div>
        </div>
      </div>


      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Scroll Buttons - Fixed position for virtual cursor */}
      <div className="fixed right-6 top-1/2 z-50 flex flex-col gap-4 -translate-y-1/2">
        <button
          onClick={scrollUp}
          data-clickable="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 hover:bg-sky-50 dark:hover:bg-sky-900/30"
          aria-label="Scroll up"
          title="Scroll up"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-slate-700 dark:text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onClick={scrollDown}
          data-clickable="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:scale-110 hover:bg-sky-50 dark:hover:bg-sky-900/30"
          aria-label="Scroll down"
          title="Scroll down"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-slate-700 dark:text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}