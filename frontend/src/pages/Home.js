import React, { useEffect, useState } from "react";
import { getFullLibrary, getQuizHistory } from "../api/api";
import styles from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingQuizHistory, setLoadingQuizHistory] = useState(true);

  useEffect(() => {
    const fetchNotesAndQuizHistory = async () => {
      try {
        const notesData = await getFullLibrary();
        setRecentNotes(notesData.slice(0, 3)); // Show only 3 recent notes
      } catch (err) {
        console.error("Failed to load recent notes:", err);
      } finally {
        setLoadingNotes(false);
      }

      // Fetch quiz history
      try {
        const historyData = await getQuizHistory();
        // Limit to 3 recent quiz attempts for the home page
        setQuizHistory(historyData.slice(0, 3));
      } catch (err) {
        console.error("Failed to load quiz history:", err);
      } finally {
        // Fixed typo here (added '}')
        setLoadingQuizHistory(false);
      }
    };
    fetchNotesAndQuizHistory();
  }, []);

  const handleViewSummary = (note) => {
    navigate("/summary", {
      state: {
        fileUrl: note.fileurl,
        summary: note.summary,
        subject: note.subject,
        topic: note.topic,
      },
    });
  };

  // New handler for reviewing past quiz attempts
  const handleReviewPastQuiz = (quiz) => {
    navigate(`/quiz/${quiz.quiz_score_id}/review`);
  };

  // Combine loading states for initial render
  if (loadingNotes || loadingQuizHistory) {
    return <p>Loading your dashboard...</p>;
  }

  return (
    <div className={styles.homeContainer}>
      <section className={styles.hero}>
        <h1>Welcome back!</h1>
        <p>Manage and review your AI-analyzed lecture notes</p>
        <button
          onClick={() => navigate("/upload")}
          className={styles.ctaButton}
        >
          ➕ Upload New Note
        </button>
      </section>

      {/* Your Notes Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>📚 Your Notes</h2>
          <button
            className={styles.viewAllButton}
            onClick={() => navigate("/library")}
          >
            ➡️ View All
          </button>
        </div>

        <div className={styles.notePreviewGrid}>
          {recentNotes.length === 0 ? (
            <p>You don’t have any notes yet. Upload one to get started!</p>
          ) : (
            recentNotes.map((note) => (
              <div key={note.id} className={styles.notePreviewCard}>
                <h3>{note.subject || "Untitled Note"}</h3>
                <p>
                  <strong>Topic:</strong> {note.topic || "—"}
                </p>
                <p className={styles.summaryPreview}>
                  {note.summary.split("\n").slice(0, 3).join("\n")}{" "}
                </p>
                <button
                  onClick={() => handleViewSummary(note)}
                  className={styles.viewSummaryButton}
                >
                  📄 View Summary
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Past Quiz Attempts Section */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>📊 Past Quiz Attempts</h2>
          {/* You might want a "View All Quizzes" button here if you create a dedicated quiz history page */}
          <button
            className={styles.viewAllButton}
            onClick={() =>
              navigate("/quiz-history")
            } /* Assuming you'll create this route */
          >
            ➡️ View All
          </button>
        </div>

        <div className={styles.quizAttemptsGrid}>
          {quizHistory.length === 0 ? (
            <p>
              You haven’t completed any quizzes yet. Generate one from a note!
            </p>
          ) : (
            quizHistory.map((quiz) => (
              <div key={quiz.quiz_score_id} className={styles.quizAttemptCard}>
                <h4>{quiz.note_topic || "Quiz on Untitled Note"}</h4>
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
                <button
                  onClick={() => handleReviewPastQuiz(quiz)}
                  className={styles.reviewQuizButton}
                >
                  📝 Review Quiz
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
