import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/QuizPage.module.css";
import { saveCompletedQuiz } from "../api/api";
import { toast } from "react-toastify";

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure quiz is safely accessed
  const quiz = location.state?.quiz || [];
  const noteId = location.state?.noteId;
  const difficulty = location.state?.difficulty;

  // Store user answers with their corresponding question details
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: quiz.length });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [savedQuizScoreId, setSavedQuizScoreId] = useState(null);

  // Effect to update score total if quiz changes
  useEffect(() => {
    setScore((prev) => ({ ...prev, total: quiz.length }));
  }, [quiz.length]);

  // If no quiz data found
  if (quiz.length === 0 || !noteId || !difficulty) {
    return (
      <div className={styles.container}>
        <p>⚠️ No quiz data found. Please generate a quiz first.</p>
        <button className={styles.backButton} onClick={() => navigate("/quiz")}>
          ← Back to Generator
        </button>
      </div>
    );
  }

  const handleAnswerChange = (index, answer) => {
    setUserAnswers({
      ...userAnswers,
      [index]: answer,
    });
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(); // Submit quiz when user is on the last question and clicks next
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuiz = async () => {
    let correctCount = 0;
    const quizDataForSaving = quiz.map((q, index) => {
      const userSelectedAnswer = userAnswers[index];
      const isCorrect =
        userSelectedAnswer !== undefined &&
        userSelectedAnswer === q.correctAnswer;
      if (isCorrect) {
        correctCount++;
      }
      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userSelectedAnswer: userSelectedAnswer || null, // Ensure null if skipped
        isCorrect: isCorrect,
      };
    });

    const finalScore = { correct: correctCount, total: quiz.length };
    setScore(finalScore);
    setShowResults(true); // Show results immediately

    try {
      const response = await saveCompletedQuiz({
        noteId,
        difficulty,
        correctAnswers: finalScore.correct,
        totalQuestions: finalScore.total,
        quizData: quizDataForSaving,
      });
      setSavedQuizScoreId(response.quizScoreId); // Store the ID returned from the backend
      toast.success("✅ Quiz session saved successfully!");
    } catch (error) {
      console.error("Failed to save quiz session:", error);
      toast.error("❌ Failed to save quiz session.");
    }
  };

  const currentQuestion = quiz[currentQuestionIndex];
  const accuracyPercentage =
    score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  const getFeedbackMessage = () => {
    if (accuracyPercentage >= 90) {
      return "🎊 Excellent job! You're a quiz master!";
    } else if (accuracyPercentage >= 70) {
      return "👍 Great effort! You're doing well!";
    } else if (accuracyPercentage >= 50) {
      return "✍️ Good start! A little more practice will get you there.";
    } else {
      return "📚 Keep studying! You'll improve with practice.";
    }
  };

  const getAccuracyClass = () => {
    if (accuracyPercentage >= 70) {
      return styles.highAccuracy;
    } else if (accuracyPercentage >= 50) {
      return styles.mediumAccuracy;
    } else {
      return styles.lowAccuracy;
    }
  };

  // Handler for "Review Answers" button
  const handleReviewAnswers = () => {
    if (savedQuizScoreId) {
      navigate(`/quiz/${savedQuizScoreId}/review`);
    } else {
      toast.warn("Quiz score not saved yet. Please wait or try again.");
    }
  };

  return (
    <div className={styles.container}>
      {!showResults ? (
        <div className={styles.quizOutput}>
          <div className={styles.quizHeader}>
            <h2>📝 Quiz</h2>
            {/* Display current question number out of total */}
            <p className={styles.questionCounter}>
              Question {currentQuestionIndex + 1} of {quiz.length}
            </p>
          </div>

          {/* Single Question Card */}
          <div className={styles.questionCardWrapper}>
            <div className={styles.questionCard}>
              <strong>{`${currentQuestionIndex + 1}. ${
                currentQuestion.question
              }`}</strong>
              <div className={styles.options}>
                <div className={styles.answerGrid}>
                  {["A", "B", "C", "D"].map((letter, idx) => (
                    <div
                      key={idx}
                      className={`${styles.answerBox} ${
                        userAnswers[currentQuestionIndex] === letter
                          ? styles.selectedAnswer
                          : ""
                      }`}
                      onClick={() =>
                        handleAnswerChange(currentQuestionIndex, letter)
                      }
                    >
                      <strong>{letter}.</strong> {currentQuestion.options[idx]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className={styles.navigationContainer}>
            <button
              className={styles.backButton}
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0}
            >
              ← Previous
            </button>

            <button className={styles.submitButton} onClick={goToNextQuestion}>
              {currentQuestionIndex === quiz.length - 1
                ? "✅ Finish Quiz"
                : "Next →"}
            </button>
          </div>

          {/* Back to Generator Button */}
          <button
            className={styles.backButton}
            onClick={() => navigate("/quiz")}
          >
            ← Back to Generator
          </button>
        </div>
      ) : (
        <div className={styles.resultsBox}>
          <div className={styles.resultsHeader}>
            <span role="img" aria-label="trophy" className={styles.trophyIcon}>
              🏆
            </span>
            <h3>Quiz Completed!</h3>
          </div>

          <div className={styles.scoreSummary}>
            <p className={styles.scoreText}>
              You got{" "}
              <span className={styles.scoreHighlight}>
                {score.correct}/{score.total}
              </span>{" "}
              correct
            </p>
            <p className={`${styles.accuracyText} ${getAccuracyClass()}`}>
              Accuracy: <strong>{accuracyPercentage}%</strong>
            </p>

            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: `${accuracyPercentage}%` }}
              ></div>
            </div>

            <p className={styles.feedbackMessage}>{getFeedbackMessage()}</p>
          </div>

          <div className={styles.resultsActions}>
            <button
              className={styles.regenerateButton}
              onClick={() => navigate("/quiz")}
            >
              🔁 Regenerate Quiz
            </button>
            {/* Review Answers Button - Corrected class */}
            <button
              className={styles.reviewButton}
              onClick={handleReviewAnswers}
              disabled={!savedQuizScoreId}
            >
              📝 Review Answers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
