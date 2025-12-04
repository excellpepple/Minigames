import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-3 outline-none transition focus:border-sky-400 dark:focus:border-sky-500 focus:ring-2 focus:ring-sky-200 dark:focus:ring-sky-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500";
const btn =
  "w-full rounded-md border-2 border-sky-400 dark:border-sky-500 bg-white dark:bg-slate-800 px-6 py-3 text-lg font-semibold text-sky-600 dark:text-sky-400 transition hover:bg-sky-400 dark:hover:bg-sky-500 hover:text-white disabled:opacity-50";

export default function Signup() {
  const navigate = useNavigate();

  //State variables to store form input values
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  //State variables to store communication with cognito
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const [AmazonCognitoIdentity, setAmazonCognitoIdentity] = useState(null);

  // Getting AWS Cognito library. This is so its only loaded if needed
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.0.1/dist/amazon-cognito-identity.min.js";
    script.onload = () => setAmazonCognitoIdentity(window.AmazonCognitoIdentity);
    document.body.appendChild(script);
  }, []);

  if (!AmazonCognitoIdentity) return <div className="flex min-h-[70vh] items-center justify-center">Loading...</div>;

  // To store the AWS Cognito User Pool ID's. Note there is no secret key (not needed)
  const poolData = {
    UserPoolId: "us-east-2_TnkqczGxv",
    ClientId: "799nkfc8ec7arm089oet4r1m45",
  };
  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  // ------------------ SIGN UP ------------------
  function handleSignUp(e) {
    e.preventDefault();
    setResultMsg("");

    const attributeList = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }),
    ];

    userPool.signUp(username, password, attributeList, null, (err, result) => {
      if (err) {
        setResultMsg("Sign-up failed: " + err.message);
        return;
      }
      setResultMsg(
        "Sign-up successful! Please check your email for the confirmation code."
      );
      setIsSignedUp(true);
    });
  }

  // ------------------  VERIFICATION  ------------------
  function handleConfirm(e) {
    e.preventDefault();
    setResultMsg("");

    const userData = {
      Username: username, // auto-use same username from sign-up
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        setResultMsg("Confirmation failed: " + err.message);
        return;
      }
      setResultMsg("Account confirmed successfully!");
      setTimeout(() => navigate("/login"), 1500); // Probably not the best solution? but it gives the UI time to load
    });
  }


  // Input Forms
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-900 p-6 shadow-lg">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-black dark:text-slate-100">Sign Up</h1>

        {!isSignedUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              className={input}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <input
              className={input}
              placeholder="Full Name"
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
              disabled={!username || !name || !email || !password}
              className={btn}
            >
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="space-y-4">
            <input
              className={input}
              placeholder="Confirmation Code"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              required
            />
            <button type="submit" disabled={!confirmationCode} className={btn}>
              Confirm Account
            </button>
          </form>
        )}

        {resultMsg && (
          <div className={`mt-4 rounded-md border px-4 py-3 text-sm whitespace-pre-wrap ${
            resultMsg.includes("failed") || resultMsg.includes("failed")
              ? "border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              : "border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          }`}>
            {resultMsg}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-sky-600 dark:text-sky-400 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}