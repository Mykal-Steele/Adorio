import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PostDetail from "./Components/PostDetail";
import Navbar from "./components/Navbar";
import { setUser } from "./redux/userSlice";
import { fetchUserData } from "./api";
import "./index.css";

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Fetch user data using the token
          const userData = await fetchUserData();
          dispatch(setUser({ user: userData, token }));
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          localStorage.removeItem("token"); // Clear invalid token
        }
      }
    };

    checkAuth();
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route
                path="/"
                element={
                  token ? <Navigate to="/home" /> : <Navigate to="/login" />
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/home"
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
              <Route path="/posts/:id" element={<PostDetail />} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
