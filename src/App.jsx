//src\App.jsx
import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "@components/Navbar";
import NotFound from "@components/NotFound";
import { setUser } from "./redux/userSlice";
import { fetchUserData } from "./api";
import store from "./redux/store";
import "./index.css";
import ErrorBoundary from "./Components/ErrorBoundary";

const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // see if we're already logged in from before
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await fetchUserData();
          dispatch(setUser({ user: userData, token }));
        } catch (err) {
          console.error("Failed to fetch user data:", err);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [dispatch]);

  // super lazy loading screen but whatever it only shows for like 2 seconds
  if (loading) return <div>Loading...</div>;

  return (
    <ErrorBoundary>
      <div className={darkMode ? "dark" : ""}>
        <Router>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
          <Routes>
            <Route
              path="/"
              element={
                token ? (
                  <Navigate to="/home" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/home"
              element={token ? <Home /> : <Navigate to="/login" replace />}
            />
            <Route
              path="/profile"
              element={token ? <Profile /> : <Navigate to="/login" replace />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </div>
    </ErrorBoundary>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
