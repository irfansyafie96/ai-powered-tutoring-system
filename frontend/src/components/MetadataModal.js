import React from "react";
import styles from "../styles/Modal.module.css";
import libraryStyles from "../styles/Library.module.css"; // Import library styles

export default function MetadataModal({
  subject,
  topic,
  saving,
  error,
  onSubjectChange,
  onTopicChange,
  onSave,
  onCancel,
}) {
  // ✅ Check if both fields are filled
  const isFormValid = subject.trim() !== "" && topic.trim() !== "";

  // ✅ Handle form submission
  const handleSaveClick = () => {
    if (!isFormValid) return; // Prevent save if form not valid
    onSave();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Save Notes</h3>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            disabled={saving}
            className={`${libraryStyles.searchInput} ${styles.modalInput}`}
          />
          <input
            type="text"
            placeholder="Topic"
            value={topic}
            onChange={(e) => onTopicChange(e.target.value)}
            disabled={saving}
            className={libraryStyles.searchInput} // No bottom margin needed for the last input
          />
        </div>

        {/* Optional: Show message if fields are empty */}
        {!isFormValid && (
          <div className={styles.helpText}>
            Please enter both subject and topic to continue.
          </div>
        )}

        {error && <div className={styles.errorText}>{error}</div>}

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSaveClick}
            disabled={!isFormValid || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
