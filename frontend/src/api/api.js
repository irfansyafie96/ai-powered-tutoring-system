import axios from "axios";

export const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL
    ? `${process.env.REACT_APP_API_URL}/api`
    : "http://localhost:5000/api",
  timeout: 100000,
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

// Note upload function
export const uploadNote = async (formData, config = {}) => {
  const response = await api.post("/notes/upload", formData, {
    ...config,
    headers: {
      "Content-Type": "multipart/form-data",
      ...config.headers,
    },
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

/**
 * Save a note’s metadata (subject + topic) to the DB.
 * @param {{ fileUrl, summary, subject, topic }} body
 */

export const saveNote = async (body) => {
  const res = await api.post("/notes", body);
  return res.data;
};

export const checkIfSaved = async (noteId) => {
  try {
    const response = await api.get("/notes/saved", {
      params: { noteId },
    });
    return response.data.saved === true;
  } catch (error) {
    console.error("Check saved error:", error.message);
    return false;
  }
};

// Search notes function
export const searchNotes = async ({
  subject = "",
  topic = "",
  keyword = "",
}) => {
  const res = await api.get("/notes/search", {
    params: { subject, topic, keyword },
  });
  return res.data.notes;
};

export const getMyNotes = async () => {
  const res = await api.get("/notes/my");
  return res.data.notes;
};

/**
 * Save a note to the current user's library.
 * @param {number} noteId - The ID of the note to save
 */
export const saveToLibrary = async (noteId) => {
  try {
    const response = await api.post("/notes/save", { noteId });
    return response.data;
  } catch (error) {
    console.error("Save to library error:", error);
    throw error;
  }
};

export const getFullLibrary = async () => {
  const res = await api.get("/notes/library");
  return res.data.notes;
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
