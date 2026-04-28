import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authApi, saveAuthData, clearAuthData } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await authApi.login({ email, password });
      const { token, data: { user }, tenantId } = res.data;
      await saveAuthData(token, tenantId);
      return { user, token, tenantId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authApi.register(formData);
      return { message: res.data.message };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const loadAuthFromStorage = createAsyncThunk(
  'auth/loadAuthFromStorage',
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem('@lib_auth_token');
      if (!token) return null;
      // Re-fetch user profile with stored token
      const res = await authApi.getMe();
      const tenantId = await AsyncStorage.getItem('@lib_tenant_id');
      return { user: res.data.data.user, token, tenantId };
    } catch (err) {
      await clearAuthData();
      return null;
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (formData, { rejectWithValue }) => {
    try {
      const res = await authApi.updateMe(formData);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveFcmToken = createAsyncThunk(
  'auth/saveFcmToken',
  async (fcmToken, { rejectWithValue }) => {
    try {
      const res = await authApi.saveFcmToken(fcmToken);
      return res.data.data.user;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    tenantId: null,
    isGuest: true,
    loading: false,
    error: null,
    initialized: false,
  },
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.tenantId = action.payload.tenantId ?? null;
      state.isGuest = false;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tenantId = null;
      state.isGuest = true;
      clearAuthData();
    },
    setGuestMode: (state) => {
      state.isGuest = true;
      state.initialized = true;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loginUser
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.tenantId = action.payload.tenantId ?? null;
        state.isGuest = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // registerUser
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // User is not logged in because registration is pending admin approval
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // loadAuthFromStorage
    builder
      .addCase(loadAuthFromStorage.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.tenantId = action.payload.tenantId ?? null;
          state.isGuest = false;
        } else {
          state.isGuest = true;
        }
        state.initialized = true;
      })
      .addCase(loadAuthFromStorage.rejected, (state) => {
        state.isGuest = true;
        state.initialized = true;
      });

    // updateUserProfile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveFcmToken.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  }
});

export const { login, logout, setGuestMode, clearError } = authSlice.actions;
export default authSlice.reducer;
