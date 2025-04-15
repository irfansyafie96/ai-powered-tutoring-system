import React from "react";
import { Outlet } from "react-router-dom";
import PublicNavBar from "./PublicNavBar";

const PublicLayout = () => {
  return (
    <>
      <PublicNavBar />
      <main>
        <Outlet />
      </main>
    </>
  );
};

export default PublicLayout;
