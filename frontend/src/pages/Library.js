import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFullLibrary } from "../api/api";
import styles from "../styles/Library.module.css";

export default function Library() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [noNotes, setNoNotes] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getFullLibrary(); // ✅ Fetches both uploaded & saved notes
        setNotes(data || []); // ✅ Use fetched data
        setNoNotes(data.length === 0);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load your library");
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
        subject: note.subject || "Untitled Note",
        topic: note.topic || "—",
      },
    });
  };

  if (loading) {
    return <p className={styles.loading}>Loading your notes...</p>;
  }

  return (
    <div className={styles.libraryContainer}>
      <h2>📚 My Notes</h2>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {noNotes ? (
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
                <button onClick={() => handleViewSummary(note)}>
                  📄 View Summary
                </button>
                <small className={styles.uploadedBy}>
                  {note.type === "uploaded"
                    ? "You"
                    : `Saved from ${note.uploader_username}`}
                </small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
