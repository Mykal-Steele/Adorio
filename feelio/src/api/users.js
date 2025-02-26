//feelio\src\api\users.js
import axios from "axios";

const apiUrl = "http://localhost:5000/api/"; // Replace with your backend URL

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
s;
