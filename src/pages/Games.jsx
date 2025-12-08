import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { startCamera } from "../lib/tracking/camera.js";
import { initHoverClick } from "../lib/cursor/hoverClick.js";

function UserAvatarSmall({ onClick }) {
  return (
    <button onClick={onClick} data-clickable="true" aria-label="Open profile" className="group inline-flex items-center gap-2">
      <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <span className="text-sm font-semibold">U</span>
      </div>
      <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100">
        Profile
      </span>
    </button>
  );
}

// Super animated GameCard
function GameCard({ title, subtitle, icon, cover, tags = [], slug, onView, delay = 0, playerScores }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:-translate-y-1 hover:shadow-md transition-transform"
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
        {cover ? (
          <img src={cover} alt="cover" className="h-28 w-full object-cover" />
        ) : (
          <div className="relative h-28 w-full">
            {icon?.startsWith("/") ||
            icon?.startsWith("http") ||
            icon?.startsWith("./") ||
            icon?.startsWith("../") ? (
              <img
                src={icon}
                alt={title}
                className={`h-full w-full object-cover transition-transform ${
                  isHovered ? "scale-110" : "scale-100"
                }`}
              />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <div className={`text-4xl transition-transform ${isHovered ? "scale-110" : "scale-100"}`}>
                  {icon}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="text-xs text-slate-600 dark:text-slate-400">{subtitle} difficulty</p>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 my-3">
          {tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-slate-50 dark:bg-slate-800 border px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="mb-4 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
        Top Score: <span className="font-semibold text-slate-800 dark:text-slate-200">{playerScores[slug] || 0}</span>
      </div>

      <button
        data-clickable="true"
        onClick={onView}
        className="w-full rounded-lg bg-sky-600 dark:bg-sky-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700"
      >
        View Details →
      </button>
    </div>
  );
}

//
// MAIN PAGE
//
export default function Games() {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const cursorRef = useRef(null);

  const [cameraError, setCameraError] = useState(false);
  const [cursorBoot, setCursorBoot] = useState("init");

  const reducedMotion = useMemo(() => {
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

  const GAMES = [
    { title: "Rock Paper Scissors", subtitle: "Easy", icon: "/game_covers/RPS.png", slug: "rock-paper-scissors", tags: ["gesture", "vision", "prototype"] },
    { title: "Flappy Bird", subtitle: "Medium", icon: "/game_covers/Birdie.png", slug: "flappy-bird", tags: ["pose", "fun", "classic"] },
    { title: "Bubble Popper", subtitle: "Easy", icon: "/game_covers/Bubbles.png", slug: "bubble-popper", tags: ["bubbles", "fun", "gesture"] },
  ];

  // Initialize user state from localStorage
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved
      ? JSON.parse(saved)
      : { name: "", email: "", photo: "", emojiAvatar: "", userDescription: "", cognitoSub: "" };
  });

  const [playerScores, setPlayerScores] = useState({});


  // Get current player's scores for all games in this ^^^ list.
 useEffect(() => {
  if (!user.cognitoSub) return; // make sure we have a logged-in user

  async function fetchScores() {
    try {
      const scores = {};

      // Iterate through all games by slug
      for (const game of GAMES) {
        const res = await fetch(`http://localhost:5001/playerStats/${game.slug}/${user.cognitoSub}`);
        if (res.ok) {
          const data = await res.json();
          scores[game.slug] = data.highScore || 0; // save high score
        } else {
          scores[game.slug] = 0; // no stats found yet
        }
      }

      setPlayerScores(scores);
      // Add the players scores into local storage
      localStorage.setItem("playerScores", JSON.stringify(scores));
    } catch (err) {
      console.error("Error fetching player scores:", err);
    }
  }

  fetchScores();
}, [user.cognitoSub]);



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
    let stream;
    async function init() {
      try {
        await startCamera(videoRef.current);
        stream = videoRef.current.srcObject;
      } catch {
        setCameraError(true);
      }
    }
    init();
    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  //
  // LOAD HAND TRACKING ENGINE
  //
  useEffect(() => {
    let cancelled = false;

    async function loadTracking() {
      try {
        setCursorBoot("loading");

        const waitForHolistic = (timeout = 12000) =>
          new Promise((resolve, reject) => {
            const start = Date.now();
            (function check() {
              if (cancelled) return;
              const ok = window.Holistic || (window.holistic && window.holistic.Holistic);
              if (ok) return resolve();
              if (Date.now() - start > timeout) return reject("Holistic timeout");
              requestAnimationFrame(check);
            })();
          });

        await waitForHolistic();
        await new Promise((r) => setTimeout(r, 200));

        const url = new URL("../lib/tracking/main.js", import.meta.url).href;
        await import(/* @vite-ignore */ url);

        setCursorBoot("ready");
      } catch (e) {
        console.error("Games page tracking failed:", e);
        setCursorBoot("error");
      }
    }

    loadTracking();
    return () => (cancelled = true);
  }, []);

  //
  // ENABLE DWELL CLICK
  //
  useEffect(() => {
    if (cursorBoot !== "ready") return;
    const cleanup = initHoverClick("#cursor", 600);
    return cleanup;
  }, [cursorBoot]);

  //
  // RENDER
  //
  return (
    <div className="relative min-h-screen">

      {/* Hand-tracking cursor */}
      <div
        id="cursor"
        ref={cursorRef}
        className="pointer-events-none absolute"
        style={{
          width: 22,
          height: 22,
          borderRadius: "9999px",
          background: "rgba(255,255,255,0.9)",
          boxShadow: "0 0 0 2px rgba(59,130,246,0.9)",
          zIndex: 9999,
        }}
      />

      {/* Banner */}
      <section className="relative h-[46vh] overflow-hidden rounded-xl bg-slate-100">
        {!cameraError && (
          <video
            ref={videoRef}
            id="video-games"
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 to-slate-900/60 pointer-events-none" />

        {!reducedMotion && (
          <div className="absolute inset-0" style={{ zIndex: 10 }}>
            {bubbles.map((b, i) =>
              b.popped ? null : (
                <button
                  key={b.id}
                  onClick={() =>
                    setBubbles((prev) =>
                      prev.map((x) => (x.id === b.id ? { ...x, popped: true } : x))
                    )
                  }
                  className="absolute rounded-full bg-white/30 backdrop-blur-[1.5px]"
                  data-clickable="true"
                  style={{
                    left: `${b.xPct}%`,
                    top: `${b.yPct}%`,
                    width: `${b.r * 2}px`,
                    height: `${b.r * 2}px`,
                    marginLeft: `-${b.r}px`,
                    marginTop: `-${b.r}px`,
                    animation: `float ${5 + (i % 4)}s ease-in-out infinite`,
                  }}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* Main list */}
      <div className="relative z-10 mx-auto max-w-6xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <UserAvatarSmall onClick={() => navigate("/profile-setup")} />
          <button
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            onClick={() => navigate("/")}
            data-clickable="true"
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
                playerScores={playerScores}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-md border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-10 text-center text-sm text-slate-600 dark:text-slate-400">No games match your search.</div>
            )}
          </div>
        </div>
        <GameList GAMES={GAMES} openDetails={(slug) => navigate(`/game/${slug}`)} />
      </div>
    </div>
  );
}

//
// GAME LIST
//
function GameList({ GAMES, openDetails }) {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const allTags = Array.from(new Set(GAMES.flatMap((g) => g.tags))).sort();

  const filtered = GAMES.filter((g) => {
    const q = query.toLowerCase();
    return (!q || g.title.toLowerCase().includes(q)) && (!tagFilter || g.tags.includes(tagFilter));
  });

  return (
    <div className="rounded-xl border bg-white/90 dark:bg-slate-900/90 p-6">
      <div className="flex gap-4 flex-wrap mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search games…"
          className="border px-3 py-2 rounded-md text-sm flex-1"
        />
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="border px-3 py-2 rounded-md text-sm"
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g, idx) => (
          <GameCard key={g.slug} {...g} delay={idx * 60} onView={() => openDetails(g.slug)} />
        ))}
      </div>
    </div>
  );
}
