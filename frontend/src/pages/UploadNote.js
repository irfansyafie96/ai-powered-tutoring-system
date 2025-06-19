import React, { useState } from "react";
import { uploadNote } from "../api/api";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UploadNote.module.css";
import { useLoading } from "../contexts/LoadingContext";

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { startLoading, stopLoading, updateProgress } = useLoading();

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

    // Activates the global loading overlay with an initial message and progress
    startLoading("🧠 Analyzing notes...", 0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadNote(formData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          updateProgress(pct); // Updates the progress bar
        },
      });

      const { fileUrl, summary } = response?.note || {};
      if (!fileUrl || !summary) {
        throw new Error("Incomplete data received from server.");
      }
      stopLoading(); // Deactivates the global loading overlay on success
      navigate("/summary", { state: { fileUrl, summary } });
    } catch (err) {
      console.error("Upload error:", err.message);
      stopLoading(); // Deactivates the global loading overlay on error
      setError(err.response?.data?.error || "Upload failed");
    }
  };

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
          disabled={false} // Loading state is managed by the global context/overlay
          className={styles.uploadButton}
        >
          Upload
        </button>
      </form>
    </div>
  );
};

export default UploadNotes;
