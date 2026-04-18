import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { attendanceApi } from '../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const scanQRAttendance = createAsyncThunk(
  'attendance/scanQR',
  async (data, { rejectWithValue }) => {
    try {
      const res = await attendanceApi.scanQR(data);
      return res.data.data.attendance;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyAttendance = createAsyncThunk(
  'attendance/fetchMyAttendance',
  async (_, { rejectWithValue }) => {
    try {
      const res = await attendanceApi.getMyAttendance();
      return res.data.data.attendance;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    records: [],
    scanning: false,
    scanSuccess: false,
    lastScan: null,
    loading: false,
    error: null,
  },
  reducers: {
    addAttendanceRecord: (state, action) => {
      state.records.unshift(action.payload);
    },
    clearScanSuccess: (state) => {
      state.scanSuccess = false;
      state.lastScan = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // scanQRAttendance
    builder
      .addCase(scanQRAttendance.pending, (state) => {
        state.scanning = true;
        state.error = null;
        state.scanSuccess = false;
      })
      .addCase(scanQRAttendance.fulfilled, (state, action) => {
        state.scanning = false;
        state.scanSuccess = true;
        state.lastScan = action.payload;
        state.records.unshift(action.payload);
      })
      .addCase(scanQRAttendance.rejected, (state, action) => {
        state.scanning = false;
        state.error = action.payload;
      });

    // fetchMyAttendance
    builder
      .addCase(fetchMyAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchMyAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { addAttendanceRecord, clearScanSuccess, clearError } = attendanceSlice.actions;
export default attendanceSlice.reducer;
