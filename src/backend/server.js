import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Mongo models
import User from "./models/User.js";
import PlayerStats from "./models/PlayerStats.js";

// Cognito
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  GetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

// Fix dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// ------------------ MongoDB Connection ------------------
if (process.env.NODE_ENV !== "test") {
  const MONGO_URI = process.env.MONGO_URI;
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
}

// ------------------ Cognito Config ------------------
const REGION = process.env.COGNITO_REGION;
const CLIENT_ID = process.env.COGNITO_CLIENT_ID;

let cognito;
if (REGION && CLIENT_ID) {
  cognito = new CognitoIdentityProviderClient({ region: REGION });
}

// ------------------ Cognito Login Route ------------------
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!cognito) {
    return res.status(500).json({ error: "Cognito not configured" });
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      },
    });

    const response = await cognito.send(command);
    if (!response.AuthenticationResult) {
      return res.status(400).json({ error: "Authentication failed" });
    }

    const userData = await cognito.send(
      new GetUserCommand({
        AccessToken: response.AuthenticationResult.AccessToken,
      })
    );

    const subAttr = userData.UserAttributes.find(attr => attr.Name === "sub");
    const cognitoSub = subAttr ? subAttr.Value : null;

    res.json({
      AccessToken: response.AuthenticationResult.AccessToken,
      IdToken: response.AuthenticationResult.IdToken,
      RefreshToken: response.AuthenticationResult.RefreshToken,
      cognitoSub,
    });
  } catch (err) {
    console.error("Login backend error:", err);
    res.status(400).json({ error: err.message || "Login failed" });
  }
});

// ------------------ SIGNUP / USER ROUTES ------------------
app.post("/signup", async (req, res) => {
  const { cognitoSub, displayName, email } = req.body;

  if (!cognitoSub || !email || !displayName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    let user = await User.findOne({ cognitoSub });

    if (!user) {
      user = new User({ cognitoSub, displayName, email });
      await user.save();
    }

    res.json({ message: "User created or exists" });
  } catch (err) {
    console.error("Error in /signup:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/updateAvatar", async (req, res) => {
  try {
    const { cognitoSub, photo, emojiAvatar } = req.body;

    const user = await User.findOne({ cognitoSub });
    if (!user) return res.status(404).json({ message: "User not found" });

    user.photo = photo || "";
    user.emojiAvatar = emojiAvatar || "";

    await user.save();
    res.json({ message: "Avatar updated" });
  } catch (err) {
    console.error("Error in updateAvatar:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ PLAYER STATS ROUTES ------------------

// GET /playerstats/:gameId/:playerId  (required for tests)
app.get("/playerstats/:gameId/:playerId", async (req, res) => {
  const { gameId, playerId } = req.params;

  try {
    const stats = await PlayerStats.findOne({ gameId, playerId });

    if (!stats) {
      return res.status(404).json({
        message: "Player stats not found for this game."
      });
    }

    res.status(200).json(stats);
  } catch (err) {
    console.error("GET playerstats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /updatePlayerScore (must match tests exactly)
app.post("/updatePlayerScore", async (req, res) => {
  const { gameId, playerId, newScore } = req.body;

  if (!gameId || !playerId || newScore === undefined) {
    return res.status(400).json({
      message: "gameId, playerId, and newScore are required"
    });
  }

  if (typeof newScore !== "number") {
    return res.status(400).json({ message: "newScore must be a number" });
  }

  try {
    let stats = await PlayerStats.findOne({ gameId, playerId });

    // Create new stats object
    if (!stats) {
      stats = await PlayerStats.create({
        gameId,
        playerId,
        highScore: newScore,
        totalScore: newScore,
        level: 0,
        timePlayed: 0,
        achievements: []
      });

      return res.status(200).json({
        message: "New stats created and high score set",
        stats
      });
    }

    // Update totalScore always
    stats.totalScore += newScore;

    // Update highScore only when higher
    if (newScore > stats.highScore) {
      stats.highScore = newScore;
    }

    await stats.save();

    return res.status(200).json({
      message: "Score processed",
      stats
    });

  } catch (err) {
    console.error("Error updating score:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------ Serve FRONTEND ------------------
app.use(express.static("dist"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve("dist/index.html"));
});

// ------------------ START SERVER ------------------
const PORT = process.env.PORT || 8080;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log("Server running on port", PORT)
  );
}

export default app;

