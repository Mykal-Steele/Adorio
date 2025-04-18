import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice"; // Example slice

const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export default store;
