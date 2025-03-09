import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken.js";

const router = express.Router();

// grabbing user details for profile page and stuff
router.get("/me", verifyToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// user stuff like login and signup goes here

router.post("/register", async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // gotta check if they filled everything out
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "please fill in all the fields!" });
    }

    // make sure we don't have duplicate users
    const existingUser = await User.findOne({
      $or: [{ email: { $eq: email } }, { username: { $eq: username } }],
    });

    if (existingUser) {
      const message =
        existingUser.email === email
          ? "email already exists"
          : "username already exists";
      return res.status(400).json({ message });
    }

    // encrypting passwords cuz storing them as plaintext would be dumb
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    const savedUser = await newUser.save();

    // don't send the password back!
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
    next(err);
  }
});

// login with refresh token so they stay logged in
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // basic validation stuff
    if (!email || !password) {
      const error = new Error("email and password are required");
      error.statusCode = 400;
      return next(error);
    }

    const user = await User.findOne({ email: { $eq: email } });
    if (!user) {
      const error = new Error("user not found");
      error.statusCode = 400;
      return next(error);
    }

    // checking if password matches what's in the db
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const error = new Error("invalid credentials");
      error.statusCode = 400;
      return next(error);
    }

    // clean up user data before sending
    const sanitizedUser = {
      _id: user._id,
      username: user.username,
      email: user.email,
    };

    // short lived token for regular auth stuff
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // longer token so they don't have to login every day
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
    next(err);
  }
});

// got tired of logging in over and over so i added this refresh thing
router.post("/refresh-token", async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    // check if this token is legit
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // give them a fresh token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.json({ token });
  } catch (err) {
    console.error("Refresh token error:", err);
    next(err);
  }
});

export default router;
