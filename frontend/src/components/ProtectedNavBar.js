import React from "react";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "../styles/ProtectedNavBar.css";

const ProtectedNavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

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
        <li>
          <NavLink
            to="/profile"
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Profile
          </NavLink>
        </li>
        <button className="btn btn-secondary logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </ul>
    </nav>
  );
};

export default ProtectedNavBar;
