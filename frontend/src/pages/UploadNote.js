import React from "react";
import { useState } from "react";
import { uploadNote } from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/UploadNotes.css";

const UploadNotes = () => {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [percent, setPercent] = useState(0);
  const navigate = useNavigate();

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setError(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

      navigate("/summary", {
        state: {
          fileUrl,
          summary,
        },
      });
    } catch (error) {
      setError(error.response?.data?.error || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loadingOverlay">
        <div className="loadingBar">
          <div className="loadingFill" style={{ width: `${percent}%` }}></div>
        </div>
        <p>Uploading... {percent}%</p>
      </div>
    );
  }

  return (
    <div className="uploadContainer">
      {error && (
        <div className="errorText" style={{ color: "red" }}>
          {error}
        </div>
      )}
      <h2>Upload Your Notes</h2>
      <form className="uploadForm" onSubmit={handleSubmit}>
        <div className="fileInputWrapper">
          <input
            type="file"
            id="fileInput"
            accept=".pdf, .txt, .pptx"
            onChange={handleFileChange}
            className="uploadInput"
          />
          <label htmlFor="fileInput">{file ? file.name : "Choose file"}</label>
        </div>
        <button type="submit" disabled={loading} className="uploadButton">
          {loading ? "Uploading..." : "Upload"}
        </button>
      </form>
    </div>
  );
};

export default UploadNotes;
