import axios from "axios";

const isLocalDev = process.env.NODE_ENV === "development";

export const api = axios.create({
  baseURL: window.ENV_CONFIG?.REACT_APP_API_URL 
    ? `${window.ENV_CONFIG.REACT_APP_API_URL}/api`
    : process.env.REACT_APP_API_URL
      ? `${process.env.REACT_APP_API_URL}/api`
      : 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'X-Render-Region': 'singapore',
    'Origin': window.location.origin
  }
});

// export const api = axios.create({
//   // For local development, force using localhost backend
//   baseURL:
//     process.env.NODE_ENV === "development"
//       ? "http://localhost:5000/api"
//       : window.ENV_CONFIG?.REACT_APP_API_URL || process.env.REACT_APP_API_URL
//       ? `${
//           window.ENV_CONFIG?.REACT_APP_API_URL || process.env.REACT_APP_API_URL
//         }/api`
//       : "http://localhost:5000/api",
//   timeout: 100000,
// });

// Inject JWT on every request
api.interceptors.request.use((config) => {
  if (isLocalDev) {
    console.log("[API] Sending request to: ", config.url);
  }
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const signUp = async ({ username, email, password }) => {
  const response = await api.post("/auth/signup", {
    username,
    email,
    password,
  });
  return response.data;
};

export const login = async ({ username, password }) => {
  const response = await api.post("/auth/login", { username, password });
  return response.data;
};

export const getProfile = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};

export const updateProfile = async (body) => {
  const res = await api.put("/auth/profile", body);
  return res.data.user;
};

export const uploadNote = async (formData, config = {}) => {
  const response = await api.post("/notes/upload", formData, {
    ...config,
    timeout: 300000, // 5 minutes timeout for upload operations
    headers: {
      "Content-Type": "multipart/form-data",
      ...config.headers,
    },
  });
  return response.data;
};

/**
 * Save a note's metadata (subject + topic) to the DB.
 */
export const saveNote = async (body) => {
  const res = await api.post("/notes", body);
  return res.data;
};

export const deleteNote = async (noteId) => {
  const response = await api.delete(`/notes/${noteId}`);
  return response.data;
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
  return res.data;
};

export const quizCreation = async (noteId, difficulty, numQuestions) => {
  try {
    const response = await api.post("/quizzes/create", {
      noteId,
      difficulty,
      numQuestions,
    });
    return response.data;
  } catch (error) {
    console.error("Quiz creation failed:", error.message);
    throw error;
  }
};

/**
 * Saves a complete quiz session including all questions and user answers to the backend.
 * @param {object} quizData - Object containing:
 * - noteId: The ID of the note the quiz was generated from.
 * - difficulty: The difficulty level of the quiz.
 * - correctAnswers: The total number of correct answers.
 * - totalQuestions: The total number of questions in the quiz.
 * - quizData: An array of objects, where each object represents a question and includes:
 * - question (string): The question text.
 * - options (string[]): An array of answer options (e.g., ["Option A", "Option B", ...]).
 * - correctAnswer (string): The correct option letter (e.g., "A", "B").
 * - userSelectedAnswer (string | null): The option letter the user selected (or null if skipped).
 * - isCorrect (boolean): True if userSelectedAnswer matches correctAnswer.
 */
export const saveCompletedQuiz = async ({
  noteId,
  difficulty,
  correctAnswers,
  totalQuestions,
  quizData,
}) => {
  try {
    const response = await api.post("/quizzes/complete", {
      noteId,
      difficulty,
      correctAnswers,
      totalQuestions,
      quizData,
    });
    return response.data;
  } catch (error) {
    console.error("Save completed quiz failed:", error.message);
    throw error;
  }
};

/**
 * Fetches the current user's quiz history (summaries of past quizzes).
 * @returns {Promise<Array>} A promise that resolves to an array of quiz score summaries.
 */
export const getQuizHistory = async () => {
  try {
    const response = await api.get("/quizzes/history");
    return response.data;
  } catch (error) {
    console.error("Fetch quiz history failed:", error.message);
    throw error;
  }
};

/**
 * Fetches detailed questions and answers for a specific past quiz session.
 * @param {string} quizScoreId - The ID of the specific quiz session to fetch details for.
 * @returns {Promise<object>} A promise that resolves to an object containing quizSummary and an array of detailed questions.
 */
export const getQuizDetails = async (quizScoreId) => {
  try {
    const response = await api.get(`/quizzes/${quizScoreId}/details`);
    return response.data;
  } catch (error) {
    console.error(
      `Fetch quiz details for ${quizScoreId} failed:`,
      error.message
    );
    throw error;
  }
};

export const getRecommendedNotes = async (subject, excludeNoteId) => {
  try {
    const response = await api.get("/notes/recommendations", {
      params: { subject, excludeNoteId },
    });
    return response.data.notes;
  } catch (error) {
    console.error("Fetch recommended notes failed:", error.message);
    return []; // Return empty array on error to prevent UI crashes
  }
};

export default api;
