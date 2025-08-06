import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getFullLibrary, deleteNote } from "../api/api";
import styles from "../styles/Library.module.css";
import { toast } from "react-toastify";

export default function Library() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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

  const handleDelete = async (noteId) => {
    try {
      await deleteNote(noteId);
      setNotes((prev) => prev.filter((n) => n.id !== noteId));
      toast.success("🗑️ Note deleted successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
      });
    } catch (err) {
      toast.error("❌ Failed to delete note", {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
      });
    } finally {
      setMenuOpenId(null);
      setConfirmDeleteId(null);
    }
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <button onClick={() => handleViewSummary(note)}>
                    📄 View Summary
                  </button>
                  {note.type === "uploaded" && (
                    <div className={styles.menuWrapper}>
                      <button
                        className={styles.menuButton}
                        onClick={() =>
                          setMenuOpenId(menuOpenId === note.id ? null : note.id)
                        }
                        title="More options"
                      >
                        ⋮
                      </button>
                      {menuOpenId === note.id && (
                        <div className={styles.menuDropdown}>
                          <button
                            className={styles.deleteOption}
                            onClick={() => {
                              setMenuOpenId(null);
                              setConfirmDeleteId(note.id);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <small className={styles.uploadedBy}>
                  {note.type === "uploaded"
                    ? "You"
                    : `Saved from ${note.uploader_username}`}
                </small>
              </div>
              {/* Confirmation dialog */}
              {confirmDeleteId === note.id && (
                <div className={styles.confirmDialog}>
                  <p>Are you sure you want to delete this note?</p>
                  <button
                    className={styles.confirmBtn}
                    onClick={() => handleDelete(note.id)}
                  >
                    Yes, Delete
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
