import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User, UserState } from '../types';

const initialState: UserState = {
  user: null,
  token: null,
  isAuthLoading: true, // true until bootstrap resolves
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthLoading = false;
    },
    setAuthLoaded: (state) => {
      state.isAuthLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthLoading = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, setAuthLoaded, logout } = userSlice.actions;
export default userSlice.reducer;
