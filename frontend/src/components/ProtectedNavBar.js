import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "../styles/ProtectedNavBar.module.css";

const ProtectedNavBar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscKey);
    return () => document.removeEventListener("keydown", handleEscKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navItems = [
    { label: "Home", path: "/home", icon: "🏠" },
    { label: "Search Notes", path: "/search", icon: "🔍" },
    { label: "Upload Notes", path: "/upload", icon: "📤" },
    { label: "Generate Quiz", path: "/quiz", icon: "📝" },
    { label: "Profile", path: "/profile", icon: "👤" },
  ];

  return (
    <nav className={styles.protectedNavBar} ref={navRef}>
      <div className={styles.navHeader}>
        <NavLink to="/home" className={styles.navLogo}>
          BrainBoost
        </NavLink>
        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerIcon}>
            <span
              className={`${styles.hamburgerBar} ${
                isOpen ? styles.active : ""
              }`}
            ></span>
          </span>
        </button>
      </div>
      <div
        className={`${styles.navLinksContainer} ${isOpen ? styles.isOpen : ""}`}
        aria-hidden={!isOpen}
      >
        <ul className={styles.navLinks}>
          {navItems.map(({ label, path, icon }) => (
            <li key={path} onClick={closeMenu}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  isActive ? styles.active : styles.navLink
                }
              >
                <span className={styles.navIcon}>{icon}</span>
                <span className={styles.navText}>{label}</span>
              </NavLink>
            </li>
          ))}
          <li className={styles.logoutListItem}>
            <button
              className={styles.logoutBtn}
              onClick={handleLogout}
              aria-label="Logout"
            >
              <span className={styles.navIcon}>🚪</span>
              <span className={styles.navText}>Logout</span>
            </button>
          </li>
        </ul>
      </div>
      {isOpen && <div className={styles.navOverlay} onClick={closeMenu} />}
    </nav>
  );
};

export default ProtectedNavBar;
