// App.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Provider } from "react-redux"; // Add this import
import store from "./redux/store";
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
import Navbar from "./components/Navbar";
import { setUser } from "./redux/userSlice";
import { fetchUserData } from "./api";
import "./index.css";

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.user);
  const [darkMode, setDarkMode] = useState(false); // Add dark mode state

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
    };

    checkAuth();
  }, [dispatch]);

  return (
    <Provider store={store}>
      {" "}
      {/* Wrap your app with Provider */}
      <div className={darkMode ? "dark" : ""}>
        <Router>
          <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />{" "}
          {/* Pass dark mode props */}
          <Routes>
            <Route
              path="/"
              element={
                token ? <Navigate to="/home" /> : <Navigate to="/login" />
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </div>
    </Provider>
  );
};

export default App;
