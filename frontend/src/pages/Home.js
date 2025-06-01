import React, { useEffect, useState } from "react";
import { getMyNotes } from "../api/api";
import styles from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notes = await getMyNotes();
        setRecentNotes(notes.slice(0, 4)); // Show up to 4 notes
      } catch (err) {
        console.error("Failed to load recent notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  if (loading) {
    return <p>Loading your library...</p>;
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
            <p>You haven’t uploaded any notes yet.</p>
          ) : (
            <div className={styles.notePreviewGrid}>
              {recentNotes.slice(0, 3).map((note) => (
                <div key={note.id} className={styles.notePreviewCard}>
                  <h3>{note.subject || "Untitled Note"}</h3>
                  <p>
                    <strong>Topic:</strong> {note.topic || "—"}
                  </p>
                  <p className={styles.summaryPreview}>
                    {note.summary.split("\n").slice(0, 3).join("\n")}
                  </p>
                  <button
                    onClick={() => navigate("/summary", { state: note })}
                    className={styles.viewSummaryButton}
                  >
                    📄 View Summary
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
