import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api",
  timeout: 60000,
});

// Inject JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sign up function
export const signUp = async ({ username, email, password }) => {
  const response = await api.post("/auth/signup", {
    username,
    email,
    password,
  });
  return response.data;
};

// Login function
export const login = async ({ username, password }) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

// Profile endpoints
export const getProfile = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};

export const updateProfile = async (body) => {
  const res = await api.put("/auth/profile", body);
  return res.data.user;
};

//Note upload function
export const uploadNote = async (formData) => {
  const response = await api.post("/notes/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
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
