import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../styles/QuizPage.module.css"; // Ensure this file exists and contains quiz-related styles

export default function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Ensure quiz is safely accessed, defaulting to an empty array if not present
  const quiz = location.state?.quiz || [];

  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState({
    correct: 0,
    total: quiz.length, // Initialize total based on quiz length
  });

  // Effect to update total score if quiz data changes (e.g., if re-generated in place, though not likely here)
  React.useEffect(() => {
    setScore((prevScore) => ({ ...prevScore, total: quiz.length }));
  }, [quiz.length]);

  if (quiz.length === 0 && !showResults) {
    // Added quiz.length === 0 check
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

  const submitQuiz = () => {
    let correct = 0;
    quiz.forEach((q, index) => {
      // Check if the question was answered and if the answer is correct
      if (
        userAnswers[index] !== undefined &&
        userAnswers[index] === q.correctAnswer
      ) {
        correct++;
      }
    });
    setScore({ correct, total: quiz.length });
    setShowResults(true);
  };

  return (
    <div className={styles.container}>
      <h2>📝 Quiz</h2>

      {!showResults ? (
        // Add a div with styles.quizOutput here to wrap the questions
        <div className={styles.quizOutput}>
          {quiz.map((q, index) => (
            <div key={index} className={styles.questionCard}>
              <strong>{`${index + 1}. ${q.question}`}</strong>
              <div className={styles.options}>
                {["A", "B", "C", "D"].map((letter, idx) => (
                  <label key={idx} className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={`question-${index}`}
                      value={letter}
                      onChange={() => handleAnswerChange(index, letter)}
                      // Set checked property based on userAnswers
                      checked={userAnswers[index] === letter}
                    />
                    <span>{`${letter}. ${q.options[idx]}`}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className={styles.submitButton} onClick={submitQuiz}>
            ✅ Submit Answers
          </button>

          {/* This button might be better placed within a separate div or styled to be below the submit button */}
          <button
            className={styles.backButton}
            onClick={() => navigate("/quiz")}
          >
            ← Back to Generator
          </button>
        </div> // Closing div for quizOutput
      ) : (
        <div className={styles.resultsBox}>
          <h3>📈 Your Score</h3>
          <p>
            You got{" "}
            <strong>
              {score.correct}/{score.total}
            </strong>{" "}
            correct
          </p>
          <p>
            Accuracy:{" "}
            <strong>
              {score.total > 0
                ? Math.round((score.correct / score.total) * 100)
                : 0}
              %
            </strong>
          </p>

          <button
            className={styles.backButton} // Reusing backButton style for Regenerate
            onClick={() => navigate("/quiz")}
          >
            🔁 Regenerate Quiz
          </button>
        </div>
      )}
    </div>
  );
}
