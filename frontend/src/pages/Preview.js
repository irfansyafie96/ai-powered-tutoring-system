// src/pages/Preview.js
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveNote, checkIfSaved } from "../api/api";
import styles from "../styles/Preview.module.css";
import MetadataModal from "../components/MetadataModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Preview() {
  const { state } = useLocation();
  const { fileUrl, summary, fileHash } = state || {};
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [alreadySaved, setIsAlreadySaved] = useState(false);

  useEffect(() => {
    if (!fileUrl?.toLowerCase().endsWith(".txt")) return setText("");
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
      const response = await saveNote({
        fileUrl,
        summary,
        subject,
        topic,
        fileHash,
      });
      if (response.saved === false) {
        toast.info("📘 This note is already in your library", {
          autoClose: 3000,
        });
      } else {
        toast.success("✅ Note saved to your collection!", { autoClose: 2000 });
      }
      setShowModal(false);
      setIsAlreadySaved(true);
      setSaveError(null);
    } catch (err) {
      toast.error("❌ Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleCopySummary = () => {
    if (!summary) {
      toast.error("❌ No summary available to copy");
      return;
    }
    navigator.clipboard
      .writeText(summary)
      .then(() =>
        toast.success("📋 Summary copied to clipboard!", { autoClose: 2000 })
      )
      .catch(() => toast.error("⚠️ Failed to copy summary."));
  };

  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      return (
        <pre className={styles.markdownCode}>
          <code {...props}>{children}</code>
        </pre>
      );
    },
    blockquote({ children }) {
      return (
        <blockquote className={styles.markdownQuote}>{children}</blockquote>
      );
    },
    h1: ({ children }) => (
      <h1 className={styles.markdownHeading}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={styles.markdownHeading}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={styles.markdownHeading}>{children}</h3>
    ),
    li: ({ children }) => (
      <li className={styles.markdownListItem}>{children}</li>
    ),
    p: ({ children }) => <p className={styles.markdownParagraph}>{children}</p>,
  };

  return (
    <div className={styles.previewContainer}>
      {fileUrl && (
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <h3>Original Document</h3>
          </div>
          <div className={styles.paneContent}>
            {ext === "pdf" ? (
              <div className={styles.pdfContainer}>
                {error ? (
                  <div className={styles.pdfLoading}>{error}</div>
                ) : (
                  <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onLoadError={handlePdfError}
                    loading={
                      <div className={styles.pdfLoading}>Loading...</div>
                    }
                    error={null}
                  >
                    {Array.from({ length: numPages }, (_, i) => (
                      <Page
                        key={`page_${i + 1}`}
                        pageNumber={i + 1}
                        renderTextLayer={false}
                        renderAnnotationLayer={false}
                      />
                    ))}
                  </Document>
                )}
              </div>
            ) : (
              <div className={styles.pdfContainer}>
                <pre className={styles.textPreview}>{text}</pre>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={styles.pane}>
        <div className={styles.paneHeader}>
          <h3>📘 Summary</h3>
          <div className={styles.summaryActions}>
            <button
              onClick={handleCopySummary}
              className={styles.btnAction}
              title="Copy summary"
            >
              📋 Copy
            </button>
            <button
              onClick={() =>
                alreadySaved
                  ? toast.info("📘 Already saved")
                  : setShowModal(true)
              }
              className={styles.btnAction}
              title="Save summary"
            >
              💾 Save
            </button>
          </div>
        </div>
        <div className={styles.paneContent}>
          {summary ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {summary}
            </ReactMarkdown>
          ) : (
            <p className={styles.pdfLoading}>No analysis available</p>
          )}
        </div>
      </div>

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
      <ToastContainer />
    </div>
  );
}
