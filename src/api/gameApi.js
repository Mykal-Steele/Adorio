import axios from "axios";
import { handleApiError } from "../utils/errorHandling";

// Create a shared API instance with consistent configuration
const API = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_URL || "",
  timeout: 10000, // 10 second timeout like your other API files
});

// Add request interceptor to attach auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Fetch leaderboard data
 * @returns {Promise<Array>} Sorted array of users with rhythm game scores
 */
export const fetchLeaderboard = async () => {
  try {
    const response = await API.get("/api/game/leaderboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return [];
  }
};

/**
 * Update user's rhythm game score
 * @param {number} score - The player's P-Level score
 * @param {string} difficulty - Game difficulty (easy, normal, hard)
 * @returns {Promise<Object>} Response with updated score info
 */
export const updateScore = async (score, difficulty) => {
  try {
    const response = await API.post("/api/game/update-score", {
      score,
      difficulty,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Failed to update score:",
      error.response?.data || error.message
    );
    // Return a sensible fallback so the UI can handle it gracefully
    return { anonymous: true, localScore: true };
  }
};

/**
 * Fetch the current user's rhythm game stats
 * @returns {Promise<Object>} User's game statistics
 */
export const fetchUserGameStats = async () => {
  try {
    const response = await API.get("/api/game/user-stats");
    return response.data;
  } catch (error) {
    // Don't treat as error for anonymous users
    if (error.response && error.response.status === 401) {
      console.log("User not authenticated, using local stats");
      return { peakPLevel: 0, difficulty: "normal", anonymous: true };
    }

    console.error("Error fetching user game stats:", error);
    return { peakPLevel: 0, difficulty: "normal", anonymous: true };
  }
};
