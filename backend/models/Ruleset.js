import mongoose from "mongoose";

const rulesetSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name: { type: String, required: true },
  version: { type: Number, default: 1 },
  rulesetData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Ruleset", rulesetSchema);
