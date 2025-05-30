import React, { useState } from "react";
import { searchNotes } from "../api/api";
import styles from "../styles/SearchNotes.module.css";

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
              <button onClick={() => alert("Feature coming soon!")}>
                💾 Save to My Library
              </button>
              <small className={styles.uploadedBy}>
                Uploaded by: {note.uploader_username}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
