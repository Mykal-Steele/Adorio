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
          element={token ? <Home /> : <Navigate to='/login' replace />}
        />
        <Route path='/rygame' element={<RyGame />} />
        <Route
          path='/profile'
          element={token ? <Profile /> : <Navigate to='/login' replace />}
        />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/coding' element={<Coding />} />
        <Route
          path='/sendenv'
          element={token ? <SendEnv /> : <Navigate to='/login' replace />}
        />
        <Route path='/data-lookup' element={<DataLookup />} />
        <Route path='*' element={<NotFound />} />
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
