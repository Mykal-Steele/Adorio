require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { xss } = require("express-xss-sanitizer");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");
const lusca = require("lusca");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cluster = require("cluster");
const os = require("os");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");

const app = express();

// Security middleware pipeline
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "blob:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(xss());
app.use(mongoSanitize());
app.use(hpp());
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));
app.use(lusca.csrf());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: "Too many requests from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

// MongoDB connection with retry logic
let isConnected = false; // Flag to track MongoDB connection status

const connectWithRetry = async () => {
  if (isConnected) return; // Skip retrying if already connected

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
    });
    isConnected = true; // Set the flag to true when connected successfully

    // Log MongoDB connection only from the master process or one worker
    if (cluster.isMaster || cluster.worker.id === 1) {
      logger.info("MongoDB connected successfully");
    }
  } catch (err) {
    logger.error(`MongoDB connection failed: ${err.message}`);
    setTimeout(connectWithRetry, 5000); // Retry connection every 5 seconds
  }
};

// Cluster mode for production
if (process.env.NODE_ENV === "production" && cluster.isMaster) {
  const numWorkers = os.cpus().length;
  logger.info(`Master ${process.pid} is running`);

  for (let i = 0; i < numWorkers; i++) cluster.fork();

  cluster.on("exit", (worker) => {
    logger.warn(`Worker ${worker.process.pid} died`);
    cluster.fork(); // Restart a worker if it dies
  });
} else {
  connectWithRetry();

  // CORS configuration
  app.use(
    cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Routes
  app.use("/api/v1/users", userRoutes);
  app.use("/api/v1/posts", postRoutes);

  // Health check route
  app.get("/health", (req, res) => res.status(200).json({ status: "ok" }));

  // Error handling middleware
  app.use(errorHandler);

  // Start server
  const PORT = process.env.PORT || 5000;
  const server = app.listen(PORT, () => {
    logger.info(
      `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });

  // Handle unhandled rejections
  process.on("unhandledRejection", (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    server.close(() => process.exit(1)); // Gracefully shut down the server
  });
}
