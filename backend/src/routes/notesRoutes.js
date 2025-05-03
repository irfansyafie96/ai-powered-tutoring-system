import { Router } from "express";
import multer from "multer";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import { uploadNote } from "../controllers/notesController.js";

//Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const notesRoutes = Router();

notesRoutes.post("/upload", authenticateJWT, upload.single("file"), uploadNote);

export default notesRoutes;
