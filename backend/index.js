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

const allowedOrigins = [
  "https://www.adorio.space",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://mykal-steele.github.io",
  process.env.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com",
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
