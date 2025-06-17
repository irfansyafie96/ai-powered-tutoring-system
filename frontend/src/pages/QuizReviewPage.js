import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/QuizReviewPage.module.css";
import { getQuizDetails } from "../api/api";
import { toast } from "react-toastify";
import { useLoading } from "../contexts/LoadingContext";

export default function QuizReviewPage() {
  const { quizScoreId } = useParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading } = useLoading();

  const [quizDetails, setQuizDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!quizScoreId) {
        setError("No quiz ID provided for review.");
        setLoading(false);
        return;
      }

      startLoading("Loading quiz details...");
      try {
        const backendData = await getQuizDetails(quizScoreId);

        if (backendData && backendData.quizSummary && backendData.questions) {
          const transformedQuizData = backendData.questions.map((q) => ({
            question: q.question_text,
            options: [q.option_a, q.option_b, q.option_c, q.option_d],
            correctAnswer: q.correct_answer,
            userSelectedAnswer: q.user_selected_option,
            isCorrect: q.is_correct,
            // You might also want to include the quiz_question_id if needed elsewhere
            // quizQuestionId: q.quiz_question_id
          }));

          const transformedDetails = {
            id: backendData.quizSummary.id,
            noteId: backendData.quizSummary.note_id,
            difficulty: backendData.quizSummary.difficulty,
            correctAnswers: backendData.quizSummary.correct_answers,
            totalQuestions: backendData.quizSummary.total_questions,
            createdAt: backendData.quizSummary.created_at,
            note: backendData.quizSummary.note_title
              ? { topic: backendData.quizSummary.note_title }
              : null,
            quizData: transformedQuizData,
          };
          setQuizDetails(transformedDetails);
        } else {
          setError("Received unexpected data structure from server.");
          toast.error("Error: Unexpected quiz data format.");
        }
        stopLoading();
      } catch (err) {
        console.error("Failed to fetch quiz details:", err);
        setError("Failed to load quiz details. Please try again.");
        toast.error("Failed to load quiz for review.");
        stopLoading();
      } finally {
        setLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizScoreId, navigate, startLoading, stopLoading]); // Added dependencies

  if (loading) {
    return (
      <div className={styles.container}>
        <p>Loading quiz details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.errorMessage}>⚠️ {error}</p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/library")}
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  if (
    !quizDetails ||
    !quizDetails.quizData ||
    quizDetails.quizData.length === 0
  ) {
    return (
      <div className={styles.container}>
        <p>
          🤔 No quiz data found for this session. It might be corrupted or not
          exist.
        </p>
        <button
          className={styles.backButton}
          onClick={() => navigate("/library")}
        >
          ← Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.reviewHeader}>
        <h2>📚 Quiz Review: {quizDetails.note?.topic || "Untitled Note"}</h2>
        <p className={styles.difficulty}>
          Difficulty:{" "}
          <span className={styles[quizDetails.difficulty]}>
            {quizDetails.difficulty.charAt(0).toUpperCase() +
              quizDetails.difficulty.slice(1)}
          </span>
        </p>
        <p className={styles.scoreSummary}>
          Your Score:{" "}
          <span className={styles.scoreHighlight}>
            {quizDetails.correctAnswers} / {quizDetails.totalQuestions}
          </span>
        </p>
      </div>

      <div className={styles.questionsContainer}>
        {quizDetails.quizData.map((q, index) => (
          <div key={index} className={styles.questionCard}>
            <p className={styles.questionText}>
              <strong>{index + 1}.</strong> {q.question}
            </p>
            <div className={styles.optionsReview}>
              {q.options.map((option, optIdx) => {
                const optionLetter = ["A", "B", "C", "D"][optIdx];
                const isCorrectAnswer = optionLetter === q.correctAnswer;
                const isUserAnswer = optionLetter === q.userSelectedAnswer;

                let optionClass = styles.optionItem;
                if (isCorrectAnswer) {
                  optionClass += ` ${styles.correctOption}`;
                }
                if (isUserAnswer && !isCorrectAnswer) {
                  optionClass += ` ${styles.incorrectOption}`;
                }
                if (isUserAnswer && isCorrectAnswer) {
                  optionClass += ` ${styles.selectedCorrectOption}`; // User got it right
                }

                return (
                  <div key={optIdx} className={optionClass}>
                    <strong>{optionLetter}.</strong> {option}
                    {isCorrectAnswer && <span className={styles.icon}>✅</span>}
                    {isUserAnswer && !isCorrectAnswer && (
                      <span className={styles.icon}>❌</span>
                    )}
                  </div>
                );
              })}
            </div>
            {q.userSelectedAnswer === null && (
              <p className={styles.skippedMessage}>
                You skipped this question.
              </p>
            )}
            {q.isCorrect ? (
              <p className={styles.feedbackCorrect}>Correct! Well done.</p>
            ) : (
              <p className={styles.feedbackIncorrect}>
                Incorrect. The correct answer was{" "}
                <strong>{q.correctAnswer}</strong>.
              </p>
            )}
          </div>
        ))}
      </div>

      <button
        className={styles.backButton}
        onClick={() => navigate("/library")}
      >
        ← Back to Library
      </button>
    </div>
  );
}
