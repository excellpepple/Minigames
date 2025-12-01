import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const nav = useNavigate();
  const [user, setUser] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    const saved = localStorage.getItem("currentUser");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  function handleContinue() {
    nav("/games");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="flex flex-col items-center md:flex-row md:items-center md:justify-center gap-16 w-full max-w-5xl">
        {/* Profile photo and title */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="h-48 w-48 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-lg mb-6 shadow-md">
            Photo
          </div>
          <h1 className="text-5xl font-extrabold text-black">Your Account</h1>
        </div>

        {/* User info */}
        <div className="flex flex-col items-center md:items-start text-lg text-sky-700 space-y-8 w-full max-w-md">
          <div className="w-full border-2 border-sky-400 rounded-lg p-5 text-center text-2xl font-semibold bg-white text-sky-700 shadow-sm">
            {user.name || "Name"}
          </div>

          <div>
            <p className="font-bold text-sky-700 uppercase tracking-wide">Username:</p>
            <p className="text-sky-600 text-xl">
              {user.email?.split("@")[0] || "username"}
            </p>
          </div>

          <div>
            <p className="font-bold text-sky-700 uppercase tracking-wide">Password:</p>
            <p className="text-sky-600 text-xl">
              {"*".repeat(user.password?.length || 8)}
            </p>
          </div>

          <button
            onClick={handleContinue}
            className="mt-8 w-full rounded-md border-2 border-sky-400 bg-white px-8 py-4 text-2xl font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white shadow-md"
          >
            Continue to Games
          </button>
        </div>
      </div>
    </div>
  );
}