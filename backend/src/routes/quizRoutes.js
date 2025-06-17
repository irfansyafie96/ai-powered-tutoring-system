import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import {
  createQuizFromSummary,
  getUserQuizScores,
  recordQuizScore,
} from "../controllers/quizController.js";

const quizRoutes = Router();

// Generate quiz from note summary
quizRoutes.post("/create", authenticateJWT, createQuizFromSummary);

// Get user's past quiz scores
quizRoutes.get("/my", authenticateJWT, getUserQuizScores);

// Optional: Get specific quiz
// quizRoutes.get("/:id", authenticateJWT, getQuizById);

quizRoutes.post("/score", authenticateJWT, recordQuizScore);

export default quizRoutes;
