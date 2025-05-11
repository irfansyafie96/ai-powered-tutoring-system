import React from "react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page } from "react-pdf";
import "../styles/Preview.css";

export default function Preview() {
  const { state } = useLocation();
  const { fileUrl, summary } = state || {};
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    if (!fileUrl) return;

    const handleResize = () => {
      const container = document.querySelector(".pane.left");
      if (container) {
        setContainerWidth(container.offsetWidth - 48); // Account for padding
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, [fileUrl]);

  useEffect(() => {
    if (!fileUrl || !fileUrl.toLowerCase().endsWith(".txt")) {
      setText("");
      return;
    }

    fetch(fileUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load text file");
        return res.text();
      })
      .then(setText)
      .catch((error) => {
        console.error("Text load error:", error);
        setText("Error loading text content");
      });
  }, [fileUrl]);

  const handlePdfError = (error) => {
    console.error("PDF Error:", error);
    setError("Failed to load PDF document");
  };

  if (!fileUrl) {
    return (
      <p className="pdf-loading">No file to preview. Please upload first.</p>
    );
  }

  const cleanUrl = fileUrl.split(/[#?]/)[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();

  return (
    <div className="previewContainer">
      {/* Left Pane - Document Viewer */}
      <div className="pane left">
        <div className="originalFileHeader">
          <h3>Original Document</h3>
        </div>

        <div className="originalFileContent">
          {ext === "pdf" && (
            <div className="pdf-container">
              {error ? (
                <div className="pdf-loading">{error}</div>
              ) : (
                <Document
                  file={fileUrl}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  onLoadError={handlePdfError}
                  loading={
                    <div className="pdf-loading">Loading document...</div>
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
                        <div className="pdf-loading">
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
            <div className="pdf-container">
              <pre className="text-preview">{text}</pre>
            </div>
          )}

          {ext === "pptx" && (
            <div className="pdf-container">
              <iframe
                title="pptx-viewer"
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                  fileUrl
                )}`}
                className="ppt-viewer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Summary */}
      <div className="pane right">
        <div className="summaryBox">
          <div className="summaryTitle">
            <h3>Analysis & Summary</h3>
          </div>
          <div className="summaryContent">
            {summary
              ?.split("\n")
              .map((line, i) => (
                <p key={`summary_line_${i}`}>{line || <br />}</p>
              )) || <p className="pdf-loading">No analysis available</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
