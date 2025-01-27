// src/Components/ProtectedRoute.js
import React from "react";
import { Redirect } from "react-router-dom"; // Import Redirect for route redirection
import { useSelector } from "react-redux"; // Import useSelector to access Redux state

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.user); // Access the token from Redux store

  if (!token) {
    return <Redirect to="/login" />; // Redirect to login page if token doesn't exist (not logged in)
  }

  return children; // Render the protected content if the user is authenticated
};

export default ProtectedRoute;
