import { useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import About from "./pages/About";
import AdminLayout from "./components/AdminLayout.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/home" element={<AdminLayout />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
