import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchTables = createAsyncThunk('tables/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/tables', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addTable = createAsyncThunk('tables/add', async (tableData, { rejectWithValue }) => {
  try {
    const response = await api.post('/tables', tableData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateTable = createAsyncThunk('tables/update', async ({ id, ...data }, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/tables/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteTable = createAsyncThunk('tables/delete', async (id, { rejectWithValue }) => {
  try {
    const response = await api.delete(`/tables/${id}`);
    return { id, ...response.data };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const assignTable = createAsyncThunk('tables/assign', async ({ id, ...assignmentData }, { rejectWithValue }) => {
  try {
    const response = await api.post(`/tables/${id}/assign`, assignmentData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const unassignTable = createAsyncThunk('tables/unassign', async (id, { rejectWithValue }) => {
  try {
    const response = await api.post(`/tables/${id}/unassign`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Deprecated or keep for compatibility with TableBooking.jsx
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
    total: 0,
    page: 1
  },
  reducers: {
    setTablesPage: (state, action) => {
      state.page = action.payload;
    }
  },
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
        state.total = action.payload.total || action.payload.results || state.items.length;
        state.error = null;
      })
      .addCase(fetchTables.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to sync tables';
      })

      // Add Table
      .addCase(addTable.pending, (state) => {
        state.loading = true;
      })
      .addCase(addTable.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data?.table || action.payload.data);
      })


      .addCase(deleteTable.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(t => (t._id || t.id) !== action.payload.id);
      })

      .addMatcher(
        (action) => [updateTable.fulfilled.type, assignTable.fulfilled.type, unassignTable.fulfilled.type, bookTable.fulfilled.type].includes(action.type),
        (state, action) => {
          state.loading = false;
          const updatedTable = action.payload.data?.table || action.payload.data;
          const index = state.items.findIndex(t => (t._id || t.id) === (updatedTable._id || updatedTable.id));
          if (index !== -1) state.items[index] = updatedTable;
        }
      );
  },
});

export const { setTablesPage } = tableSlice.actions;
export default tableSlice.reducer;
