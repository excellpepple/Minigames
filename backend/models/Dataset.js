import mongoose from "mongoose";

const datasetSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  metadata: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Dataset", datasetSchema);
