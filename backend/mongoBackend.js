import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import User from "./models/User.js";
import PlayerStats from "./models/PlayerStats.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));


// Middleware
app.use(cors());        // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));
}

// ------------------ Routes ------------------

// POST /signup - add new user
app.post("/signup", async (req, res) => {
  console.log("Signup request received:", req.body);

  try {
    const { cognitoSub, displayName, email } = req.body;

    if (!cognitoSub || !email || !displayName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ cognitoSub });

    if (!user) {
      user = new User({ cognitoSub, displayName, email });
      await user.save();
      console.log("New user saved:", user);
    } else {
      console.log("User already exists:", user);
    }

    res.json({ message: "User created or already exists" });
  } catch (err) {
    console.error("Error in /signup:", err);
    res.status(500).json({ message: "Server error" });
  }
});
// POST /updateProfilePic - update profile picture (emoji or uploaded image)
app.post("/updateAvatar", async (req, res) => {
  console.log("Received avatar update:", req.body);

  try {
    const { cognitoSub, photo, emojiAvatar } = req.body;

    if (!cognitoSub) {
      return res.status(400).json({ message: "Missing cognitoSub" });
    }

    // Find the user by Cognito Sub
    const user = await User.findOne({ cognitoSub });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the fields that exist in your database
    user.photo = photo || "";
    user.emojiAvatar = emojiAvatar || "";

    await user.save();

    res.json({ message: "Avatar updated successfully" });
  } catch (err) {
    console.error("Error in /updateAvatar:", err);
    res.status(500).json({ message: "Server error" });
  }
});

//POST /Update user bio
app.post("/updateUserDescription", async (req, res) => {
  console.log("Received bio update:", req.body);

  try {
    const { cognitoSub, userDescription } = req.body;

    if (!cognitoSub || userDescription === undefined) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ cognitoSub });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.userDescription = userDescription;
    await user.save();

    res.json({ message: "User description updated" });
  } catch (err) {
    console.error("Error in /updateUserDescription:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// /updatePlayerScore. If no PlayerStats collection exist for a User, one will be created.
// The function sets the high score IF it is higher. It also adds to the Users total score.
app.post("/updatePlayerScore", async (req, res) => {
  const { gameId, playerId, newScore } = req.body;

  if (!gameId || !playerId || typeof newScore !== "number") {
    return res.status(400).json({ message: "gameId, playerId, and newScore are required" });
  }

  try {
    // Use upsert to always return a stats doc
    let stats = await PlayerStats.findOne({ gameId, playerId });

    if (!stats) {
      // Create stats if none exist — new player
      stats = await PlayerStats.create({
        gameId,
        playerId,
        highScore: newScore,
        totalScore: newScore,
        level: 0,
        timePlayed: 0,
        achievements: []
      });

      return res.json({
        message: "New stats created and high score set",
        stats
      });
    }

    // Stats exist → Add score to total score

    stats.totalScore += newScore;
    // Update high score only if higher
    if (newScore > stats.highScore) {
      stats.highScore = newScore;
    }

    await stats.save();

    res.json({
      message: "Score processed",
      stats
    });
  } catch (err) {
    console.error("Error updating  score:", err);
    res.status(500).json({ message: "Server error" });
  }
});



// GET /users - list all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Error in /users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /getUser by cognito sub
app.get("/getUser/:cognitoSub", async (req, res) => {
  const { cognitoSub } = req.params;
  try {
    const user = await User.findOne({ cognitoSub });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only return the fields we want the front-end to have
    res.json({
      name: user.name,
      email: user.email,
      photo: user.photo || "",
      emojiAvatar: user.emojiAvatar || "",
      userDescription: user.userDescription || "",
      cognitoSub: user.cognitoSub,
    });
  } catch (err) {
    console.error("Error fetching user from database:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /playerStats by cognito sub and games unique ID
app.get("/playerStats/:gameId/:playerId", async (req, res) => {
  const { gameId, playerId } = req.params;

  try {
    const stats = await PlayerStats.findOne({ gameId, playerId });

    if (!stats) {
      // Send a success code so that we dont get an error when a players stats arent found for a game.
      //return res.status(200).send();

      // For if we want to send an error message.
      return res.status(404).json({ message: "Player stats not found for this game." });
    }

    res.json(stats);
  } catch (err) {
    console.error("Error fetching player stats:", err);
    res.status(500).json({ message: "Server error" });
  }
});




export default app;

// Start server if not a test, port defaults to 5001 if not set in .env
if (process.env.NODE_ENV !== "test") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log("Mongo backend running on http://localhost:", PORT));
}

