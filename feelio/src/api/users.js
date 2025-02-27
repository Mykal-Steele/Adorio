const axios = require("axios");

// Check if we're in the browser (client-side) to access `window`
const apiUrl =
  typeof window !== "undefined"
    ? window.VITE_BACKEND_URL + "/api/"
    : "https://feelio-github-io.onrender.com/api/";

export const fetchUserData = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${apiUrl}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.user;
  } catch (error) {
    throw new Error("Failed to fetch user data");
  }
};
