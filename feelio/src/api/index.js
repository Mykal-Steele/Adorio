import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000" });

// Register function to call the backend API
export const register = (userData) => API.post("/api/auth/register", userData);

// Login function to call the backend API
export const login = (userData) => API.post("/api/auth/login", userData);
