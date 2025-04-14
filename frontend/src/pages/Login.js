import React, { useState } from "react";
import { login } from "../api/api";
import "../styles/Login.css";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = await login(username, password);
      // Save the token and user details
      console.log("Login successful: ", data);
    } catch (error) {
      setError("Login failed");
    }
  };

  return (
    <div className="loginContainer">
      <h2 className="loginTitle">Login</h2>
      {error && (
        <div className="errorText" style={{ color: "red" }}>
          {error}
        </div>
      )}
      <form className="loginForm" onSubmit={handleSubmit}>
        <div className="formGroup">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="loginInput"
          />
        </div>
        <div className="formGroup">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="loginInput"
          />
        </div>
        <button className="submitButton" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
