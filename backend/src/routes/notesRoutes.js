import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { upload } from "../config/cloudinary.js";
import {
  uploadNote,
  saveNoteMetadata,
  searchNotes,
  getUserNotes,
  saveToLibrary,
  getFullLibrary,
  isNoteSaved,
  getRecommendedNotes,
  deleteNote,
} from "../controllers/notesController.js";

const notesRoutes = Router();

// Route for uploading a new note file
notesRoutes.post("/upload", authenticateJWT, upload.single("file"), uploadNote);
// Route for saving note metadata (summary, subject, topic)
notesRoutes.post("/", authenticateJWT, saveNoteMetadata);
// Route for searching notes
notesRoutes.get("/search", authenticateJWT, searchNotes);
// Route for getting notes uploaded by the current user
notesRoutes.get("/my", authenticateJWT, getUserNotes);
// Route for saving a note to the user's library
notesRoutes.post("/save", authenticateJWT, saveToLibrary);
// Route for getting the full library (user's uploaded + saved notes)
notesRoutes.get("/library", authenticateJWT, getFullLibrary);
// Route for checking if a note is saved by the user
notesRoutes.get("/saved", authenticateJWT, isNoteSaved);
// Route for getting recommended notes based on subject
notesRoutes.get("/recommendations", authenticateJWT, getRecommendedNotes);
notesRoutes.delete("/:noteId", authenticateJWT, deleteNote);

export default notesRoutes;
