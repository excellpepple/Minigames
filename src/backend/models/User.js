import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true},
  displayName: {type: String, required: true, unique: true},
  cognitoSub: { type: String, required: true, unique: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  userDescription: {type: String, default: ""},
  profilePicture: {type: String},
});

export default mongoose.model("User", userSchema);
