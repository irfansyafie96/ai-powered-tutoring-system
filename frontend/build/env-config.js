// Runtime environment configuration for frontend
window.ENV_CONFIG = {
  REACT_APP_API_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://ai-powered-tutoring-system.onrender.com",
};
