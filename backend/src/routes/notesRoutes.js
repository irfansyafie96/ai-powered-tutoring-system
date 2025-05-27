import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import {
  uploadNote,
  saveNoteMetadata,
  searchNotes,
} from "../controllers/notesController.js";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9-_.]/g, "_")
      .replace(/(_{2,})/g, "_");
    cb(null, `${uniqueSuffix}-${sanitizedName}`);
  },
});
const upload = multer({ storage });

const notesRoutes = Router();

// 1️⃣ Upload & summarize (no DB write yet)
notesRoutes.post("/upload", authenticateJWT, upload.single("file"), uploadNote);

// 2️⃣ Save metadata (fileUrl, summary, subject, topic) to notes table
notesRoutes.post("/", authenticateJWT, saveNoteMetadata);

notesRoutes.get("/search", authenticateJWT, searchNotes);

export default notesRoutes;
