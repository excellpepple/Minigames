import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // helper to store basic user info locally
  function saveUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  }

  function handleSubmit(e) {
    e.preventDefault();
    saveUser({ name, email });
    nav("/profile-setup");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-md rounded-xl bg-purple-100 p-2">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-black">
          Sign Up
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className={input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            className={input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className={input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={!name || !email || !password}
            className={btn}
          >
            Sign Up
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
