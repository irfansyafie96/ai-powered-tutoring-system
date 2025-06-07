import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getFullLibrary, quizCreation } from "../api/api";
import styles from "../styles/GenerateQuiz.module.css";
import DifficultyModal from "../components/DifficultyModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoading } from "../contexts/LoadingContext";

export default function GenerateQuiz() {
  const navigate = useNavigate();
  const { startLoading, stopLoading, updateProgress } = useLoading();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Load notes from user's library
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getFullLibrary();
        if (!data.length) {
          toast.info("📘 No saved notes found. Save some notes first.");
          navigate("/library");
        }
        setNotes(data);
      } catch (err) {
        console.error("Load notes error:", err.message);
        toast.error("❌ Failed to load your notes.");
      }
    };

    fetchNotes();
  }, []);

  // Handle note selection
  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setShowDifficultyModal(true);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedNote) return;

    setShowDifficultyModal(false);

    // Start loading via context
    startLoading("🧠 Generating quiz..."); // Pass a message

    try {
      const response = await quizCreation(selectedNote.id, difficulty);

      if (response.quiz && Array.isArray(response.quiz)) {
        // Optional: you can update progress to 100% here if you want the bar to fill before navigating
        // updateProgress(100);
        // startLoading("✅ Quiz generated!"); // You could change message to "Quiz generated!"
        setTimeout(() => {
          stopLoading(); // Stop loading before navigating
          navigate("/quizAnswer", { state: { quiz: response.quiz } });
        }, 800);
      } else {
        throw new Error("Invalid quiz format received");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err.message);
      stopLoading(); // Stop loading on error
      toast.error("❌ Failed to generate quiz", { autoClose: 3000 });
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧪 Select a Note</h2>

      {/* Step 1: Note Cards */}
      <div className={styles.noteGrid}>
        {notes.map((note) => (
          <div
            key={note.id}
            className={`${styles.noteCard} ${
              selectedNote?.id === note.id ? styles.selected : ""
            }`}
            onClick={() => handleNoteSelect(note)}
          >
            <h3>{note.subject || "Untitled"}</h3>
            <p>
              <strong>Topic:</strong> {note.topic || "—"}
            </p>
            <small>{note.type === "uploaded" ? "You" : "Saved"}</small>
          </div>
        ))}
      </div>

      {/* Step 2: Difficulty Modal */}
      {showDifficultyModal && (
        <DifficultyModal
          title="Choose Quiz Difficulty"
          description="Select a difficulty level for your quiz."
          onCancel={() => setShowDifficultyModal(false)}
          onSave={handleGenerateQuiz}
        >
          <label htmlFor="difficulty">Select Difficulty:</label>
          <select
            id="difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={styles.select}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </DifficultyModal>
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
