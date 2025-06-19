import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFullLibrary } from "../api/api";
import styles from "../styles/Library.module.css";

export default function Library() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getFullLibrary();
        setNotes(data || []);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to load your library");
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  const filteredNotes = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return notes.filter((note) => {
      const subject = (note.subject || "").toLowerCase();
      const topic = (note.topic || "").toLowerCase();
      const summary = (note.summary || "").toLowerCase();
      return (
        subject.includes(lowercasedQuery) ||
        topic.includes(lowercasedQuery) ||
        summary.includes(lowercasedQuery)
      );
    });
  }, [notes, searchQuery]);

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
    return (
      <div className={styles.libraryContainer}>
        <p className={styles.infoMessage}>Loading your notes...</p>
      </div>
    );
  }

  return (
    <div className={styles.libraryContainer}>
      <div className={styles.header}>
        <h2>📚 My Notes</h2>
        <input
          type="text"
          placeholder="Search by subject, topic, or content..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
      {notes.length === 0 ? (
        <p className={styles.infoMessage}>
          You haven't saved any notes yet. Upload a note to get started!
        </p>
      ) : filteredNotes.length === 0 ? (
        <p className={styles.infoMessage}>
          No notes found matching your search.
        </p>
      ) : (
        <div className={styles.noteGrid}>
          {filteredNotes.map((note) => (
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
