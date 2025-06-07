// D:\Projects\fyp\frontend\src\pages\UploadNote.js
import React, { useState } from "react";
import { uploadNote } from "../api/api";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UploadNote.module.css"; // Keep page-specific styles
import { useLoading } from "../contexts/LoadingContext"; // Import the hook

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { startLoading, stopLoading, updateProgress } = useLoading(); // Use the loading context

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    // Start loading via context
    startLoading("🧠 Analyzing notes...", 0); // Set initial message and 0%

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadNote(formData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          updateProgress(pct); // Update progress via context
        },
      });

      const { fileUrl, summary } = response?.note || {};
      if (!fileUrl || !summary) {
        throw new Error("Incomplete data received from server.");
      }
      stopLoading(); // Stop loading on success
      navigate("/summary", { state: { fileUrl, summary } });
    } catch (err) {
      console.error("Upload error:", err.message);
      stopLoading(); // Stop loading on error
      setError(err.response?.data?.error || "Upload failed");
    }
  };

  // The `if (loading)` block is completely removed from here.
  // The loading overlay is now handled by ProtectedLayout.

  return (
    <div className={styles.uploadContainer}>
      {error && <div className={styles.errorText}>{error}</div>}
      <h2>Upload Your Notes</h2>
      <form className={styles.uploadForm} onSubmit={handleSubmit}>
        <div className={styles.fileInputWrapper}>
          <input
            type="file"
            id="fileInput"
            accept=".pdf,.txt,.pptx"
            onChange={handleFileChange}
            className={styles.uploadInput}
          />
          <label htmlFor="fileInput" className={styles.uploadLabel}>
            {file ? file.name : "Choose file"}
          </label>
        </div>
        <button
          type="submit"
          disabled={false} // `loading` state is now handled by context and the overlay in ProtectedLayout
          className={styles.uploadButton}
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadNotes;
