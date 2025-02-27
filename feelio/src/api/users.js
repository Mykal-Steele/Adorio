// feelio\src\api\users.js
const axios = require("axios");

// Access environment variable for backend URL
const apiUrl = process.env.VITE_BACKEND_URL + "/api/";

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
