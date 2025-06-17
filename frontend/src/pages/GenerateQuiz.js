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

    // Start loading via context with an initial message
    startLoading("🧠 Generating quiz..."); // This sets the initial loading state

    try {
      // MODIFIED: quizCreation call - removed numQuestions
      const response = await quizCreation(selectedNote.id, difficulty);

      if (response.quiz && Array.isArray(response.quiz)) {
        updateProgress(100); // Set progress to 100%
        startLoading("✅ Quiz generated!"); // Change message to success indicator

        // Give the user a moment to see the "100% / success" message
        setTimeout(() => {
          stopLoading(); // Now, hide the loading bar
          navigate("/quizAnswer", {
            state: {
              quiz: response.quiz,
              noteId: selectedNote.id,
              difficulty: difficulty,
            },
          });
        }, 3000);
      } else {
        throw new Error("Invalid quiz format received");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err.message);
      stopLoading(); // Always stop loading on error
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
          title="Choose Quiz Options"
          description="Select difficulty for your quiz."
          onCancel={() => setShowDifficultyModal(false)}
          onSave={handleGenerateQuiz}
        >
          {/* Existing Difficulty Selection */}
          <div>
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
          </div>
        </DifficultyModal>
      )}

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
