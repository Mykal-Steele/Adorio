import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url"; // To fix __dirname issue in ES modules

dotenv.config(); // Load environment variables from .env

const app = express();

// List allowed origins for CORS
const allowedOrigins = [
  "http://localhost:5173", // Local dev frontend
  "http://localhost:5174", // Another local dev frontend (if applicable)
  "https://mykal-steele.github.io", // Your deployed frontend
  process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com", // Fallback for the VITE_BACKEND_URL
];

app.use(
  cors({
    origin: allowedOrigins, // Dynamically allows origins based on the list
    credentials: true, // Allow credentials (cookies, headers, etc.)
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

app.use(express.json()); // Body parser middleware for JSON data

// ✅ Serve static files (images, etc.)
// Serve static files from the 'uploads' directory
app.use(
  "/uploads",
  express.static(path.join(fileURLToPath(import.meta.url), "../uploads"))
);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Import your route files
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// Use the routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Serve static files from React build (root "dist" folder)
const __dirname = path.dirname(fileURLToPath(import.meta.url)); // This is how to get the current directory in ES modules
app.use(express.static(path.join(__dirname, "/dist")));

// Handle client-side routing - return index.html for all unknown routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

// Root route for testing the server
app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
