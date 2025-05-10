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

  useEffect(() => {
    if (!fileUrl) return;

    // Clear text state for non-text files
    if (!fileUrl.toLowerCase().endsWith(".txt")) {
      setText("");
    }

    if (fileUrl.toLowerCase().endsWith(".txt")) {
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
    }
  }, [fileUrl]);

  const handlePdfError = (error) => {
    console.error("PDF Error:", error);
    setError("Failed to load PDF document");
  };

  if (!fileUrl) {
    return <p>No file to preview. Please upload first.</p>;
  }

  // Improved file extension parsing
  const cleanUrl = fileUrl.split(/[#?]/)[0];
  const ext = cleanUrl.split(".").pop().toLowerCase();

  return (
    <div className="previewContainer">
      {/* Left Pane - Original File */}
      <div className="pane left">
        <div className="originalFileBox">
          <div className="originalFileHeader">
            <h3>Original Document</h3>
          </div>

          <div className="originalFileContent">
            {ext === "pdf" && (
              <div className="scrollArea">
                {error ? (
                  <div className="pdfLoading">{error}</div>
                ) : (
                  <Document
                    file={fileUrl}
                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                    onLoadError={handlePdfError}
                    loading={
                      <div className="pdfLoading">
                        Analyzing document structure...
                      </div>
                    }
                  >
                    {Array.from({ length: numPages }, (_, i) => (
                      <Page
                        key={`page_${i + 1}`}
                        pageNumber={i + 1}
                        width={793}
                        renderTextLayer={false} // Disable text layer
                        loading={
                          <div className="pdfLoading">
                            Rendering page {i + 1}...
                          </div>
                        }
                      />
                    ))}
                  </Document>
                )}
              </div>
            )}

            {ext === "txt" && (
              <div className="scrollArea">
                <pre>{text}</pre>
              </div>
            )}

            {ext === "pptx" && (
              <div className="scrollArea">
                <iframe
                  title="pptx-viewer"
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                    fileUrl
                  )}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    borderRadius: "8px",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Pane - Document Summary */}
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
              )) || (
              <p className="pdfLoading">
                No analysis available. Generate insights using the AI tools
                above.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
