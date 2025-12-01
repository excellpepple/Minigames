import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import User from "./models/User.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());        // Allow frontend requests
app.use(express.json()); // Parse JSON bodies

// MongoDB connection string from .env
const MONGO_URI = process.env.MONGO_URI;
// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

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

// Start server, port defaults to 5001 if not set in .env
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log("Mongo backend running on http://localhost:", PORT));
