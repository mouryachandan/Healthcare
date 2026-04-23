import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('medisync_token');
const initialState = {
  token: stored || null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (action.payload.token)
        localStorage.setItem('medisync_token', action.payload.token);
      else localStorage.removeItem('medisync_token');
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      localStorage.removeItem('medisync_token');
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
