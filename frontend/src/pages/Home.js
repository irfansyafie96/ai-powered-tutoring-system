import React, { useEffect, useState } from "react";
import { getFullLibrary } from "../api/api";
import styles from "../styles/Home.module.css";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getFullLibrary();
        setRecentNotes(data.slice(0, 3)); // Show only 3 recent notes
      } catch (err) {
        console.error("Failed to load recent notes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
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
            <p>You don’t have any notes yet.</p>
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
    </div>
  );
}
