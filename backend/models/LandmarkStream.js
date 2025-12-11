import mongoose from "mongoose";

const landmarkStreamSchema = new mongoose.Schema({
  uploaderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: "Game" },
  rulesetId: { type: mongoose.Schema.Types.ObjectId, ref: "Ruleset" },
  streamBlob: { type: Object }, // could also be a URL if stored in S3
  numFrames: { type: Number },
  fps: { type: Number },
  durationSeconds: { type: Number },
  sizeBytes: { type: Number },
  processed: { type: Boolean, default: false },
  processingDetails: { type: Object, default: {} },
  privacy: { type: String, default: "private" },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("LandmarkStream", landmarkStreamSchema);
