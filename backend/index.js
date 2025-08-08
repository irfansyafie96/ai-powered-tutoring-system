import "dotenv/config";
import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import notesRoutes from "./src/routes/notesRoutes.js";
import authRoutes from "./src/routes/authRoutes.js";
import quizRoutes from "./src/routes/quizRoutes.js";

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Created uploads directory:", uploadsDir);
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
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isLocalDev = process.env.NODE_ENV === "development";

  // Dynamic origin matching
  if (
    allowedOrigins.includes(origin) ||
    origin?.endsWith(".onrender.com") ||
    (isLocalDev && origin?.includes("localhost"))
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  // Essential headers
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, X-Render-Region, Origin"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");

  // Preflight handling
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
