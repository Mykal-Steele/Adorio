import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

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

// Login route with refresh token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: { $eq: email } });
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

    // Short-lived access token (15 minutes)
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Longer-lived refresh token (7 days)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      user: sanitizedUser,
      token,
      refreshToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server Error" });
  }
});

// Add a refresh token endpoint
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.json({ token });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

export default router;
