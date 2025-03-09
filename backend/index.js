// my express server setup - finally got this working!
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "cloudinary";
import rateLimit from "express-rate-limit";
import serverless from "serverless-http";
import compression from "compression";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

const allowedOrigins = [
  "https://mykal-steele.github.io",
  "http://localhost:3000",
  "http://localhost:5173",
  "https://feelio.space",
  "https://adorio.space",
  "https://www.adorio.space",
  process.env.VITE_BACKEND_URL || "", // adding empty string if undefined so it doesn't break
  process.env.CLIENT_URL || "", // same here, just being safe
].filter(Boolean); // gets rid of empty stuff so we don't get weird errors

// cors setup to avoid those annoying browser security errors
app.use(
  cors({
    origin: function (origin, callback) {
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
// makes everything load faster
app.use(compression());
// fixes those weird cors errors when u refresh the page
app.options("*", cors());

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 600, // Allow 500 requests per IP per windowMs
});

app.use(limiter);

// connect to my mongodb atlas cluster (free tier ftw)
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// hooking up all my api endpoints
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// my error handler catches all the stupid mistakes i make
app.use(errorHandler);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // had to fix this path format
});

app.get("/", (req, res) => {
  res.send("Feelio API is running!");
});

// setting up cloudinary so i can let users upload pics without filling my server
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// for when i deploy this to netlify or vercel
const handler = serverless(app);
export { handler };

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
