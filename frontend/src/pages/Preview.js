import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Document, Page } from "react-pdf";
import "../styles/Preview.css";

export default function Preview() {
  const { state } = useLocation();
  const { fileUrl, summary } = state || {};
  const [numPages, setNumPages] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!fileUrl) return;

    if (fileUrl.endsWith(".txt")) {
      fetch(fileUrl)
        .then((res) => res.text())
        .then(setText)
        .catch(console.error);
    }
  }, [fileUrl]);

  if (!fileUrl) {
    return <p>No file to preview. Please upload first.</p>;
  }

  const ext = fileUrl.split(".").pop().toLowerCase();
  console.log(`Base URL is ${process.env.BASE_URL}`);
  console.log(fileUrl);

  return (
    <div className="previewContainer">
      <div className="pane left">
        <h3>Original File</h3>
        {ext === "pdf" && (
          <div className="scrollArea">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            >
              {Array.from({ length: numPages }, (_, i) => (
                <Page key={i} pageNumber={i + 1} />
              ))}
            </Document>
          </div>
        )}

        {ext === "txt" && (
          <div className="scrollArea">
            <pre>{text}</pre>
          </div>
        )}

        {ext === "pptx" && (
          <iframe
            title="pptx-viewer"
            src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
              fileUrl
            )}`}
            className="scrollArea"
          />
        )}
      </div>

      <div className="pane right">
        <h3>Summary</h3>
        <div className="scrollArea">
          <p>{summary}</p>
        </div>
      </div>
    </div>
  );
}
