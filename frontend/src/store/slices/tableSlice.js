import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTables = createAsyncThunk('tables/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/tables');
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const bookTable = createAsyncThunk('tables/book', async (bookingData, { rejectWithValue }) => {
  try {
    const response = await api.post('/tables/book', bookingData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const tableSlice = createSlice({
  name: 'tables',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Tables
      .addCase(fetchTables.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTables.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.tables || action.payload.data || [];
        state.error = null;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to sync table availability';
      })
      
      // Book Table
      .addCase(bookTable.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookTable.fulfilled, (state, action) => {
        state.loading = false;
        const updatedTable = action.payload.data?.table || action.payload.data;
        if (Array.isArray(state.items)) {
          const index = state.items.findIndex(t => (t._id || t.id) === (updatedTable._id || updatedTable.id));
          if (index !== -1) state.items[index] = updatedTable;
        }
      })
      .addCase(bookTable.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to confirm table booking';
      });
  },
});

export default tableSlice.reducer;
