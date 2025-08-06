import React from "react";
import "./utils/pdfOverride.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PublicLayout from "./components/PublicLayout";
import ProtectedLayout from "./components/ProtectedLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import UploadNotes from "./pages/UploadNote";
import GenerateQuiz from "./pages/GenerateQuiz";
import Preview from "./pages/Preview";
import Profile from "./pages/Profile.js";
import SearchNotes from "./pages/SearchNotes.js";
import Library from "./pages/Library.js";
import QuizPage from "./pages/QuizPage.js";
import QuizReviewPage from "./pages/QuizReviewPage.js";
import QuizHistory from "./pages/QuizHistory.js";
import { LoadingProvider } from "./contexts/LoadingContext.js";

function App() {
  return (
    <Router>
      <div className="app">
        {/* Provides global loading state to the application */}
        <LoadingProvider>
          <Routes>
            {/* Routes accessible without authentication */}
            <Route element={<PublicLayout />}>
              <Route path="/signup" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Dashboard />} />
            </Route>

            {/* Routes requiring user authentication */}
            <Route element={<ProtectedLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/upload" element={<UploadNotes />} />
              <Route path="/quiz" element={<GenerateQuiz />} />
              <Route path="/summary" element={<Preview />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/search" element={<SearchNotes />} />
              <Route path="/library" element={<Library />} />
              <Route path="/quizAnswer" element={<QuizPage />} />
              <Route path="/quiz-history" element={<QuizHistory />} />
              <Route
                path="/quiz/:quizScoreId/review"
                element={<QuizReviewPage />}
              />
            </Route>
          </Routes>
        </LoadingProvider>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
