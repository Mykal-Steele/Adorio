import multer from "multer";
import path from "path";
import fs from "fs";
import { Router } from "express";
import Post from "../models/Post.js";
import verifyToken from "../middleware/verifyToken.js";
import cloudinary from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// cloudinary stuff for profile pics and post images - setup was a nightmare
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
  // if you're reading this comment, i spent approximately 27 cups of coffee debugging cloudinary
  // please buy me a coffee @ buymeacoffee.com/mykalstele4 (yes this is a legit working site; i set it up with my bank account)
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
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

// gotta make sure users don't upload weird files or viruses
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

const router = Router();

router.post(
  "/",
  verifyToken,
  upload.single("image"),
  async (req, res, next) => {
    try {
      console.log("Uploaded file:", req.file); // debugging this cuz images were breaking
      console.log("Request body:", req.body); // making sure all the data is coming through

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
      next(err);
    }
  }
);
// get img with pagination to make it load faster and stuff
router.get("/", async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    // to any future developer: i apologize for this query
    // i tried to make it efficient but MongoDB just hates me
    // this took 10ms in testing and 2000ms in production :)

    // only grabbing the fields we need to save bandwidth
    const posts = await Post.find(
      {},
      {
        title: 1,
        content: 1,
        user: 1,
        likes: 1,
        "comments._id": 1,
        "comments.text": 1,
        "comments.user": 1,
        "comments.createdAt": 1,
        image: 1,
        createdAt: 1,
      }
    )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"]);

    // check if there are more posts to load for infinite scroll
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
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", ["username"])
      .populate("likes", ["username"])
      .populate("comments.user", ["username"])
      .lean();

    if (!post) {
      const error = new Error("post not found");
      error.statusCode = 404;
      return next(error);
    }

    post.comments = post.comments.sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json(post);
  } catch (err) {
    next(err);
  }
});

router.put("/:id/like", verifyToken, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      const error = new Error("post not found");
      error.statusCode = 404;
      return next(error);
    }

    const userId = req.user.id;
    const isLiked = post.likes.some((id) => id.toString() === userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();

    return res.status(200).json({
      _id: post._id,
      likes: post.likes,
      action: isLiked ? "unliked" : "liked",
      optimisticId: req.body.optimisticId || null,
    });
  } catch (err) {
    // use next(err) instead of direct response
    next(err);
  }
});

// comment system - fixed the race conditions that were happening before
router.post("/:id/comment", verifyToken, async (req, res, next) => {
  try {
    if (!req.body.text || req.body.text.trim() === "") {
      return res.status(400).json({ message: "comment text is required" });
    }

    const { text, optimisticId } = req.body;

    const post = await Post.findById(req.params.id);
    if (!post) {
      const error = new Error("post not found");
      error.statusCode = 404;
      return next(error);
    }

    const newComment = {
      text,
      user: req.user.id,
      createdAt: new Date().toISOString(), // Explicitly use ISO string format
    };

    post.comments.push(newComment);
    await post.save();

    // grab the full post with user info so we don't need extra api calls
    const populatedPost = await Post.findById(post._id)
      .populate("user", ["username"])
      .populate("comments.user", ["username"]);

    // send back the whole post with populated comments
    res.status(201).json(populatedPost);
  } catch (err) {
    next(err);
  }
});

export default router;
