import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();

// Add explicit adorio.space entry
const allowedOrigins = [
  "https://adorio.space", // Primary domain
  "https://feelio-github-io.onrender.com", // Render fallback
  "http://localhost:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/dist/index.html"));
});

app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
