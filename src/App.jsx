//src\App.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Home from './pages/Home';
import RyGame from './pages/RyGame';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Coding from './pages/Coding';
import DataLookup from './pages/DataLookup';
import Navbar from '@components/Navbar';
import NotFound from '@components/NotFound';
import ErrorBoundary from './Components/ErrorBoundary';
import ProtectedRoute from './Components/ProtectedRoute';
import SendEnv from './pages/SendEnv';
import useAuthBootstrap from './hooks/useAuthBootstrap';
import usePageTracking from './hooks/usePageTracking';

const AppShell = ({ darkMode, setDarkMode, token }) => {
  usePageTracking();

  return (
    <>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <Routes>
        <Route
          path='/'
          element={
            token ? (
              <Navigate to='/home' replace />
            ) : (
              <Navigate to='/login' replace />
            )
          }
        />
        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='/rygame'
          element={
            <ProtectedRoute>
              <RyGame />
            </ProtectedRoute>
          }
        />
        <Route
          path='/profile'
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route
          path='/coding'
          element={
            <ProtectedRoute>
              <Coding />
            </ProtectedRoute>
          }
        />
        {/* SendEnv is the only page that doesn't require login */}
        <Route path='/sendenv' element={<SendEnv />} />
        <Route
          path='/data-lookup'
          element={
            <ProtectedRoute>
              <DataLookup />
            </ProtectedRoute>
          }
        />
        <Route
          path='*'
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

// Handles high-level route wiring and theme toggling.
const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const isLoading = useAuthBootstrap();
  const { token } = useSelector((state) => state.user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <ErrorBoundary>
      <div className={darkMode ? 'dark' : ''}>
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
