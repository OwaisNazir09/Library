import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchPackages = createAsyncThunk(
  'packages/fetchPackages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/packages');
      return response.data.data.packages;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const createPackage = createAsyncThunk(
  'packages/createPackage',
  async (packageData, { rejectWithValue }) => {
    try {
      const response = await api.post('/packages', packageData);
      return response.data.data.package;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const updatePackage = createAsyncThunk(
  'packages/updatePackage',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/packages/${id}`, data);
      return response.data.data.package;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deletePackage = createAsyncThunk(
  'packages/deletePackage',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/packages/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

const packageSlice = createSlice({
  name: 'packages',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPackage.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updatePackage.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deletePackage.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  }
});

export default packageSlice.reducer;
