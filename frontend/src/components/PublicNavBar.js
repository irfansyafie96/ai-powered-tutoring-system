import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "../styles/PublicNavBar.module.css";

const PublicNavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscKey);
    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, []);

  return (
    <nav className={styles.publicNavBar} ref={navRef}>
      <div className={styles.navContainer}>
        <Link to="/" className={styles.navLogo}>
          BrainBoost
        </Link>

        <button
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
        >
          <span className={styles.hamburgerIcon}>
            <span
              className={`${styles.hamburgerBar} ${
                isMenuOpen ? styles.active : ""
              }`}
            ></span>
          </span>
        </button>

        <div className={`${styles.navMenu} ${isMenuOpen ? styles.isOpen : ""}`}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink} onClick={closeMenu}>
                Dashboard
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink} onClick={closeMenu}>
                About
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link to="/" className={styles.navLink} onClick={closeMenu}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavBar;
