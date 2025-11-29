import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";
const btn =
  "w-full rounded-md border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-800 px-6 py-3 text-lg font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-400 dark:hover:bg-sky-500 hover:text-white disabled:opacity-50";

export default function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // We dont use Cognitos API directly in this file. For security, the login calls must be made from the backend.
    // For now, loginBackend.js needs to be ran on port 4000 for login functionality to work.
    try {
      const response = await fetch("http://localhost:4000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      // TODO: once AWS Cognito session tokens are available, add them here
      nav("/games");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-3xl rounded-xl bg-white dark:bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-8 text-center text-6xl font-extrabold text-black dark:text-slate-100">
          Log In
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-2xl space-y-6"
        >
          {error && (
            <div className="rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-600 dark:text-slate-300">
              Username
            </label>
            <input
              type="text"
              className={input}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-600 dark:text-slate-300">
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
            className={btn}
            disabled={!username || !password || loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sky-600 dark:text-sky-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}