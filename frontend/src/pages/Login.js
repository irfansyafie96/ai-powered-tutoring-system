import React, { useState } from "react";
import { login } from "../api/api";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await login({ username, password });
      localStorage.setItem("token", token);
      navigate("/home");
      console.log("Login successful");
    } catch (error) {
      setError(error.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
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
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="loginInput"
          />
        </div>
        <div className="formGroup">
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="loginInput"
          />
        </div>
        <button className="submitButton" type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
