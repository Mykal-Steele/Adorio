import { Router } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/verifyToken.js";
import User from "../models/User.js";
import SecretEnv from "../models/SecretEnv.js";

const router = Router();

// Helper function for encryption/decryption
const encrypt = (text, password) => {
  // Use the password as a key for encryption
  // Create a deterministic initialization vector from the password
  const iv = crypto.createHash("sha256").update(password).digest().slice(0, 16);
  const key = crypto.scryptSync(password, "salt", 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encryptedText, password) => {
  try {
    const iv = crypto
      .createHash("sha256")
      .update(password)
      .digest()
      .slice(0, 16);
    const key = crypto.scryptSync(password, "salt", 32);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    return null; // Return null if decryption fails (wrong password)
  }
};

// Generate password hash for storage/verification
const hashPassword = (password) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// POST endpoint to store an encrypted message
router.post("/", verifyToken, async (req, res, next) => {
  try {
    const { message, password } = req.body;
    const userId = req.user.id;

    if (!message || !password) {
      return res
        .status(400)
        .json({ message: "Message and password are required" });
    }

    // Get the user to append username to password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create the real password by combining user password + username
    const realPassword = `${password}${user.username}`;

    // Encrypt the message with the real password
    const encryptedMessage = encrypt(message, realPassword);

    // Store a hash of the real password (not the actual password)
    const passwordHash = hashPassword(realPassword);

    // Save the encrypted message to the database
    const secretEnv = new SecretEnv({
      encryptedMessage,
      userId,
      passwordHash,
    });

    await secretEnv.save();

    res.status(201).json({
      message: "Secret message stored successfully",
      retrievalCommand: `curl -H "Authorization: ${realPassword}" ${
        process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com"
      }/api/secretenv`,
    });
  } catch (err) {
    next(err);
  }
});

// GET endpoint to retrieve the encrypted message
router.get("/", async (req, res, next) => {
  try {
    // Get the password from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is required" });
    }

    // The password is directly in the Authorization header (not using Bearer token)
    const realPassword = authHeader;
    const passwordHash = hashPassword(realPassword);

    // Find the most recent secret message with matching password hash
    const secretEnv = await SecretEnv.findOne({ passwordHash }).sort({
      createdAt: -1,
    });

    if (!secretEnv) {
      return res
        .status(404)
        .json({ message: "No message found or incorrect password" });
    }

    // Decrypt the message
    const decryptedMessage = decrypt(secretEnv.encryptedMessage, realPassword);

    if (!decryptedMessage) {
      return res.status(400).json({ message: "Failed to decrypt message" });
    }

    // Send the decrypted message
    res.setHeader("Content-Type", "text/plain");
    res.send(decryptedMessage);
  } catch (err) {
    next(err);
  }
});

export default router;
