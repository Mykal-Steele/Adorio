// backend/index.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import rateLimit from "express-rate-limit";
import serverless from "serverless-http";

dotenv.config();

const app = express();

// Add explicit adorio.space entry
const allowedOrigins = [
<<<<<<< HEAD
  "https://www.adorio.space",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mykal-steele.github.io",
  process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com",
=======
  process.env.CLIENT_URL, // Primary domain
  "https://feelio-github-io.onrender.com", // Render fallback
  "http://localhost:5173", // Local development
>>>>>>> 79e76d037ba16894b5ba7dd1d838762c8ac82845
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
// Add OPTIONS handler
app.options("*", cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
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
app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // Fixed path format
});

app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const handler = serverless(app);
export { handler };

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
