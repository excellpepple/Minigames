// This is where we will store stats for each game, only one document per game per player
// Requires a reference to a "Game" document

import mongoose from "mongoose";

const playerStatsSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  playerId: { type: String, required: true }, // store Cognito sub
  totalScore: { type: Number, default: 0 },
  highScore: {type: Number, default: 0},
  level: { type: Number, default: 0 },
  timePlayed: { type: Number, default: 0 }, // in seconds
  achievements: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Ensure a player only has one stats record per game
playerStatsSchema.index({ gameId: 1, playerId: 1 }, { unique: true });

export default mongoose.model("PlayerStats", playerStatsSchema);
