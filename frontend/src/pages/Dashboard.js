// src/pages/Dashboard.js
import { useNavigate } from "react-router-dom";
import React from "react";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.leftColumn}>
        <h1 className={styles.dashboardTitle}>
          Learn
          <br />
          by doing.
        </h1>
      </div>
      <div className={styles.rightColumn}>
        <p>
          Dive in and experience the future of learning
          <br />
          with AI-powered summaries and quizzes tailored just for you.
        </p>
        <div className={styles.buttonContainer}>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
