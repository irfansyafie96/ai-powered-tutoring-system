// Runtime environment configuration for frontend
window.ENV_CONFIG = {
  REACT_APP_API_URL:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "http://localhost:5000"
      : "https://ai-tutoring-system-backend-irfan-cdhddbf5ewc2fegv.southeastasia-01.azurewebsites.net",
};
