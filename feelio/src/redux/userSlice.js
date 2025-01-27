import { createSlice } from "@reduxjs/toolkit";

// Create a slice for user authentication
const userSlice = createSlice({
  name: "user",
  initialState: {
    user: null, // Store user data
    token: null, // Store JWT token
  },
  reducers: {
    // Action to set the user data and token
    setUser: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    // Action to log the user out
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

// Export actions to dispatch
export const { setUser, logout } = userSlice.actions;

// Export reducer to be used in the store
export default userSlice.reducer;
