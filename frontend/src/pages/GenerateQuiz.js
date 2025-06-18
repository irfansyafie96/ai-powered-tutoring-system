import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getFullLibrary, quizCreation } from "../api/api";
import styles from "../styles/GenerateQuiz.module.css";
import DifficultyModal from "../components/DifficultyModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useLoading } from "../contexts/LoadingContext";

export default function GenerateQuiz() {
  const { startLoading, stopLoading, updateProgress, updateLoadingText } =
    useLoading();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const progressIntervalRef = useRef(null);

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

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [navigate]);

  const handleNoteSelect = (note) => {
    setSelectedNote(note);
    setShowDifficultyModal(true);
  };

  const handleGenerateQuiz = async () => {
    if (!selectedNote || isGenerating) {
      return;
    }

    setShowDifficultyModal(false);
    setIsGenerating(true);

    startLoading("🧠 Generating quiz. This might take a moment.");
    updateProgress(0);

    let simulatedProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      simulatedProgress += 5;
      if (simulatedProgress < 90) {
        updateProgress(simulatedProgress);
      }
    }, 1000);

    try {
      const response = await quizCreation(
        selectedNote.id,
        difficulty,
        numQuestions
      );

      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }

      if (response.quiz && Array.isArray(response.quiz)) {
        updateProgress(100);
        updateLoadingText("✅ Quiz generated!");

        setTimeout(() => {
          stopLoading();
          navigate("/quizAnswer", {
            state: {
              quiz: response.quiz,
              noteId: selectedNote.id,
              difficulty: difficulty,
            },
          });
        }, 1500);
      } else {
        throw new Error("Invalid quiz format received");
      }
    } catch (err) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      console.error("Quiz generation failed:", err.message);
      stopLoading();
      toast.error("❌ Failed to generate quiz. Please try again.", {
        autoClose: 3000,
      });
    } finally {
      setIsGenerating(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🧪 Select a Note</h2>

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

      {showDifficultyModal && (
        <DifficultyModal
          title="Choose Quiz Options"
          description="Select difficulty and number of questions for your quiz."
          onCancel={() => setShowDifficultyModal(false)}
          onSave={handleGenerateQuiz}
          disableSave={isGenerating}
        >
          <div className={styles.formGroup}>
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

          <div className={styles.formGroup}>
            <label htmlFor="numQuestions">Number of Questions (1-20):</label>
            <input
              type="number"
              id="numQuestions"
              value={numQuestions}
              onChange={(e) =>
                setNumQuestions(
                  Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 1))
                )
              }
              min="1"
              max="20"
              className={styles.inputNumber}
            />
          </div>
        </DifficultyModal>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
