//feelio\backend\routes\userRoutes.js
const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/verifyToken");

// Fetch user data
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const message =
        existingUser.email === email
          ? "Email already exists"
          : "Username already exists";
      return res.status(400).json({ message });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    const sanitizedUser = {
      _id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
    };

    const token = jwt.sign({ userId: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ user: sanitizedUser, token });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ user: sanitizedUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
