import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourceApi } from '../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchPublicResources = createAsyncThunk(
  'resources/fetchPublicResources',
  async (params, { rejectWithValue }) => {
    try {
      const res = await resourceApi.getPublicResources(params);
      return res.data.data.resources;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchAllResources = createAsyncThunk(
  'resources/fetchAllResources',
  async (params, { rejectWithValue }) => {
    try {
      const res = await resourceApi.getAllResources(params);
      return res.data.data.resources;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchResourceById = createAsyncThunk(
  'resources/fetchResourceById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await resourceApi.getResource(id);
      return res.data.data.resource;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const trackResourceDownload = createAsyncThunk(
  'resources/trackDownload',
  async (id, { rejectWithValue }) => {
    try {
      await resourceApi.trackDownload(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const resourceSlice = createSlice({
  name: 'resources',
  initialState: {
    globalResources: [],
    privateResources: [],
    selectedResource: null,
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: 'All',
    page: 1,
    hasMore: true,
  },
  reducers: {
    setGlobalResources: (state, action) => {
      state.globalResources = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    clearSelectedResource: (state) => {
      state.selectedResource = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchPublicResources
    builder
      .addCase(fetchPublicResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicResources.fulfilled, (state, action) => {
        state.loading = false;
        state.globalResources = action.payload;
      })
      .addCase(fetchPublicResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchAllResources
    builder
      .addCase(fetchAllResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllResources.fulfilled, (state, action) => {
        state.loading = false;
        state.privateResources = action.payload;
      })
      .addCase(fetchAllResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchResourceById
    builder
      .addCase(fetchResourceById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResourceById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedResource = action.payload;
      })
      .addCase(fetchResourceById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { 
  setGlobalResources, 
  setSearchQuery, 
  setSelectedCategory, 
  clearSelectedResource,
  clearError 
} = resourceSlice.actions;
export default resourceSlice.reducer;
