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

  // All hooks must be called before any conditional returns
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [alreadySaved, setIsAlreadySaved] = useState(false);

  // Ensure fileUrl is a string to prevent React rendering errors
  const fileUrlString =
    typeof fileUrl === "string" ? fileUrl : fileUrl?.path || fileUrl?.url || "";
  const cleanUrl = fileUrlString ? fileUrlString.split(/[#?]/)[0] : null;
  const ext = cleanUrl ? cleanUrl.split(".").pop().toLowerCase() : "";

  // Debug logging to identify the issue
  useEffect(() => {
    console.log("Preview component state:", { fileUrl, summary, fileHash });
    console.log("fileUrl type:", typeof fileUrl);
    console.log("summary type:", typeof summary);
    if (fileUrl && typeof fileUrl === "object") {
      console.log("fileUrl is an object:", fileUrl);
    }

    // Additional validation
    if (fileUrl && typeof fileUrl !== "string") {
      console.error("fileUrl is not a string:", fileUrl);
    }
    if (summary && typeof summary !== "string") {
      console.error("summary is not a string:", summary);
    }
  }, [fileUrl, summary, fileHash]);

  // Detailed debugging
  useEffect(() => {
    console.log("=== DEBUGGING STATE ===");
    console.log("Raw state:", JSON.stringify(state, null, 2));
    console.log("fileUrl:", fileUrl, "type:", typeof fileUrl);
    console.log("summary:", summary, "type:", typeof summary);
    console.log("fileHash:", fileHash, "type:", typeof fileHash);
    
    // Check if any values are React elements
    if (fileUrl && typeof fileUrl === 'object' && fileUrl.$$typeof) {
      console.error("fileUrl is a React element!", fileUrl);
    }
    if (summary && typeof summary === 'object' && summary.$$typeof) {
      console.error("summary is a React element!", summary);
    }
  }, [state, fileUrl, summary, fileHash]);

  useEffect(() => {
    if (!fileUrlString?.toLowerCase().endsWith(".txt")) return setText("");
    fetch(fileUrlString)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load text file");
        return res.text();
      })
      .then(setText)
      .catch(() => setText("Error loading text content"));
  }, [fileUrlString]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      // Only check if fileUrl is an object with an id property
      if (!fileUrl || typeof fileUrl !== "object" || !fileUrl.id) return;
      try {
        const isSaved = await checkIfSaved(fileUrl.id);
        setIsAlreadySaved(isSaved);
      } catch (err) {
        console.error("Check saved status failed:", err);
      }
    };
    checkSavedStatus();
  }, [fileUrl]);

  const handlePdfError = (err) => {
    console.error("PDF Error:", err.message);
    setError("Failed to load PDF document");
  };

  // Handle missing state data
  if (!state || !fileUrl || !summary) {
    console.error("Missing required state data:", state);
    return (
      <div className={styles.previewContainer}>
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <h3>Error</h3>
          </div>
          <div className={styles.paneContent}>
            <p>
              No summary data available. Please try uploading your file again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!subject.trim() || !topic.trim()) {
      setSaveError("Subject and topic are required.");
      return;
    }

    setSaving(true);
    try {
      const response = await saveNote({
        fileUrl: fileUrlString, // Use the safe string version
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
    if (!summary || typeof summary !== "string") {
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
      // Ensure children is always a string
      const codeContent = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      
      return (
        <pre className={styles.markdownCode}>
          <code {...props}>{codeContent}</code>
        </pre>
      );
    },
    blockquote({ children }) {
      // Ensure children is properly handled
      return (
        <blockquote className={styles.markdownQuote}>
          {children}
        </blockquote>
      );
    },
    h1: ({ children }) => {
      // Convert children to string if needed
      const headingText = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      return <h1 className={styles.markdownHeading}>{headingText}</h1>;
    },
    h2: ({ children }) => {
      const headingText = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      return <h2 className={styles.markdownHeading}>{headingText}</h2>;
    },
    h3: ({ children }) => {
      const headingText = Array.isArray(children) 
        ? children.join('') 
        : String(children || '');
      return <h3 className={styles.markdownHeading}>{headingText}</h3>;
    },
    li: ({ children }) => (
      <li className={styles.markdownListItem}>{children}</li>
    ),
    p: ({ children }) => (
      <p className={styles.markdownParagraph}>{children}</p>
    ),
  };

  // Deep check for React elements in the data
  const deepCheckForReactElements = (obj, path = '') => {
    if (obj && typeof obj === 'object') {
      if (obj.$$typeof) {
        console.error(`Found React element at ${path}:`, obj);
        return true;
      }
      for (const [key, value] of Object.entries(obj)) {
        if (deepCheckForReactElements(value, `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Check all your state data
  console.log("=== DEEP DEBUGGING ===");
  console.log("State:", state);
  deepCheckForReactElements(state, 'state');
  deepCheckForReactElements({ fileUrl, summary, fileHash }, 'props');

  // Check if summary contains any problematic characters or structures
  if (summary) {
    console.log("Summary length:", summary.length);
    console.log("Summary first 100 chars:", summary.substring(0, 100));
    console.log("Summary last 100 chars:", summary.substring(summary.length - 100));
    
    // Check for any non-string content
    try {
      JSON.parse(JSON.stringify(summary));
      console.log("Summary JSON serialization: OK");
    } catch (e) {
      console.error("Summary JSON serialization failed:", e);
    }
  }

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
                  <div>
                    {(() => {
                      try {
                        return (
                          <Document
                            file={fileUrlString}
                            onLoadSuccess={({ numPages }) =>
                              setNumPages(numPages)
                            }
                            onLoadError={handlePdfError}
                            loading={
                              <div className={styles.pdfLoading}>
                                Loading...
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
                              />
                            ))}
                          </Document>
                        );
                      } catch (error) {
                        console.error("Error rendering PDF:", error);
                        return (
                          <div className={styles.pdfLoading}>
                            Error loading PDF
                          </div>
                        );
                      }
                    })()}
                  </div>
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
          {summary && typeof summary === "string" && summary.length > 0 ? (
            <div>
              {(() => {
                try {
                  // Clean the summary text first
                  const cleanSummary = String(summary).trim();
                  
                  // Additional safety check for any embedded objects
                  if (typeof cleanSummary !== 'string') {
                    throw new Error('Summary is not a string after cleaning');
                  }
                  
                  return (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={markdownComponents}
                      // Add these props for better safety
                      skipHtml={true}
                      transformLinkUri={(uri) => uri}
                    >
                      {cleanSummary}
                    </ReactMarkdown>
                  );
                } catch (error) {
                  console.error("Error rendering markdown:", error);
                  console.error("Summary value:", summary);
                  console.error("Summary type:", typeof summary);
                  
                  // Fallback: render as plain text
                  return (
                    <div className={styles.markdownParagraph}>
                      <h3>Summary (Plain Text)</h3>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                        {String(summary)}
                      </pre>
                    </div>
                  );
                }
              })()}
            </div>
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
