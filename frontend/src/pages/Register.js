import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signUp } from "../api/api";
import styles from "../styles/Register.module.css";

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
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await signUp({ username: clearUsername, email: cleanEmail, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <h2 className={styles.registerTitle}>Create Account</h2>
      {error && <div className={styles.errorText}>{error}</div>}

      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <div className={styles.registerFormGroup}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.registerInput}
          />
        </div>

        <div className={styles.registerFormGroup}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.registerInput}
          />
        </div>

        <div className={styles.registerFormGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.registerInput}
          />
        </div>

        <div className={styles.registerFormGroup}>
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.registerInput}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Register;
