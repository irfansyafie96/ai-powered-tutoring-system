import React, { useState } from "react";
import { uploadNote } from "../api/api";
import { useNavigate } from "react-router-dom";
import styles from "../styles/UploadNote.module.css";
import { useLoading } from "../contexts/LoadingContext";

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { startLoading, stopLoading, updateProgress, updateLoadingText } =
    useLoading();
  const [retryCount, setRetryCount] = useState(0);

  const handleRetry = () => {
    setError(null);
    setRetryCount((c) => c + 1);
    handleSubmit({ preventDefault: () => {} });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    // Validate file type
    if (selectedFile) {
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      ];
      const fileType = selectedFile.type;

      if (!allowedTypes.includes(fileType)) {
        setError("Please select a PDF, TXT, or PPTX file.");
        setFile(null);
        return;
      }
    }

    setFile(selectedFile);
    setError(null);

    // Show file size info and processing time estimate
    if (selectedFile) {
      const fileSizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      console.log(`Selected file: ${selectedFile.name} (${fileSizeMB} MB)`);

      // Estimate processing time based on file size
      let estimatedTime = "30-60 seconds";
      if (selectedFile.size > 5 * 1024 * 1024) {
        // > 5MB
        estimatedTime = "1-2 minutes";
      } else if (selectedFile.size > 2 * 1024 * 1024) {
        // > 2MB
        estimatedTime = "45-90 seconds";
      }

      console.log(`Estimated processing time: ${estimatedTime}`);
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!file) {
      setError("Please select a file first");
      return;
    }

    // Check file size on frontend (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      setError("File too large. Please upload a file smaller than 10MB.");
      return;
    }

    // Activates the global loading overlay with an initial message and progress
    startLoading("📄 Processing document...", 0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Simulate progress updates for better UX
      let progressInterval;
      let currentProgress = 0;

      progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          currentProgress += Math.random() * 10;
          updateProgress(Math.min(currentProgress, 90));

          // Update loading messages based on progress
          if (currentProgress < 30) {
            updateLoadingText("📄 Extracting text from document...");
          } else if (currentProgress < 60) {
            updateLoadingText("🧠 Analyzing content and generating summary...");
          } else if (currentProgress < 90) {
            updateLoadingText("✨ Finalizing summary...");
          }
        }
      }, 1000);

      const response = await uploadNote(formData, {
        onUploadProgress: (progressEvent) => {
          const pct = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          updateProgress(pct); // Updates the progress bar
        },
      });

      // Clear progress interval and show completion
      clearInterval(progressInterval);
      updateProgress(100);
      updateLoadingText("✅ Summary generated successfully!");

      const { fileUrl, summary, fileHash } = response?.note || {};
      if (!fileUrl || !summary) {
        throw new Error("Incomplete data received from server.");
      }

      // Brief delay to show completion message
      setTimeout(() => {
        stopLoading();
        navigate("/summary", { state: { fileUrl, summary, fileHash } });
      }, 1500);
    } catch (err) {
      console.error("Upload error:", err.message);
      stopLoading(); // Deactivates the global loading overlay on error

      // Handle specific timeout errors
      if (err.code === "ECONNABORTED" || err.message.includes("timeout")) {
        setError(
          "Processing took too long. Please try with a smaller document or try again later."
        );
      } else {
        setError(
          err.response?.data?.error || "Upload failed. Please try again."
        );
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.uploadContainer}>
        {error && (
          <div className={styles.errorText}>
            {error}
            <br />
            <button
              type="button"
              className={styles.uploadButton}
              onClick={handleRetry}
              style={{ marginTop: "1rem" }}
            >
              Retry
            </button>
          </div>
        )}
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
    </div>
  );
};

export default UploadNotes;
