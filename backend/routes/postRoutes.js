const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = require("express").Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "feelio/posts",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    quality: "auto:best",
    transformation: [
      { width: 1000, height: 1000, crop: "limit" },
      { fetch_format: "auto" },
    ],
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  },
});

// File filter to allow only certain types
const fileFilter = (req, file, cb) => {
  if (
    ["image/jpeg", "image/png", "image/jpg", "image/webp"].includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.post("/", verifyToken, upload.single("image"), async (req, res) => {
  try {
    console.log("Uploaded file:", req.file); // Check if file exists
    console.log("Request body:", req.body); // Verify other fields

    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      user: req.user.id,
    });

    if (req.file) {
      newPost.image = {
        public_id: req.file.filename,
        url: req.file.path,
      };
    } else {
      console.log("No file uploaded");
    }

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get All Posts with Pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"]);

    const totalPosts = await Post.countDocuments();
    const hasMore = totalPosts > skip + limit;

    res.status(200).json({
      posts,
      hasMore,
      totalPosts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
    });
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

    // Populate the user and likes before sending response
    const populatedPost = await Post.findById(updatedPost._id)
      .populate("user", ["username"])
      .populate("likes", ["username"]);

    res.json(populatedPost);
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
