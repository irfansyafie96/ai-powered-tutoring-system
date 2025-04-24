import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../api/api";
import "../styles/Register.css";

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    const clearUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (password !== confirmPassword) {
      setError("Passwords does not match");
      return;
    }
    setLoading(true);

    try {
      await signUp({ username: clearUsername, email: cleanEmail, password });
      navigate("/login");
      console.log("Signup succesful");
    } catch (error) {
      setError(error.response?.data?.error || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerContainer">
      <h2 className="registerTitle">Sign Up</h2>
      {error && (
        <div className="errorText" style={{ color: "red" }}>
          {error}
        </div>
      )}
      <form className="registerForm" onSubmit={handleSubmit}>
        <div className="registerFormGroup">
          <label>Username: </label>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="registerInput"
          />
        </div>
        <div className="registerFormGroup">
          <label>Email: </label>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="registerInput"
          />
        </div>
        <div className="registerFormGroup">
          <label>Password: </label>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="registerInput"
          />
        </div>
        <div className="registerFormGroup">
          <label>Confirm Password: </label>
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="registerInput"
          />
        </div>
        <button type="submit" className="submitButton" disabled={loading}>
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Register;
