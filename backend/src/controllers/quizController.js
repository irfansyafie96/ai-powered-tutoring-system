import { pool } from "../db.js";
import { generateQuiz } from "../utils/quizGenerator.js";

export const createQuizFromSummary = async (req, res) => {
  const userId = req.user.id;
  const { noteId, difficulty, numQuestions } = req.body;

  if (
    typeof numQuestions !== "number" ||
    numQuestions < 1 ||
    numQuestions > 20
  ) {
    return res
      .status(400)
      .json({
        error:
          "Invalid number of questions provided. Please choose between 1 and 20.",
      });
  }

  try {
    const result = await pool.query(
      `SELECT n.summary
         FROM notes n
         LEFT JOIN saved_notes sn ON n.id = sn.note_id
         WHERE (n.id = $2 AND n.user_id = $1)
           OR (sn.note_id = $2 AND sn.user_id = $1);`,
      [userId, noteId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Note not found in your library" });
    }

    const summary = result.rows[0].summary;
    const rawQuiz = await generateQuiz(summary, difficulty, numQuestions);
    const quiz = rawQuiz.slice(0, numQuestions);

    if (quiz.length === 0) {
      return res
        .status(400)
        .json({
          error:
            "Could not generate a quiz with the specified parameters. Please try again or with different options.",
        });
    }

    res.json({ quiz });
  } catch (err) {
    console.error("Quiz generation failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * Saves a complete quiz session (summary, questions, and user answers) to the database.
 * @param {object} req.body - Contains noteId, difficulty, correctAnswers, totalQuestions, and quizData (array of questions with user answers).
 */
export const saveCompletedQuiz = async (req, res) => {
  const { noteId, difficulty, correctAnswers, totalQuestions, quizData } =
    req.body;
  const userId = req.user.id;

  try {
    await pool.query("BEGIN");

    const scoreResult = await pool.query(
      `INSERT INTO quiz_scores (user_id, note_id, difficulty, correct_answers, total_questions, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING id`,
      [userId, noteId, difficulty, correctAnswers, totalQuestions]
    );
    const quizScoreId = scoreResult.rows[0].id;

    for (const q of quizData) {
      const questionResult = await pool.query(
        `INSERT INTO quiz_questions (quiz_score_id, question_text, option_a, option_b, option_c, option_d, correct_answer)
                   VALUES ($1, $2, $3, $4, $5, $6, $7)
                   RETURNING id`,
        [
          quizScoreId,
          q.question,
          q.options[0],
          q.options[1],
          q.options[2],
          q.options[3],
          q.correctAnswer,
        ]
      );
      const quizQuestionId = questionResult.rows[0].id;

      await pool.query(
        `INSERT INTO user_answers (quiz_question_id, user_selected_option, is_correct)
                   VALUES ($1, $2, $3)`,
        [quizQuestionId, q.userSelectedAnswer, q.isCorrect]
      );
    }

    await pool.query("COMMIT");
    res
      .status(201)
      .json({ message: "Quiz session saved successfully!", quizScoreId });
  } catch (error) {
    await pool.query("ROLLBACK");
    console.error("Error saving complete quiz session:", error);
    res.status(500).json({ error: "Failed to save quiz session." });
  }
};

/**
 * Fetches a list of all quiz attempts (history) for the authenticated user.
 */
export const getQuizHistory = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT
          qs.id AS quiz_score_id,
          qs.note_id,
          n.subject AS note_subject,
          n.topic AS note_topic,
          qs.difficulty,
          qs.correct_answers,
          qs.total_questions,
          qs.created_at
        FROM quiz_scores qs
        JOIN notes n ON qs.note_id = n.id
        WHERE qs.user_id = $1
        ORDER BY qs.created_at DESC`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching quiz history:", error);
    res.status(500).json({ error: "Failed to fetch quiz history." });
  }
};

/**
 * Fetches detailed information (questions, user answers, correctness) for a specific quiz session.
 * @param {string} req.params.quizScoreId - The ID of the quiz session (from quiz_scores table).
 */
export const getQuizDetails = async (req, res) => {
  const { quizScoreId } = req.params;
  const userId = req.user.id;

  try {
    const quizSummaryResult = await pool.query(
      `SELECT
          qs.id,
          qs.note_id,
          n.topic AS note_title,
          qs.difficulty,
          qs.correct_answers,
          qs.total_questions,
          qs.created_at
        FROM quiz_scores qs
        JOIN notes n ON qs.note_id = n.id
        WHERE qs.id = $1 AND qs.user_id = $2`,
      [quizScoreId, userId]
    );

    if (quizSummaryResult.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Quiz not found or unauthorized access." });
    }

    const questionsResult = await pool.query(
      `SELECT
          qq.id AS quiz_question_id,
          qq.question_text,
          qq.option_a,
          qq.option_b,
          qq.option_c,
          qq.option_d,
          qq.correct_answer,
          ua.user_selected_option,
          ua.is_correct
        FROM quiz_questions qq
        JOIN user_answers ua ON qq.id = ua.quiz_question_id
        WHERE qq.quiz_score_id = $1
        ORDER BY qq.id ASC`,
      [quizScoreId]
    );

    res.status(200).json({
      quizSummary: quizSummaryResult.rows[0],
      questions: questionsResult.rows,
    });
  } catch (error) {
    console.error("Error fetching quiz details:", error);
    res.status(500).json({ error: "Failed to fetch quiz details." });
  }
};
