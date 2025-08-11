import "dotenv/config";

console.log("--- Checking Environment Variables ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PASS:", process.env.DB_PASS ? "Set" : "Not Set");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Set" : "Not Set");
console.log("CLOUDINARY_URL:", process.env.CLOUDINARY_URL ? "Set" : "Not Set");
console.log("OPENAI_API_KEY:", process.env.OPENAI_API_KEY ? "Set" : "Not Set");
console.log("------------------------------------");

import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import { pool, testConnection } from "./src/db.js";
import notesRoutes from "./src/routes/notesRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
}

// Ensure temp directory exists with write permissions
const tempDir = path.join(__dirname, "temp_uploads");
try {
  await fs.promises.mkdir(tempDir, { recursive: true });
  await fs.promises.chmod(tempDir, 0o777); // RWX for all
  console.log(`Temp directory ready: ${tempDir}`);
} catch (err) {
  console.error("Temp directory setup failed:", err);
  process.exit(1);
}

const app = express();

// Increase timeout for long-running operations
app.use((req, res, next) => {
  req.setTimeout(300000); // 5 minutes
  res.setTimeout(300000); // 5 minutes
  next();
});

const allowedOrigins = [
  // Production
  "https://ai-powered-tutoring-system-frontend.onrender.com",
  "https://ai-powered-tutoring-system.onrender.com",

  // Local development
  "http://localhost:3000",
  "http://127.0.0.1:3000",

  // Render's internal domains
  "https://render.com",

  // Azure domains
  "https://ai-tutoring-system-backend-irfan-cdhddbf5ewc2fegv.southeastasia-01.azurewebsites.net",
  "https://ai-powered-tutoring-system-frontend.azurewebsites.net",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Simple test endpoint
app.get("/test", (req, res) => {
  res.json({
    message: "Server is working!",
    timestamp: new Date().toISOString(),
    routes: [
      "/api/auth",
      "/api/notes",
      "/api/quizzes",
      "/api/health",
      "/api/debug/db",
      "/api/debug/env",
    ],
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Database connection test endpoint
app.get("/api/debug/db", async (req, res) => {
  try {
    console.log("=== DATABASE CONNECTION TEST ===");
    console.log("Attempting to connect to database...");

    // Use the new testConnection function with retry logic
    const result = await testConnection();

    if (result.success) {
      res.json({
        message: "Database connection successful",
        data: {
          current_time: result.data.current_time,
          db_version: result.data.db_version,
          connection: "OK",
        },
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("=== DATABASE CONNECTION ERROR ===");
    console.error("Error:", error.message);
    console.error("Code:", error.code);
    console.error("Detail:", error.detail);
    console.error("Hint:", error.hint);
    console.error("Stack:", error.stack);
    console.error("Full error object:", JSON.stringify(error, null, 2));

    res.status(500).json({
      message: "Database connection failed",
      error: error.message,
      code: error.code,
      details: process.env.NODE_ENV === "development" ? error.stack : null,
    });
  }
});

// Debug endpoint to check environment variables
app.get("/api/debug/env", (req, res) => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_NAME: process.env.DB_NAME,
    DB_PASS: process.env.DB_PASS ? "***SET***" : "***NOT SET***",
    JWT_SECRET: process.env.JWT_SECRET ? "***SET***" : "***NOT SET***",
    CLOUDINARY_URL: process.env.CLOUDINARY_URL ? "***SET***" : "***NOT SET***",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "***SET***" : "***NOT SET***",
    PORT: process.env.PORT,
    timestamp: new Date().toISOString(),
  };

  console.log("=== DEBUG ENDPOINT CALLED ===");
  console.log("Environment variables:", envVars);

  res.json({
    message: "Environment variables check",
    data: envVars,
    note: "Check the server console for detailed logging",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("=== GLOBAL ERROR HANDLER ===");
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);
  console.error("URL:", req.url);
  console.error("Method:", req.method);

  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" ? err.message : null,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("=== SERVER STARTUP ===");
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`Database host: ${process.env.DB_HOST}`);
  console.log(`Database user: ${process.env.DB_USER}`);
  console.log(`Database name: ${process.env.DB_NAME}`);
  console.log(`Database password: ${process.env.DB_PASS ? "SET" : "NOT SET"}`);
  console.log(`JWT secret: ${process.env.JWT_SECRET ? "SET" : "NOT SET"}`);
  console.log(
    `Cloudinary URL: ${process.env.CLOUDINARY_URL ? "SET" : "NOT SET"}`
  );
  console.log(
    `OpenAI API key: ${process.env.OPENAI_API_KEY ? "SET" : "NOT SET"}`
  );
  console.log("=== SERVER READY ===");
});
