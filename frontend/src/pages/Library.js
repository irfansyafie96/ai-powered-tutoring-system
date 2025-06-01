import React, { useEffect, useState } from "react";
import { getMyNotes } from "../api/api";
import styles from "../styles/Library.module.css";

export default function Library() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getMyNotes();
        setNotes(data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load your library");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  if (loading) {
    return <p className={styles.loading}>Loading your notes...</p>;
  }

  return (
    <div className={styles.libraryContainer}>
      <h2>📚 My Notes</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {notes.length === 0 ? (
        <p>You haven't saved any notes yet.</p>
      ) : (
        <div className={styles.noteGrid}>
          {notes.map((note) => (
            <div key={note.id} className={styles.noteCard}>
              <h3>{note.subject || "Untitled Note"}</h3>
              <p>
                <strong>Topic:</strong> {note.topic || "—"}
              </p>
              <p className={styles.summaryPreview}>
                {note.summary.split("\n").slice(0, 3).join("\n")}
              </p>
              <div className={styles.actions}>
                <button onClick={() => alert("Coming soon!")}>
                  📄 View Summary
                </button>
                <small className={styles.uploadedBy}>
                  Uploaded on: {new Date(note.created_at).toLocaleDateString()}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
