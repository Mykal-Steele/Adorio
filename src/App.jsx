import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import RyGame from "./pages/RyGame";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Coding from "./pages/Coding";
import DataLookup from "./pages/DataLookup";
import SmartCity from "./pages/SmartCity";
import Navbar from "@components/Navbar";
import NotFound from "@components/NotFound";
import ErrorBoundary from "./Components/ErrorBoundary";
import ProtectedRoute from "./Components/ProtectedRoute";
import SendEnv from "./pages/SendEnv";
import TempBeforeReal from "./pages/tempBeforeReal";
import TsBussing from "./pages/TsBussing";
import useAuthBootstrap from "./hooks/useAuthBootstrap";
import usePageTracking from "./hooks/usePageTracking";

const ExternalRedirect = ({ to }) => {
  React.useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
};

ExternalRedirect.propTypes = {
  to: PropTypes.string.isRequired,
};

const AppShell = ({ darkMode, setDarkMode }) => {
  usePageTracking();
  const location = useLocation();

  return (
    <>
      {location.pathname !== "/" && (
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      )}
      <Routes>
        <Route path="/" element={<TsBussing />} />
        <Route path="/algo" element={<ExternalRedirect to="/algo.html" />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rygame"
          element={
            <ProtectedRoute>
              <RyGame />
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/coding" element={<Coding />} />
        <Route path="/sendenv" element={<SendEnv />} />
        <Route path="/smartcity" element={<SmartCity />} />
        <Route path="/tempBeforeReal" element={<TempBeforeReal />} />
        <Route path="/tsbussing" element={<TsBussing />} />
        <Route
          path="/data-lookup"
          element={
            <ProtectedRoute>
              <DataLookup />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

AppShell.propTypes = {
  darkMode: PropTypes.bool.isRequired,
  setDarkMode: PropTypes.func.isRequired,
};

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const isLoading = useAuthBootstrap();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4"></div>
          <p className="text-gray-300 text-lg">Loading Adorio...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={darkMode ? "dark" : ""}>
        <Router>
          <AppShell darkMode={darkMode} setDarkMode={setDarkMode} />
        </Router>
      </div>
    </ErrorBoundary>
  );
};

export default App;
