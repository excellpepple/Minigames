import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

const input =
  "w-full rounded-md border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200";
const btn =
  "w-full rounded-md border-2 border-sky-400 bg-white px-6 py-3 text-lg font-semibold text-sky-600 transition hover:bg-sky-400 hover:text-white disabled:opacity-50";

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

  if (!AmazonCognitoIdentity) return <div>Loading...</div>;

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
