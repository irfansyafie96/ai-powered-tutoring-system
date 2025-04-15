import React from "react";
import { Link } from "react-router-dom";
import "../styles/PublicNavBar.css";

const PublicNavBar = () => {
  return (
    <nav className="publicNavBar">
      <ul>
        <li>
          <Link to="/">Dashboard</Link>
        </li>
        <li>
          <Link>About</Link>
        </li>
        <li>
          <Link>Contact Us</Link>
        </li>
      </ul>
    </nav>
  );
};

export default PublicNavBar;
