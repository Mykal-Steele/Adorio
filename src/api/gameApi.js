import axios from "axios";

// Configure axios with the backend URL
const API_BASE_URL =
  window.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com";
axios.defaults.baseURL = API_BASE_URL;

/**
 * Fetch leaderboard data
 * @returns {Promise<Array>} Sorted array of users with rhythm game scores
 */
export const fetchLeaderboard = async () => {
  try {
    const response = await axios.get("/api/game/leaderboard");
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
    // Include auth token if available
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.post(
      "/api/game/update-score",
      { score, difficulty },
      { headers }
    );
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
    // Include auth token if available
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await axios.get("/api/game/user-stats", { headers });
    return response.data;
  } catch (error) {
    console.error("Error fetching user game stats:", error);
    // Return a sensible fallback for guest users
    return { peakPLevel: 0, difficulty: "normal", anonymous: true };
  }
};
