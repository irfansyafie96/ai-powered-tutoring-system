import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/PublicNavBar.module.css";

const PublicNavBar = () => {
  return (
    <nav className={styles.publicNavBar}>
      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>
            Dashboard
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>
            About
          </Link>
        </li>
        <li className={styles.navItem}>
          <Link to="/" className={styles.navLink}>
            Contact Us
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default PublicNavBar;
