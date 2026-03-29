import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
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

const AppShell = ({ darkMode, setDarkMode, token }) => {
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
        <Route path="/sleep-demo" element={<ExternalRedirect to="https://preview--autonomy-peace-blueprint.lovable.app/?__lovable_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiSkdRd09SYkdIZlM5UDNia2hxM0ZPdWF1RlBzMiIsInByb2plY3RfaWQiOiI4MmNjMzQ0MS0wMjJkLTQwMzQtOTVhZi0yM2Y2NjcxYWExODQiLCJhY2Nlc3NfdHlwZSI6InByb2plY3QiLCJpc3MiOiJsb3ZhYmxlLWFwaSIsInN1YiI6IjgyY2MzNDQxLTAyMmQtNDAzNC05NWFmLTIzZjY2NzFhYTE4NCIsImF1ZCI6WyJsb3ZhYmxlLWFwcCJdLCJleHAiOjE3NzUzODIwMzksIm5iZiI6MTc3NDc3NzIzOSwiaWF0IjoxNzc0Nzc3MjM5fQ.oUt8vOoyKp4xa5k8aavOJN6IdwqRWTpvWswe4KqCRHWBLcN388lYSYsjrLCl_30OjlVf9DB3QwMhmLoYgXE1q87cYZGUWfVE6DxdQ2Nlx81352dl4xjW0Aucqp3v2Dap_06a09q7fOkq2JiyZlawpnhhgIM7BpSxpsTEeiNaTkJwp5Hnvl8q6WppLEhJqk7jP0I42BBNiDJDCuVkABF6slZUaEveaHudm85wIAYpHXBbo-JfwuXGzXeobOHbCIhuOGPmy8hFL2H5FX-LbzVuzo0be1zDyBYifhe8noxlbJYRK1jK40LOWg1p04Qia7-ICST1rN-J2kGCH7bLUyh1skXuiVXATy9Yb3xMWn7Wbp1lxPYWLqw82YCcFoEztc6cGBSmBtrcOOsXvTN0kHLYDswAQsDd5hxjnZlvlAXzP3HbD0Fl3h6BFdhxLncYJUWs049RYqimQXja0zc1DaZuhiQ7hQBYHUbjDWr7e7W7_NkfRAtZTBi9hWq6R4bOYnhZf6zI6BfGcYkkxHNzHj1pva3sQUeHa7jx61wRQdTWUgc_SpEkFNynAYlcbv1hHEi6jixBlQSoJLoZXb4KZMQ_pbmAMzj9Nk-9_YvDM7ANzRvupNc8OvTSJZ_6y9pPEdCvUfn7mTNhNroM6kh7QLkTiFjGXL8gMZu7pEnl0Z4UIpU" />} />
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

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const isLoading = useAuthBootstrap();
  const { token } = useSelector((state) => state.user);

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
          <AppShell
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            token={token}
          />
        </Router>
      </div>
    </ErrorBoundary>
  );
};

export default App;
