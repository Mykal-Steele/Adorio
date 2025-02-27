import React, { useEffect, useState } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  HashRouter as Router, // Using HashRouter without basename
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Navbar from "./components/Navbar";
import NotFound from "./Components/NotFound";
import { setUser } from "./redux/userSlice";
import { fetchUserData } from "./api";
import store from "./redux/store";
import "./index.css";

const AppContent = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
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

  if (loading) return <div>Loading...</div>; // Or a proper loading indicator

  return (
    <div className={darkMode ? "dark" : ""}>
      <Router>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route
            path="/"
            element={token ? <Navigate to="/home" /> : <Navigate to="/login" />}
          />
          <Route
            path="/home"
            element={token ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/login" />}
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          {/* Catch-all route for non-existent pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <AppContent />
  </Provider>
);

export default App;
