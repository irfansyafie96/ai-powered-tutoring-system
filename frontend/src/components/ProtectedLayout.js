import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import ProtectedNavBar from "./ProtectedNavBar";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");

  if (!token) return <Navigate to={"/login"} replace />;
  return (
    <>
      <ProtectedNavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default ProtectedLayout;
