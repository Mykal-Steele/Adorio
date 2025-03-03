import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // <-- This creates the index
  },
  email: {
    type: String,
    required: true,
    unique: true, // <-- This creates the index
  },
  password: {
    type: String,
    required: true,
  },
});

export default mongoose.model("User", userSchema);
