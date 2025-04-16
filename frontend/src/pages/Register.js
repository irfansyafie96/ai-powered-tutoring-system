import React, { useState } from "react";
import { signUp } from "../api/api";
import "../styles/Register.css";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords does not match");
      return;
    }

    try {
      const data = await signUp(username, email, password);
      console.log("Signup succesful: ", data);
    } catch (error) {
      setError("Sign up failed");
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="registerInput"
          />
        </div>
        <div className="registerFormGroup">
          <label>Email: </label>
          <input
            type="text"
            placeholder="Email"
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
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="registerInput"
          />
        </div>
        <button className="submitButton">Sign Up</button>
      </form>
    </div>
  );
};

export default Register;
