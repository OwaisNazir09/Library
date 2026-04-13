import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchResources = createAsyncThunk('resources/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/resources', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const addResource = createAsyncThunk('resources/add', async (resourceData, { rejectWithValue }) => {
  try {
    const response = await api.post('/resources', resourceData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const updateResource = createAsyncThunk('resources/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/resources/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const deleteResource = createAsyncThunk('resources/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/resources/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

export const trackDownload = createAsyncThunk('resources/trackDownload', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/resources/${id}/download`);
    return { id, downloadCount: response.data.data.downloadCount };
  } catch (error) {
    return rejectWithValue(error.response?.data || error.message);
  }
});

const resourceSlice = createSlice({
  name: 'resources',
  initialState: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    page: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Resources
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.resources;
        state.total = action.payload.total || 0;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch digital library resources';
      })
      
      // Add Resource
      .addCase(addResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addResource.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data.resource);
        state.total += 1;
      })
      .addCase(addResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to upload new resource';
      })

      // Update Resource
      .addCase(updateResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResource.fulfilled, (state, action) => {
        state.loading = false;
        const updatedResource = action.payload.data.resource;
        const index = state.items.findIndex(r => r._id === updatedResource._id);
        if (index !== -1) state.items[index] = updatedResource;
      })
      .addCase(updateResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update resource details';
      })

      // Delete Resource
      .addCase(deleteResource.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResource.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(r => (r._id || r.id) !== action.payload);
        state.total -= 1;
      })
      .addCase(deleteResource.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove resource';
      })

      // Track Download
      .addCase(trackDownload.fulfilled, (state, action) => {
        const index = state.items.findIndex(r => r._id === action.payload.id);
        if (index !== -1) {
          state.items[index].downloadCount = action.payload.downloadCount;
        }
      });
  },
});

export default resourceSlice.reducer;
