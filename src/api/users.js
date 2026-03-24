import API from "./index";
import { handleApiError } from "../utils/errorHandling";
const axios = require("axios");

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
