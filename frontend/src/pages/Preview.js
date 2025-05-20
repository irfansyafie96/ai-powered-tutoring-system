import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page } from "react-pdf";
import styles from "../styles/Preview.module.css";

export default function Preview() {
  const { state } = useLocation();
  const { fileUrl, summary } = state || {};
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!fileUrl) return;

    const handleResize = () => {
      const container = document.querySelector(`.${styles.paneLeft}`);
      if (container) {
        // Force a re-render by updating state if needed
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fileUrl]);

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
    console.error("PDF Error:", err);
    setError("Failed to load PDF document");
  };

  if (!fileUrl) {
    return (
      <p className={styles.pdfLoading}>
        No file to preview. Please upload first.
      </p>
    );
  }

  const cleanUrl = fileUrl.split(/[#?]/)[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();

  return (
    <div className={styles.previewContainer}>
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
                    <div className={styles.pdfLoading}>Loading document...</div>
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
      <div className={styles.summaryBox}>
        <div className={styles.summaryTitle}>
          <h3>Analysis & Summary</h3>
        </div>
        <div className={styles.summaryContent}>
          {summary
            ?.split("\n")
            .map((line, i) => (
              <p key={`summary_line_${i}`}>{line || <br />}</p>
            )) || <p className={styles.pdfLoading}>No analysis available</p>}
        </div>
      </div>
    </div>
  );
}
