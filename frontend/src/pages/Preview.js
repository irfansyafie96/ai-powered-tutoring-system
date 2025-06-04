import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import { saveNote, checkIfSaved } from "../api/api";
import styles from "../styles/Preview.module.css";
import MetadataModal from "../components/MetadataModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Preview() {
  const { state } = useLocation();
  const { fileUrl, summary } = state || {};
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [alreadySaved, setIsAlreadySaved] = useState(false);

  // Load text content if file is .txt
  useEffect(() => {
    if (!fileUrl?.toLowerCase().endsWith(".txt")) {
      setText("");
      return;
    }

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load text file");
        return res.text();
      })
      .then(setText)
      .catch(() => setText("Error loading text content"));
  }, [fileUrl]);

  const handlePdfError = (err) => {
    console.error("PDF Error:", err.message);
    setError("Failed to load PDF document");
  };

  const cleanUrl = fileUrl ? fileUrl.split(/[#?]/)[0] : null;
  const ext = cleanUrl ? cleanUrl.split(".").pop().toLowerCase() : "";

  // Check if this note was already saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!fileUrl?.id) return;

      try {
        const isSaved = await checkIfSaved(fileUrl.id);
        setIsAlreadySaved(isSaved);
      } catch (err) {
        console.error("Check saved status failed:", err);
      }
    };
    checkSavedStatus();
  }, [fileUrl]);

  const handleSave = async () => {
    if (!subject.trim() || !topic.trim()) {
      setSaveError("Subject and topic are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await saveNote({ fileUrl, summary, subject, topic });

      if (response.saved === false) {
        toast.info("📘 This note is already in your library", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
        });
      } else {
        toast.success("✅ Note saved to your collection!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
        });
      }

      // ✅ Always close modal after saving attempt
      setShowModal(false);
      setIsAlreadySaved(true); // Prevent future saves
      setSaveError(null);
    } catch (err) {
      console.error("Save failed:", err.message);
      toast.error("❌ Failed to save note", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
      });
      // setShowModal(true); // Uncomment if want to keep it open
    } finally {
      setSaving(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) {
      toast.error("❌ No summary available to copy", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    navigator.clipboard
      .writeText(summary)
      .then(() => {
        toast.success("📋 Summary copied to clipboard!", {
          position: "top-right",
          autoClose: 2000,
        });
      })
      .catch((err) => {
        console.error("Copy failed:", err);
        toast.error("⚠️ Failed to copy summary.", {
          position: "top-right",
          autoClose: 3000,
        });
      });
  };

  return (
    <div className={styles.previewContainer}>
      {/* Left Pane: Original Document */}
      {fileUrl && (
        <div className={styles.paneLeft}>
          <div className={styles.originalFileHeader}>
            <h3>Original Document</h3>
          </div>
          <div className={styles.originalFileContent}>
            {ext === "pdf" && (
              <div className={styles.pdfContainer}>
                {error ? (
                  <div className={styles.pdfLoading}>{error}</div>
                ) : (
                  <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onLoadError={handlePdfError}
                    loading={
                      <div className={styles.pdfLoading}>
                        Loading document...
                      </div>
                    }
                    error={null}
                  >
                    {Array.from({ length: numPages }, (_, i) => (
                      <Page
                        key={`page_${i + 1}`}
                        pageNumber={i + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                        loading={
                          <div className={styles.pdfLoading}>
                            Loading page {i + 1}...
                          </div>
                        }
                      />
                    ))}
                  </Document>
                )}
              </div>
            )}

            {ext === "txt" && (
              <div className={styles.pdfContainer}>
                <pre className={styles.textPreview}>{text}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Pane: AI Summary */}
      <div className={styles.summaryBox}>
        <div className={styles.summaryTitle}>
          <h3>📘 Summary</h3>

          <div className={styles.summaryActions}>
            <button
              onClick={handleCopySummary}
              title="Copy summary to clipboard"
              className={styles.btnAction}
            >
              📋 Copy
            </button>

            <button
              onClick={() => {
                if (alreadySaved) {
                  toast.info("📘 This note is already in your library", {
                    position: "top-right",
                    autoClose: 3000,
                  });
                  return;
                }
                setShowModal(true);
              }}
              title="Save these notes to your library"
              className={styles.btnAction}
            >
              💾 Save
            </button>
          </div>
        </div>

        <div className={styles.summaryContent}>
          {summary ? (
            summary
              .split("\n")
              .map((line, i) => (
                <p key={`summary_line_${i}`}>{line || <br />}</p>
              ))
          ) : (
            <p className={styles.pdfLoading}>No analysis available</p>
          )}
        </div>

        {/* Modal for saving */}
        {showModal && (
          <MetadataModal
            subject={subject}
            topic={topic}
            saving={saving}
            error={saveError}
            onSubjectChange={setSubject}
            onTopicChange={setTopic}
            onSave={handleSave}
            onCancel={() => {
              setShowModal(false);
              setSaveError(null);
            }}
          />
        )}

        {/* ✅ Toast Container */}
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
}
