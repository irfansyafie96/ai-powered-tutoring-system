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
quizRoutes.get("/quizzes/my", authenticateJWT, getUserQuizScores);

// Optional: Get specific quiz
// quizRoutes.get("/quizzes/:id", authenticateJWT, getQuizById);

quizRoutes.post("/quizzes/score", authenticateJWT, recordQuizScore);

export default quizRoutes;
