import React, { useState } from "react";
import { uploadNote } from "../api/api";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UploadNote.module.css";

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const navigate = useNavigate();

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

    setLoading(true);
    setPercent(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadNote(formData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setPercent(pct);
        },
      });

      const { fileUrl, summary } = response.note;
      navigate("/summary", { state: { fileUrl, summary } });
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingOverlay}>
        <div className={styles.loadingBar}>
          <div
            className={styles.loadingFill}
            style={{ width: `${percent}%` }}
          />
        </div>
        <p>Uploading... {percent}%</p>
      </div>
    );
  }

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
          disabled={loading}
          className={styles.uploadButton}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadNotes;
