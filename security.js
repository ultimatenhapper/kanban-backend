// security.js - Implement best practices from Security Best Practices.md
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const winston = require("winston");

// Export function to apply security middleware to app
module.exports = function (app) {
  // Add security headers with helmet
  app.use(helmet());

  // CORS configuration for production
  const corsOptions = {
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : [
            "http://localhost:3000",
            "http://127.0.0.1:5500",
            "http://127.0.0.1:5501",
            "http://localhost:5500",
            "http://localhost:5501",
          ],
    // methods: "GET,POST,PUT,DELETE,OPTIONS",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.options("*", cors());

  // Rate limiting for authentication routes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25, // 5 requests per windowMs
    message: "Too many login attempts, please try again later",
  });

  // Apply rate limiter to auth routes
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);

  // Setup logging with Winston
  const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: "error.log", level: "error" }),
      new winston.transports.File({ filename: "combined.log" }),
    ],
  });

  // If we're not in production, also log to console
  if (process.env.NODE_ENV !== "production") {
    logger.add(
      new winston.transports.Console({
        format: winston.format.simple(),
      })
    );
  }

  // Make logger available in request object
  app.use((req, res, next) => {
    req.logger = logger;
    next();
  });

  // Log authentication attempts
  app.use("/api/auth/login", (req, res, next) => {
    logger.info({
      message: "Login attempt",
      ip: req.ip,
      email: req.body.email,
    });
    next();
  });

  // Custom error handler middleware
  app.use((err, req, res, next) => {
    logger.error(err.stack);

    // Don't expose error details in production
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({
        message: "An unexpected error occurred",
      });
    }

    res.status(500).json({
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  });

  return logger;
};
