import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedNavBar from "./ProtectedNavBar";
import styles from "../styles/ProtectedLayout.module.css";
import { useLoading } from "../contexts/LoadingContext";
import overlayStyles from "../styles/GlobalLoadingOverlay.module.css";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  const { isLoading, progressPercent, loadingText } = useLoading();

  // Manages body scrolling based on loading state
  useEffect(() => {
    if (isLoading) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "unset"; // Enable scrolling
    }
    // Cleanup: ensure scrolling is re-enabled when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoading]);

  // Redirects to login if no token is found
  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <ProtectedNavBar />
      <main className={styles.protectedLayoutMain}>
        {/* Renders the global loading overlay conditionally */}
        {isLoading && (
          <div className={overlayStyles.loadingOverlay}>
            <div className={overlayStyles.spinner}></div>
            <div className={overlayStyles.loadingBar}>
              <div
                className={overlayStyles.loadingFill}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className={overlayStyles.loadingText}>
              {loadingText}
              <span className={overlayStyles.loadingDots}></span>
            </p>
          </div>
        )}
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
