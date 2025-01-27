import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'; // Import routing components
import { useSelector } from 'react-redux'; // Import Redux selector hook
import Home from './pages/Home'; // Import pages/components
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute component

function App() {
  const { token } = useSelector((state) => state.user); // Access token from Redux store

  return (
    <Router>
      <Switch>
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        
        {/* Protect the Profile route */}
        <ProtectedRoute>
          <Route exact path="/profile">
            <Profile />
          </Route>
        </ProtectedRoute>

        {/* Default Home route */}
        <Route exact path="/">
          <Home />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
