import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedNavBar from "./ProtectedNavBar";
import styles from "../styles/ProtectedLayout.module.css";
import { useLoading } from "../contexts/LoadingContext";
import loadingStyles from "../styles/GenerateQuiz.module.css";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  const { isLoading, progressPercent, loadingText } = useLoading(); // Get loading state from context

  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <ProtectedNavBar />
      <main className={styles.protectedLayoutMain}>
        {/* Render the loading overlay here, conditionally */}
        {isLoading && (
          <div className={loadingStyles.loadingOverlay}>
            {" "}
            {/* Use styles from GenerateQuiz.module.css */}
            <div className={loadingStyles.spinner}></div>
            <div className={loadingStyles.loadingBar}>
              <div
                className={loadingStyles.loadingFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className={loadingStyles.loadingText}>
              {loadingText}
              <span className={loadingStyles.loadingDots}>...</span>
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
