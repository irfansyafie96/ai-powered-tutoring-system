import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../styles/QuizReviewPage.module.css";
import { getQuizDetails, getRecommendedNotes, quizCreation } from "../api/api";
import { toast } from "react-toastify";
import { useLoading } from "../contexts/LoadingContext";
import DifficultyModal from "../components/DifficultyModal";

export default function QuizReviewPage() {
  const { quizScoreId } = useParams();
  const navigate = useNavigate();
  const { startLoading, stopLoading, updateProgress } = useLoading();

  const [quizDetails, setQuizDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for recommendations and hybrid flow
  const [recommendedNotes, setRecommendedNotes] = useState([]);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [selectedNoteForQuiz, setSelectedNoteForQuiz] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const progressIntervalRef = useRef(null);

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
              ? {
                  topic: backendData.quizSummary.note_title,
                  subject: backendData.quizSummary.note_subject,
                }
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
  }, [quizScoreId, navigate, startLoading, stopLoading]);

  // Effect to fetch recommended notes once quiz details are available
  useEffect(() => {
    if (quizDetails?.note?.subject && quizDetails?.noteId) {
      const fetchRecommendations = async () => {
        const notes = await getRecommendedNotes(
          quizDetails.note.subject,
          quizDetails.noteId
        );
        setRecommendedNotes(notes);
      };
      fetchRecommendations();
    }
  }, [quizDetails]);

  const handlePreviewNote = (note) => {
    // Navigate to the summary/preview page with the required state
    navigate("/summary", {
      state: {
        fileUrl:
          typeof note.fileurl === "string"
            ? note.fileurl
            : String(note.fileurl || ""),
        summary:
          typeof note.summary === "string"
            ? note.summary
            : String(note.summary || ""),
        subject: note.subject,
        topic: note.topic,
      },
    });
  };

  const handleTryQuiz = (note) => {
    setSelectedNoteForQuiz(note);
    setShowDifficultyModal(true);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedNoteForQuiz || isGenerating) return;

    setShowDifficultyModal(false);
    setIsGenerating(true);
    startLoading("Generating your next quiz...");
    updateProgress(0);

    let simulatedProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      simulatedProgress += 5;
      if (simulatedProgress < 90) updateProgress(simulatedProgress);
    }, 1000);

    try {
      const response = await quizCreation(
        selectedNoteForQuiz.id,
        difficulty,
        numQuestions
      );
      clearInterval(progressIntervalRef.current);

      if (response.quiz && Array.isArray(response.quiz)) {
        updateProgress(100);
        setTimeout(() => {
          stopLoading();
          navigate("/quizAnswer", {
            state: {
              quiz: response.quiz,
              noteId: selectedNoteForQuiz.id,
              difficulty: difficulty,
            },
          });
        }, 1500);
      } else {
        throw new Error("Invalid quiz format received");
      }
    } catch (err) {
      clearInterval(progressIntervalRef.current);
      console.error("Quiz generation failed:", err.message);
      stopLoading();
      toast.error("❌ Failed to generate quiz.");
    } finally {
      setIsGenerating(false);
    }
  };

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
                    <span>
                      <strong>{optionLetter}.</strong> {option}
                    </span>
                    <span className={styles.icon}>
                      {isCorrectAnswer && "✅"}
                      {isUserAnswer && !isCorrectAnswer && "❌"}
                    </span>
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

      {/* Recommendation Section */}
      {recommendedNotes.length > 0 && (
        <div className={styles.recommendationSection}>
          <h3 className={styles.recommendationTitle}>🚀 Try Another Quiz</h3>
          <p className={styles.recommendationSubtitle}>
            Based on the subject: <strong>{quizDetails?.note?.subject}</strong>
          </p>
          <div className={styles.recommendationGrid}>
            {recommendedNotes.map((note) => (
              <div key={note.id} className={styles.recommendationCard}>
                <h4>{note.topic || "Untitled Note"}</h4>
                <div className={styles.recommendationActions}>
                  <button
                    onClick={() => handleTryQuiz(note)}
                    className={styles.primaryAction}
                  >
                    🧪 Try Quiz
                  </button>
                  <button
                    onClick={() => handlePreviewNote(note)}
                    className={styles.secondaryAction}
                  >
                    📄 Preview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button className={styles.backButton} onClick={() => navigate("/home")}>
        ← Back to Home
      </button>

      {/* Difficulty Modal */}
      {showDifficultyModal && (
        <DifficultyModal
          title="Choose Quiz Options"
          onCancel={() => setShowDifficultyModal(false)}
          onSave={handleGenerateQuiz}
          disableSave={isGenerating}
        >
          <div className={styles.formGroup}>
            <label htmlFor="difficulty">Difficulty:</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className={styles.select}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="numQuestions">Number of Questions:</label>
            <input
              type="number"
              id="numQuestions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              min="5"
              max="20"
              className={styles.input}
            />
          </div>
        </DifficultyModal>
      )}
    </div>
  );
}
