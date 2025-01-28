import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./Components/ProtectedRoute";
import "./index.css"; 

import Navbar from "./Components/Navbar";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
            <Route path="/login" element={<Login />} />
       
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;