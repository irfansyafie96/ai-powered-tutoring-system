import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedNavBar from "./ProtectedNavBar";
import styles from "../styles/ProtectedLayout.module.css";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to="/login" replace />;

  return (
    <>
      <ProtectedNavBar />
      <main className={styles.protectedLayoutMain}>
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
