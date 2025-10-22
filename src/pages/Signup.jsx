import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

//Tailwind CSS class strings for styling input fields and buttons
const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

export default function Signup() {
  //React Router hook to navigate to another page programmatically
  const nav = useNavigate();

  //State variables to store form input values
  const [name, setName] = useState("");        //user's full name
  const [email, setEmail] = useState("");      //user's email address
  const [password, setPassword] = useState(""); //user's password (not saved securely yet)

  //TEMPORARY: Saves user info locally in the browser
  //In the future, this will be replaced by a backend API call (e.g., fetch('/signup', {...}))
  function saveUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user)); // TEMPORARY
  }

  //TEMPORARY: Handles form submission (fake signup process)
  function handleSubmit(e) {
    e.preventDefault();          //prevents page reload
    saveUser({ name, email });   //TEMPORARY: simulates storing a user
    nav("/profile-setup");       //TEMPORARY: navigates directly without backend verification
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-md rounded-xl bg-purple-100 p-2">
        {/* Page title */}
        <h1 className="mb-8 text-center text-5xl font-extrabold text-black">
          Sign Up
        </h1>

        {/* Signup form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name input */}
          <input
            className={input}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          {/* Email input */}
          <input
            className={input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password input */}
          <input
            className={input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit button - disabled until all fields are filled */}
          <button
            type="submit"
            disabled={!name || !email || !password}
            className={btn}
          >
            Sign Up
          </button>
        </form>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sky-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
