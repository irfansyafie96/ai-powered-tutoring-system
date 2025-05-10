import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/ProtectedNavBar.css";

const ProtectedNavBar = () => {
  return (
    <nav className="protectedNavBar" activeClassName="active">
      <ul>
        <li>
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/upload"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Upload Notes
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/quiz"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Generate Quiz
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default ProtectedNavBar;
