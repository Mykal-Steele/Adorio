// feelio\backend\index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

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
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Import your route files
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

// Use the routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Root route for testing the server
app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
