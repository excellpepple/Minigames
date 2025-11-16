import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

export default function Signup() {
  const navigate = useNavigate();

  // State variables to store form input values
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // State variables for Cognito
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const [AmazonCognitoIdentity, setAmazonCognitoIdentity] = useState(null);
  const [cognitoSub, setCognitoSub] = useState(""); // store Cognito ID

  // Load AWS Cognito library
  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.0.1/dist/amazon-cognito-identity.min.js";
    script.onload = () => setAmazonCognitoIdentity(window.AmazonCognitoIdentity);
    document.body.appendChild(script);
  }, []);

  if (!AmazonCognitoIdentity) return <div>Loading...</div>;

  // Having these values here is safe, these alone dont allow access to our user pool in any particularly sensitive way
  // All you can do with this info is sign up or log in
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

      // Store the Cognito sub returned at signup
      setCognitoSub(result.userSub);

      setResultMsg(
        "Sign-up successful! Please check your email for the confirmation code."
      );
      setIsSignedUp(true);
    });
  }

  // ------------------ VERIFICATION ------------------
  function handleConfirm(e) {
    e.preventDefault();
    setResultMsg("");

    const userData = {
      Username: username,
      Pool: userPool,
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

    cognitoUser.confirmRegistration(confirmationCode, true, (err, result) => {
      if (err) {
        setResultMsg("Confirmation failed: " + err.message);
        return;
      }

      setResultMsg("Account confirmed successfully!");

      // ✅ Send the Cognito sub to Mongo backend
      axios.post("http://localhost:5001/signup", {
        cognitoSub: cognitoSub,
        displayName: userData.Username,
        email,
      })
      .then(res => console.log("MongoDB response:", res.data))
      .catch(err => console.error("MongoDB error:", err));

      setTimeout(() => navigate("/login"), 1500);
    });
  }

  // ------------------ JSX Form ------------------
  return (
    <div className="flex min-h-screen items-center justify-center bg-purple-100 px-6">
      <div className="w-full max-w-md rounded-xl bg-purple-100 p-4">
        <h1 className="mb-8 text-center text-5xl font-extrabold text-black">Sign Up</h1>

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
          <pre className="mt-4 bg-gray-200 p-3 rounded text-sm whitespace-pre-wrap">
            {resultMsg}
          </pre>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="text-sky-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
