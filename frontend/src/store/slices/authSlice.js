import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('tenantId', credentials.tenantId);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

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
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.data.user;
        state.token = action.payload.token;
        state.role = action.payload.role;
        state.tenantId = action.payload.tenantId;
        localStorage.setItem('role', action.payload.role);
        if (action.payload.tenantId) {
          localStorage.setItem('tenantId', action.payload.tenantId);
        } else {
          localStorage.removeItem('tenantId');
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      });
  },
});

export const { logout, setTenant } = authSlice.actions;
export default authSlice.reducer;
