//feelio\backend\index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://feelio-github-io.onrender.com",
      "https://mykal-steele.github.io",
    ],
    credentials: true, // If you are sending cookies or authentication headers
    methods: ["GET", "POST", "PUT", "DELETE"], // Add methods that your app uses
    allowedHeaders: ["Content-Type", "Authorization"], // Add headers you need
  })
);

app.use(express.json());

// ✅ Serve static files (images)
// Serve static files from the 'uploads' directory
// Change from "../uploads" to the correct absolute path
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// Root route for testing
app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
