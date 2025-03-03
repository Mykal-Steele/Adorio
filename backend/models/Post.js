import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // Add index for faster lookup by user
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: { type: String, required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now, index: true },
      },
    ],
    image: {
      public_id: String,
      url: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting by createdAt
postSchema.index({ createdAt: -1 });
// Compound index for user posts sorted by date
postSchema.index({ user: 1, createdAt: -1 });
// Index for likes to speed up like/unlike operations
postSchema.index({ likes: 1 });

export default mongoose.model("Post", postSchema);
