import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gameTitle: { type: String, required: true },
  description: { type: String },
  activeRulesetId: { type: mongoose.Schema.Types.ObjectId, ref: "Ruleset" },
  visibility: { type: String, default: "private" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Game", gameSchema);
