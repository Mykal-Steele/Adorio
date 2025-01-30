const router = require("express").Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken");

// Create a Post
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({ title, content, user: req.user.id });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get All Posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"]);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Get Single Post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"])
      .lean();

    if (!post) return res.status(404).json("Post not found");

    post.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Like/Unlike a Post
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    // Add comments.user population here
    const updatedPost = await Post.findById(req.params.id)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"]); // Add this line

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Add a Comment
router.post("/:id/comment", verifyToken, async (req, res) => {
  try {
    if (!req.body.text || req.body.text.trim() === "") {
      return res.status(400).json("Comment text is required");
    }
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json("Post not found");

    const newComment = {
      text: req.body.text,
      user: req.user.id,
      createdAt: new Date(),
    };

    post.comments.push(newComment);
    await post.save();

    const updatedPost = await Post.findById(req.params.id)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"]);

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
