import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
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
  console.log(`Server running on port ${PORT}`);
});
