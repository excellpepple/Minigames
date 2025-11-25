import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.jsx";

export default function ProfileSetup() {
  const { isDark, toggleTheme } = useTheme();
  const nav = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState({ name: "", email: "", password: "", photo: "", emojiAvatar: "" });
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [chosenEmoji, setChosenEmoji] = useState(user.emojiAvatar || "");

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) {
      const parsed = JSON.parse(saved);
      setUser(parsed);
      setDisplayName(parsed.name || "");
      setUsername(parsed.email?.split("@")[0] || "");
    }
  }, []);

  useEffect(() => {
    // keep localStorage in sync
    localStorage.setItem("currentUser", JSON.stringify({ ...user, name: displayName, email: username ? `${username}@example.com` : user.email }));
  }, [user, displayName, username]);

  function handleContinue() {
    nav("/games");
  }

  function onPickPhoto() {
    fileInputRef.current?.click();
  }

  function onPhotoSelected(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setUser((u) => ({ ...u, photo: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

  const EMOJIS = [
    "🙂","😀","🥰","😎","🤩","😺","🐱","🐶","🦊","🐼","🐻","🐯","🦄","🐣","🌸","⭐️","🎮"
  ];

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-4xl rounded-xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="mb-8 flex items-start gap-6">
          <div className="relative flex items-center gap-3">
            <button onClick={() => setAvatarMenuOpen((v) => !v)} className="relative grid h-24 w-24 place-items-center overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-800 hover:ring-sky-300 dark:hover:ring-sky-500">
              {user.photo ? (
                <img src={user.photo} alt="profile" className="h-full w-full object-cover" />
              ) : user.emojiAvatar ? (
                <div className="grid h-full w-full place-items-center bg-white dark:bg-slate-800 text-5xl">{user.emojiAvatar}</div>
              ) : (
                <div className="grid h-full w-full place-items-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  <span className="text-sm font-medium">Upload</span>
                </div>
              )}
              <span className="pointer-events-none absolute bottom-1 right-1 rounded-full bg-white/90 dark:bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 shadow">Edit</span>
            </button>
            {avatarMenuOpen && (
              <div className="absolute left-0 top-[110%] z-50 w-56 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-md">
                <button onClick={() => { setAvatarMenuOpen(false); onPickPhoto(); }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Choose image…</button>
                <button onClick={() => { setAvatarMenuOpen(false); setEmojiPickerOpen(true); }} className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300">Choose emoji…</button>
              </div>
            )}
            {emojiPickerOpen && (
              <div className="absolute left-0 top-[110%] z-50 mt-2 w-64 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-md">
                <div className="mb-2 text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Pick an emoji</div>
                <select value={chosenEmoji} onChange={(e) => setChosenEmoji(e.target.value)} className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-2 py-2 text-sm text-slate-900 dark:text-slate-100">
                  <option value="">—</option>
                  {EMOJIS.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </select>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setEmojiPickerOpen(false)} className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-300">Cancel</button>
                  <button onClick={() => { setUser((u) => ({ ...u, emojiAvatar: chosenEmoji, photo: "" })); setEmojiPickerOpen(false); }} className="rounded-md bg-sky-600 dark:bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white">Use</button>
                </div>
              </div>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onPhotoSelected} />
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your Account</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Add a photo and update your info.</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="mb-8 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Theme</h3>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            type="button"
          >
            {isDark ? (
              <span className="text-xl">☀️</span>
            ) : (
              <span className="text-xl">🌙</span>
            )}
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Display name</label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none ring-sky-300 dark:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm outline-none ring-sky-300 dark:ring-sky-500 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 text-slate-900 dark:text-slate-100"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Password</label>
            <div className="flex items-center justify-between rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-800 dark:text-slate-200">
              <span className="tracking-widest">{"*".repeat(user.password?.length || 8)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">hidden</span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3">
          <button className="rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700">Edit later</button>
          <button
            onClick={handleContinue}
            className="rounded-md bg-sky-600 dark:bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 dark:hover:bg-sky-600"
          >
            Continue to Games
          </button>
        </div>
      </div>
    </div>
  );
}