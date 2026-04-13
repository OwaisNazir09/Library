import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBorrowings = createAsyncThunk('borrowings/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/borrowings', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const issueBook = createAsyncThunk('borrowings/issue', async (borrowData, { rejectWithValue }) => {
  try {
    const response = await api.post('/borrowings/borrow', borrowData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const returnBook = createAsyncThunk('borrowings/return', async (id, { rejectWithValue }) => {
  try {
    const response = await api.patch(`/borrowings/return/${id}`);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const borrowingSlice = createSlice({
  name: 'borrowings',
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
      // Fetch Borrowings
      .addCase(fetchBorrowings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBorrowings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data?.borrowings || action.payload.data || [];
        state.total = action.payload.total || action.payload.results || 0;
        state.error = null;
      })
      .addCase(fetchBorrowings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to sync borrowing records';
      })
      
      // Issue Book
      .addCase(issueBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(issueBook.fulfilled, (state, action) => {
        state.loading = false;
        const newRecord = action.payload.data?.borrowing || action.payload.data;
        if (Array.isArray(state.items)) {
          state.items.unshift(newRecord);
        } else {
          state.items = [newRecord];
        }
      })
      .addCase(issueBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to process book issuance';
      })

      // Return Book
      .addCase(returnBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(returnBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRecord = action.payload.data?.borrowing || action.payload.data;
        if (Array.isArray(state.items)) {
          const index = state.items.findIndex(b => (b._id || b.id) === (updatedRecord._id || updatedRecord.id));
          if (index !== -1) state.items[index] = updatedRecord;
        }
      })
      .addCase(returnBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to record book return';
      });
  },
});

export default borrowingSlice.reducer;
