import React from "react";
import { Link } from "react-router-dom";

const ProtectedNavBar = () => {
  return (
    <nav className="protectedNavBar">
      <ul>
        <li>Home</li>
        <li>Upload Notes</li>
        <li>Generate Summary</li>
      </ul>
    </nav>
  );
};

export default ProtectedNavBar;
