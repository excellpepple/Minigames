import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); 
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function saveUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

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
        body: JSON.stringify({ username, password }), // <-- send username
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Login failed");

      saveUser({
        username,
        accessToken: data.AccessToken,
        idToken: data.IdToken,
        refreshToken: data.RefreshToken,
      });

      navigate("/games");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Input Forms
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-3xl rounded-xl bg-purple-100 p-4">
        <h1 className="mb-8 text-center text-6xl font-extrabold text-black">
          Log In
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mx-auto w-full max-w-2xl space-y-6"
        >
          {error && <div className="text-red-600 font-semibold">{error}</div>}

          <div>
            <label className="mb-2 block text-base font-semibold text-slate-600">
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
            className={btn}
            disabled={!username || !password || loading}
          >
            {loading ? "Logging in..." : "Login"}
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
