import React from "react";
import styles from "../styles/MetadataModal.module.css";

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
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>Save Notes</h3>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          disabled={saving}
        />
        <input
          type="text"
          placeholder="Topic"
          value={topic}
          onChange={(e) => onTopicChange(e.target.value)}
          disabled={saving}
        />
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
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
