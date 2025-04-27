import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedNavBar from "./ProtectedNavBar";
import "../styles/ProtectedLayout.css";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to={"/login"} replace />;

  return (
    <>
      <ProtectedNavBar />
      <main className="protectedLayoutMain">
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
