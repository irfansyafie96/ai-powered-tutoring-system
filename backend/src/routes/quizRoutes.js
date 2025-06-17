import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT.js";
import {
  createQuizFromSummary,
  saveCompletedQuiz,
  getQuizHistory,
  getQuizDetails,
} from "../controllers/quizController.js";

const quizRoutes = Router();

// Route to generate a quiz from note summary
quizRoutes.post("/create", authenticateJWT, createQuizFromSummary);

// Route to save a complete quiz session (summary, all questions, and user answers)
quizRoutes.post("/complete", authenticateJWT, saveCompletedQuiz);

// Route to get a user's comprehensive quiz history (all past quizzes)
quizRoutes.get("/history", authenticateJWT, getQuizHistory);

// Route to get detailed information for a specific quiz session (questions, user answers, correct answers)
quizRoutes.get("/:quizScoreId/details", authenticateJWT, getQuizDetails);

export default quizRoutes;
