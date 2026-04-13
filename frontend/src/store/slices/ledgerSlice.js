import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as ledgerService from '../../services/ledgerService';

export const fetchLedgers = createAsyncThunk(
  'ledger/fetchLedgers',
  async (params, { rejectWithValue }) => {
    try {
      const data = await ledgerService.getLedgers(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ledgers');
    }
  }
);

export const fetchStudentLedger = createAsyncThunk(
  'ledger/fetchStudentLedger',
  async ({ studentId, params }, { rejectWithValue }) => {
    try {
      const data = await ledgerService.getStudentLedger(studentId, params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch student ledger');
    }
  }
);

export const addPayment = createAsyncThunk(
  'ledger/addPayment',
  async ({ studentId, data }, { rejectWithValue }) => {
    try {
      const response = await ledgerService.addPayment(studentId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment');
    }
  }
);

export const addCharge = createAsyncThunk(
  'ledger/addCharge',
  async ({ studentId, data }, { rejectWithValue }) => {
    try {
      const response = await ledgerService.addCharge(studentId, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add charge');
    }
  }
);

export const fetchLedgerStats = createAsyncThunk(
  'ledger/fetchLedgerStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ledgerService.getLedgerStats();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ledger stats');
    }
  }
);

const ledgerSlice = createSlice({
  name: 'ledger',
  initialState: {
    ledgers: [],
    totalLedgers: 0,
    currentLedger: null,
    currentEntries: [],
    totalEntries: 0,
    stats: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // getLedgers
    builder.addCase(fetchLedgers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchLedgers.fulfilled, (state, action) => {
      state.loading = false;
      state.ledgers = action.payload.data;
      state.totalLedgers = action.payload.total;
    });
    builder.addCase(fetchLedgers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // getStudentLedger
    builder.addCase(fetchStudentLedger.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchStudentLedger.fulfilled, (state, action) => {
      state.loading = false;
      state.currentLedger = action.payload.data.ledger;
      state.currentEntries = action.payload.data.entries;
      state.totalEntries = action.payload.data.totalEntries;
    });
    builder.addCase(fetchStudentLedger.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // stats
    builder.addCase(fetchLedgerStats.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchLedgerStats.fulfilled, (state, action) => {
      state.loading = false;
      state.stats = action.payload.data;
    });
    builder.addCase(fetchLedgerStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearErrors } = ledgerSlice.actions;
export default ledgerSlice.reducer;
