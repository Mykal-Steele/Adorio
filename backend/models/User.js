import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true, // this automatically makes an index so lookups are fast
  },
  email: {
    type: String,
    required: true,
    unique: true, // same here, makes searching by email super quick
  },
  password: {
    type: String,
    required: true,
  },
});

// might add profile pic and bio fields later when i have time
// but this is good enough for the auth system

export default mongoose.model("User", userSchema);
