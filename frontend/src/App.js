import React from "react";
import "./utils/pdfOverride.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedLayout from "./components/ProtectedLayout";
import Home from "./pages/Home";
import UploadNotes from "./pages/UploadNote";
import GenerateQuiz from "./pages/GenerateQuiz";
import Preview from "./pages/Preview";
import Profile from "./pages/Profile.js";
import SearchNotes from "./pages/SearchNotes.js";
import Library from "./pages/Library.js";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/signup" element={<Register />}></Route>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedLayout />}>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/upload" element={<UploadNotes />}></Route>
          <Route path="/quiz" element={<GenerateQuiz />}></Route>
          <Route path="/summary" element={<Preview />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/search" element={<SearchNotes />}></Route>
          <Route path="/library" element={<Library />}></Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
