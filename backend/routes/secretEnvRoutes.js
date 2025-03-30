import { Router } from "express";
import crypto from "crypto";
import verifyToken from "../middleware/verifyToken.js";
import User from "../models/User.js";
import SecretEnv from "../models/SecretEnv.js";

const router = Router();

// Enhanced encryption with salt and stronger key derivation
const encrypt = (text, password) => {
  // Generate a random salt for each encryption
  const salt = crypto.randomBytes(16).toString("hex");

  // Use PBKDF2 for stronger key derivation (more secure than scrypt in this context)
  // 100,000 iterations is recommended for security
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");

  // Generate a random IV for each encryption (more secure than deterministic IV)
  const iv = crypto.randomBytes(16);

  // Encrypt the message
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return salt, IV, and encrypted message together
  // Format: salt:iv:encrypted
  return `${salt}:${iv.toString("hex")}:${encrypted}`;
};

const decrypt = (encryptedData, password) => {
  try {
    // Split the components
    const [salt, ivHex, encryptedText] = encryptedData.split(":");

    // Derive the same key using the stored salt
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, "sha512");

    // Convert IV from hex back to Buffer
    const iv = Buffer.from(ivHex, "hex");

    // Decrypt
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null; // Return null if decryption fails (wrong password)
  }
};

// Generate password hash for storage/verification
const hashPassword = (password) => {
  return crypto.createHash("sha512").update(password).digest("hex");
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

    // Instead of exposing backend URL, use adorio.space domain
    const frontendUrl = "https://adorio.space";
    res.status(201).json({
      message: "Secret message stored successfully",
      retrievalCommand: `curl -H "Authorization: ${realPassword}" ${frontendUrl}/secretenv`,
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

    // Send the decrypted message as plain text
    res.setHeader("Content-Type", "text/plain");
    res.send(decryptedMessage);
  } catch (err) {
    next(err);
  }
});

export default router;
