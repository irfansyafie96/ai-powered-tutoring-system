import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api/api";
import styles from "../styles/Login.module.css";

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
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <h2 className={styles.loginTitle}>Welcome Back</h2>
      {error && <div className={styles.errorText}>{error}</div>}

      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <div className={styles.loginFormGroup}>
          <label>Username</label>
          <input
            type="text"
            placeholder="Username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.loginInput}
          />
        </div>

        <div className={styles.loginFormGroup}>
          <label>Password</label>
          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.loginInput}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
