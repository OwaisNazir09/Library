import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

export const fetchMyLedger = createAsyncThunk(
  'finance/fetchMyLedger',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/finance/me/ledger');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ledger');
    }
  }
);

const financeSlice = createSlice({
  name: 'finance',
  initialState: {
    ledger: null,
    transactions: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyLedger.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyLedger.fulfilled, (state, action) => {
        state.loading = false;
        state.ledger = action.payload.data.account;
        state.transactions = action.payload.data.transactions;
      })
      .addCase(fetchMyLedger.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default financeSlice.reducer;
