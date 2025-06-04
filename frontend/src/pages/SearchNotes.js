// D:\Projects\fyp\frontend\src\pages\SearchNotes.js
import React, { useState } from "react";
import { searchNotes, saveToLibrary } from "../api/api";
import styles from "../styles/SearchNotes.module.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function SearchNotes() {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!subject && !topic && !keyword) {
      setError("Please enter at least one search term");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await searchNotes({ subject, topic, keyword });
      setResults(data);
    } catch (err) {
      setError(err.response?.data?.error || "No matching notes found");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (noteId) => {
    try {
      const response = await saveToLibrary(noteId);
      console.log("Server response:", response);

      if (response?.data?.saved === false) {
        toast.info("📘 Note already in your library", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else if (response?.data?.saved === true) {
        toast.success("✅ Note saved to your library", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.warn("⚠️ Unexpected response from server", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: true,
        });
      }
    } catch (err) {
      console.error("Save failed:", err.message);
      toast.error("❌ Failed to save note", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
      });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.searchTitle}>🔍 Search Notes</h2>
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <input
          type="text"
          placeholder="Subject (e.g., IT Architecture)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Topic (e.g., Interfacing)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={loading}
        />
        <input
          type="text"
          placeholder="Keyword in summary (e.g., UART)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className={styles.errorMessage}>{error}</p>}

      <div className={styles.results}>
        {results.length === 0 && !loading && <p>No notes match your search.</p>}

        {results.map((note) => (
          <div key={note.id} className={styles.noteCard}>
            <h3>{note.subject || "Untitled Note"}</h3>
            <p>
              <strong>Topic:</strong> {note.topic || "—"}
            </p>
            <p className={styles.summaryPreview}>
              {note.summary.split("\n").slice(0, 3).join("\n")}
            </p>
            <div className={styles.actions}>
              <button
                onClick={() => handleSave(note.id)}
                className={styles.saveButton}
              >
                💾 Save to My Library
              </button>
              <small className={styles.uploadedBy}>
                Uploaded by: {note.uploader_username}
              </small>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Toast container added here */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
