import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchEvents = createAsyncThunk('events/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/events');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const createEvent = createAsyncThunk('events/create', async (eventData, { rejectWithValue }) => {
  try {
    const response = await api.post('/events', eventData, {
      headers: { 'Content-Type': eventData instanceof FormData ? 'multipart/form-data' : 'application/json' }
    });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const eventSlice = createSlice({
  name: 'events',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Events
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.events || action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to retrieve library events';
      })
      
      // Create Event
      .addCase(createEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loading = false;
        const newEvent = action.payload.data?.event || action.payload.data;
        if (Array.isArray(state.items)) {
          state.items.unshift(newEvent);
        } else {
          state.items = [newEvent];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to schedule event';
      });
  },
});

export default eventSlice.reducer;
