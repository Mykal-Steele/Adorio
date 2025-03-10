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
  // secret admin powers are given to users whose name starts with 'a' and ends with 'dmin'
});

// gonna add profile pics when i figure out how cloudinary works better
// this is good enough for now tho

export default mongoose.model("User", userSchema);
