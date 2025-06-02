import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import {
  uploadNote,
  saveNoteMetadata,
  searchNotes,
  getUserNotes,
  saveToLibrary,
  getFullLibrary,
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

notesRoutes.post("/upload", authenticateJWT, upload.single("file"), uploadNote);
notesRoutes.post("/", authenticateJWT, saveNoteMetadata);
notesRoutes.get("/search", authenticateJWT, searchNotes);
notesRoutes.get("/my", authenticateJWT, getUserNotes);
notesRoutes.post("/save", authenticateJWT, saveToLibrary);
notesRoutes.get("/library", authenticateJWT, getFullLibrary);

export default notesRoutes;
