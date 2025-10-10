import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // helper to store user info in localStorage
  function saveUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  function handleSubmit(e) {
    e.preventDefault();
    saveUser({ username }); // store username locally
    nav("/games"); // redirect to the game page
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-3xl rounded-xl bg-purple-100 p-2">
        <h1 className="mb-8 text-center text-6xl font-extrabold text-black">
          Log In
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-2xl space-y-6"
        >
          <div>
            <label className="mb-2 block text-base font-semibold text-slate-600">
              Username
            </label>
            <input
              className={input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-600">
              Password
            </label>
            <input
              type="password"
              className={input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!username || !password}
            className={btn}
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sky-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}