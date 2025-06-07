import React from "react";
import styles from "../styles/DifficultyModal.module.css";

export default function DifficultyModal({ title, children, onSave, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3>{title}</h3>

        {children}

        <div className={styles.actions}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={onSave}
          >
            Answer Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
