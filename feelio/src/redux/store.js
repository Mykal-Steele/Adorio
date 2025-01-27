import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

// Configure Redux store
const store = configureStore({
  reducer: {
    user: userReducer, // Adding the user reducer to the store
  },
});

export default store;
