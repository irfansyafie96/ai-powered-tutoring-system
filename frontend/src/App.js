import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedLayout from "./components/ProtectedLayout";
import Home from "./pages/Home";

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
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
