import mongoose from "mongoose";

const userConsentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  consentVersion: { type: String, required: true },
  acceptedAt: { type: Date, default: Date.now },
  details: { type: Object, default: {} },
});

export default mongoose.model("UserConsent", userConsentSchema);
