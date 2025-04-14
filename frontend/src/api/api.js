import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
});

// Login function
export const login = async (username, password) => {
  try {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  } catch (error) {
    console.error("Login error: ", error);
    throw error;
  }
};

// Note upload function
export const uploadNote = async (formData) => {
  try {
    const response = await api.post("/notes/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error("Upload note error: ", error);
    throw error;
  }
};

// Generate summary function
export const generateSummary = async (noteId) => {
  try {
    const response = await api.post("/notes/summary", { noteId });
    return response.data;
  } catch (error) {
    console.error("Generate summary error:", error);
    throw error;
  }
};

// Generate quiz function
export const quizCreation = async (noteId, difficulty) => {
  try {
    const response = await api.post("/quizzes/create", { noteId, difficulty });
    return response.data;
  } catch (error) {
    console.error("Generate quiz error:", error);
    throw error;
  }
};

export default api;
