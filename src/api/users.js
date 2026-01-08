import API from "./index"; // use your API wrapper instead of axios directly
import { handleApiError } from "../utils/errorHandling";
const axios = require("axios");

// figuring out if we're in the browser or not so we can get the url right
// spent way too long debugging this stupid issue
const apiUrl =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_BACKEND_URL || "") + "/api/"
    : "https://adorio.space/api/";

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
    throw handleApiError(error, "failed to fetch user data");
  }
};

// planning to add profile update stuff here but haven't gotten to it yet
// kinda copying the pattern i used in posts.js but with axios instead of my API wrapper

// might refactor this later to use the API class from index.js
// but it works for now so whatever
