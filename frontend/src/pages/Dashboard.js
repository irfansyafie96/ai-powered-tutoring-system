import { useNavigate } from "react-router-dom";
import React from "react";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div className="dashboardContainer">
      <div className="leftColumn">
        <h1 className="dashboardTitle">
          Learn
          <br />
          by doing.
        </h1>
      </div>
      <div className="rightColumn">
        <p>
          Dive in and experience the future of learning
          <br />
          with AI-powered summaries and quizzes tailored just for you.
        </p>
        <div className="buttonContainer">
          <button onClick={() => navigate("/signup")}>Sign Up</button>
          <button onClick={() => navigate("/login")}>Login</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
