import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/ProtectedNavBar.module.css";

const ProtectedNavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className={styles.protectedNavBar}>
      <ul>
        {[
          ["Home", "/home"],
          ["Search Notes", "/search"],
          ["Upload Notes", "/upload"],
          ["Generate Quiz", "/quiz"],
          ["Profile", "/profile"],
        ].map(([label, path]) => (
          <li key={path}>
            <NavLink
              to={path}
              className={({ isActive }) =>
                isActive ? styles.active : undefined
              }
            >
              {label}
            </NavLink>
          </li>
        ))}

        <li>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProtectedNavBar;
