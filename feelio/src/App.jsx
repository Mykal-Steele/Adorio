// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; // Import routing components
import { useSelector } from 'react-redux'; // Import useSelector to check authentication
import Home from './pages/Home'; // Corrected path
import Login from './pages/Login'; // Corrected path
import Register from './pages/Register'; // Corrected path
import Profile from './pages/Profile'; // Corrected path
import ProtectedRoute from './Components/ProtectedRoute'; // Import ProtectedRoute component

const App = () => {
  return (
    <Router>
      <Switch>
        {/* Public Routes */}
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />

        {/* Protected Routes */}
        <ProtectedRoute path="/home">
          <Home />
        </ProtectedRoute>

        <ProtectedRoute path="/profile">
          <Profile />
        </ProtectedRoute>

        {/* Fallback route (optional) */}
        <Route path="/" exact>
          <h1>Welcome to the App!</h1>
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
