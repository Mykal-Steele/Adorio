const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    image: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
