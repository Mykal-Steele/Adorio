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
import SmartCity from './pages/SmartCity';
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
        {/* Public pages that don't require login */}
        <Route path='/coding' element={<Coding />} />
        <Route path='/sendenv' element={<SendEnv />} />
        <Route path='/smartcity' element={<SmartCity />} />
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
    return (
      <div className='min-h-screen bg-gray-950 flex items-center justify-center'>
        <div className='text-center'>
          <div className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-purple-500 border-r-transparent mb-4'></div>
          <p className='text-gray-300 text-lg'>Loading Adorio...</p>
        </div>
      </div>
    );
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
