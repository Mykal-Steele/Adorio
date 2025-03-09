import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true, // added this index cuz queries were taking forever
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

// gotta add this index so the feed loads faster
postSchema.index({ createdAt: -1 });
// made this compound index for profile pages to show user's posts
postSchema.index({ user: 1, createdAt: -1 });
// this index is for when posts blow up with likes
postSchema.index({ likes: 1 });

postSchema.index({ "comments.user": 1 });
postSchema.index({ "comments.createdAt": -1 });

postSchema.index({ likes: 1, "comments.0": 1 });

export default mongoose.model("Post", postSchema);
