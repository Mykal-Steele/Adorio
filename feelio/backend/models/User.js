//feelio\backend\models\User.js
const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
