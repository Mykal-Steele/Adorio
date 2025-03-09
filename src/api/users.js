import API from "./index"; // use your API wrapper instead of axios directly
import { handleApiError } from "../utils/errorHandling";

export const fetchUserData = async () => {
  try {
    // Use API wrapper which already handles auth headers
    const response = await API.get("/users/me");
    return response.data;
  } catch (error) {
    throw handleApiError(error, "failed to fetch user data");
  }
};

// planning to add profile update stuff here but haven't gotten to it yet
// kinda copying the pattern i used in posts.js but with axios instead of my API wrapper

// might refactor this later to use the API class from index.js
// but it works for now so whatever
