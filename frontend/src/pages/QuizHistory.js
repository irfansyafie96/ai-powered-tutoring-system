import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getQuizHistory } from "../api/api";
import styles from "../styles/QuizHistory.module.css";

export default function QuizHistory() {
  const navigate = useNavigate();
  const [quizHistory, setQuizHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchQuizHistory = async () => {
      try {
        const data = await getQuizHistory();
        setQuizHistory(data || []);
      } catch (err) {
        setError(
          err.response?.data?.error || "Failed to load your quiz history"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchQuizHistory();
  }, []);

  const filteredQuizHistory = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return quizHistory.filter((quiz) => {
      const topic = (quiz.note_topic || "").toLowerCase();
      // Assuming quiz.note_subject exists in the quiz object for searching.
      // If not, ensure your backend API for getQuizHistory returns it.
      const subject = (quiz.note_subject || "").toLowerCase();

      return (
        topic.includes(lowercasedQuery) || subject.includes(lowercasedQuery)
      );
    });
  }, [quizHistory, searchQuery]);

  const handleReviewQuiz = (quiz) => {
    navigate(`/quiz/${quiz.quiz_score_id}/review`);
  };

  if (loading) {
    return (
      <div className={styles.quizHistoryContainer}>
        <p className={styles.infoMessage}>Loading your quiz history...</p>
      </div>
    );
  }

  return (
    <div className={styles.quizHistoryContainer}>
      <div className={styles.header}>
        <h2>📊 My Quiz History</h2>
        <input
          type="text"
          placeholder="Search by topic or subject..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {quizHistory.length === 0 ? ( // Display if no quizzes ever
        <p className={styles.infoMessage}>
          You haven't completed any quizzes yet. Take a quiz to see your
          history!
        </p>
      ) : filteredQuizHistory.length === 0 ? ( // Display if no quizzes match search
        <p className={styles.infoMessage}>
          No quizzes found matching your search.
        </p>
      ) : (
        // Display filtered quizzes
        <div className={styles.quizGrid}>
          {filteredQuizHistory.map((quiz) => (
            <div key={quiz.quiz_score_id} className={styles.quizCard}>
              <h3>{quiz.note_topic || "Quiz on Untitled Note"}</h3>
              <p>
                <strong>Difficulty:</strong>{" "}
                <span className={styles[quiz.difficulty]}>
                  {quiz.difficulty.charAt(0).toUpperCase() +
                    quiz.difficulty.slice(1)}
                </span>
              </p>
              <p>
                <strong>Score:</strong> {quiz.correct_answers} /{" "}
                {quiz.total_questions}
              </p>
              <p className={styles.dateText}>
                {new Date(quiz.created_at).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <div className={styles.actions}>
                <button onClick={() => handleReviewQuiz(quiz)}>
                  📝 Review Quiz
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
