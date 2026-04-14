import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: localStorage.getItem('token'),
    tenantId: localStorage.getItem('tenantId'),
    role: localStorage.getItem('role'),
    loading: false,
    error: null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, role, tenantId } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role;
      state.tenantId = tenantId;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tenantId = null;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('tenantId');
      localStorage.removeItem('role');
    },
    setTenant: (state, action) => {
      state.tenantId = action.payload;
      localStorage.setItem('tenantId', action.payload);
    }
  },
});

export const { logout, setTenant, setCredentials } = authSlice.actions;
export default authSlice.reducer;
