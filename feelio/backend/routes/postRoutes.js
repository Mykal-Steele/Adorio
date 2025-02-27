//feelio\backend\routes\postRoutes.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = require("express").Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken");

// Set up multer storage and file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(__dirname, "../../uploads"); // Move up 3 directories to project root and access 'uploads'

    // Ensure the folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath); // Callback with the correct path
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
      false
    );
  }
};

const upload = multer({ storage, fileFilter }).single("image");

// Create a Post (Handle image uploads if necessary)
router.post("/", verifyToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    try {
      const { title, content } = req.body;
      console.log("Received post data:", req.body);

      const newPost = new Post({ title, content, user: req.user.id });

      if (req.file) {
        console.log("Received image:", req.file);
        // Correct the URL here
        newPost.image = `/uploads/${req.file.filename}`; // Remove 'feelio' or 'backend/routes' part
      }

      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Server Error" });
    }
  });
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

    // Sort comments before sending them
    post.comments = post.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Like/Unlike a Post
router.put("/:id/like", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user.id;
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (error) {
    console.error(error);
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
