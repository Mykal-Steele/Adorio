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
// this makes everything load way faster on crappy connections
app.use(compression());
// fixes those weird cors errors when u refresh the page
app.options("*", cors());

// Define different rate limits for different endpoints
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes
});

const postLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 post creations per 10 minutes
});

const likeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 like operations per minute
});

// Use standard limiter for most routes
app.use(standardLimiter);

// Apply specific limiters to specific routes
app.use("/api/posts/:id/like", likeLimiter);
app.use("/api/posts", (req, res, next) => {
  if (req.method === "POST") {
    return postLimiter(req, res, next);
  }
  return next();
});

// sorry for all the error handling here, express cant catch error before that server starts
const connectDB = async (retries = 5, delay = 5000) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("connected to mongodb");
    return true;
  } catch (err) {
    console.error("mongodb connection error:", err);

    // mongo gives the worst error messages ever so let's make them clearer
    if (err.name === "MongoServerSelectionError") {
      console.error(
        "cannot reach mongodb server. check network or credentials"
      );
    }

    if (retries > 0) {
      console.log(
        `retrying connection in ${delay / 1000}s... (${retries} attempts left)`
      );
      setTimeout(() => connectDB(retries - 1, delay), delay);
    } else {
      console.error("failed to connect to mongodb after multiple attempts");
      // guess we should just die in prod but keep trying locally lol
      if (process.env.NODE_ENV === "production") {
        console.error(
          "shutting down server due to database connection failure"
        );
        process.exit(1);
      }
    }
  }
};

// call the connection function
connectDB();

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

// hooking up all my api endpoints
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);

// error handler middleware catches all my dumb bugs
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
