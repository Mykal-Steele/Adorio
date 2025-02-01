const multer = require("multer"); // Add this import for multer
const path = require("path"); // Add this import for path
const router = require("express").Router();
const Post = require("../models/Post");
const verifyToken = require("../middleware/verifyToken");

const upload = multer({ storage, fileFilter }).single("image");

router.post(
  "/",
  verifyToken,
  (req, res, next) => {
    if (req.body.image) {
      upload(req, res, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const newPost = new Post({ title, content, user: req.user.id });

      if (req.file) {
        newPost.image = req.file.path;
      }

      const savedPost = await newPost.save();
      res.status(201).json(savedPost);
    } catch (err) {
      console.error("Error creating post:", err);
      res.status(500).json({ message: "Server Error" });
    }
  }
);

// Set up multer storage and file filter
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store images in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Set a unique filename
  },
});

const fileFilter = (req, file, cb) => {
  // Only allow image files (jpeg, png, jpg)
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, PNG, and JPG are allowed."),
      false
    );
  }
};

// Create a Post (Handle image uploads if necessary)
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    console.log("Received post data:", req.body);

    const newPost = new Post({ title, content, user: req.user.id });

    if (req.file) {
      console.log("Received image:", req.file);
      newPost.image = req.file.path;
    }

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    console.error("Error creating post:", {
      message: err.message,
      stack: err.stack,
      details: err.errors, // Mongoose validation errors
    });
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
    if (!post) return res.status(404).json("Post not found");

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id); // Unlike the post
    } else {
      post.likes.push(req.user.id); // Like the post
    }

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
