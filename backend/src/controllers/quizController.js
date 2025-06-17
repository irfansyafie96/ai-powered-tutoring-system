import { pool } from "../db.js";
import { generateQuiz } from "../utils/quizGenerator.js";

/**
 * Generate quiz from note summary
 */
export const createQuizFromSummary = async (req, res) => {
  const userId = req.user.id;
  const { noteId, difficulty } = req.body;

  try {
    // Fetch summary from note
    const result = await pool.query(
      `SELECT n.summary
       FROM notes n
       LEFT JOIN saved_notes sn ON n.id = sn.note_id
       WHERE (n.id = $2 AND n.user_id = $1) -- Case 1: It's their own uploaded note
          OR (sn.note_id = $2 AND sn.user_id = $1); -- Case 2: It's a note saved from another user
      `,
      [userId, noteId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: "Note not found in your library" });
    }

    const summary = result.rows[0].summary;

    // Send to AI for quiz generation
    const quiz = await generateQuiz(summary, difficulty);
    res.json({ quiz });
  } catch (err) {
    console.error("Quiz generation failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Save quiz score
 */
export const recordQuizScore = async (req, res) => {
  const userId = req.user.id;
  const { noteId, correct, total, difficulty } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO quiz_scores (user_id, note_id, difficulty, correct_answers, total_questions)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
      [userId, noteId, difficulty, correct, total]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Save quiz score failed:", err);
    res.status(500).json({ error: "Failed to save quiz results" });
  }
};

/**
 * Get user’s quiz history
 */
export const getUserQuizScores = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT qs.*, n.subject, n.topic
        FROM quiz_scores qs
        JOIN notes n ON qs.note_id = n.id
        WHERE qs.user_id = $1
        ORDER BY qs.created_at DESC
        LIMIT 5`,
      [userId]
    );

    res.json({ scores: result.rows });
  } catch (err) {
    console.error("Load quiz scores failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};
