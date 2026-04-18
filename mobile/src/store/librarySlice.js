import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { libraryApi } from '../services/api';


export const fetchLibraries = createAsyncThunk(
  'libraries/fetchLibraries',
  async (params, { rejectWithValue }) => {
    try {
      const res = await libraryApi.getLibraries(params);
      return res.data.data.tenants;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchLibraryById = createAsyncThunk(
  'libraries/fetchLibraryById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await libraryApi.getLibrary(id);
      return res.data.data.tenant;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const joinLibrary = createAsyncThunk(
  'libraries/joinLibrary',
  async (libraryId, { rejectWithValue }) => {
    try {
      const res = await libraryApi.joinLibrary(libraryId);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchMyLibraries = createAsyncThunk(
  'libraries/fetchMyLibraries',
  async (_, { rejectWithValue }) => {
    try {
      const res = await libraryApi.getMyLibraries();
      return res.data.data.libraries;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const librarySlice = createSlice({
  name: 'libraries',
  initialState: {
    librariesList: [],
    joinedLibraries: [],
    selectedLibrary: null,
    loading: false,
    joining: false,
    joinSuccess: false,
    joinMessage: '',
    error: null,
  },
  reducers: {
    setLibraries: (state, action) => {
      state.librariesList = action.payload;
    },
    setJoinedLibraries: (state, action) => {
      state.joinedLibraries = action.payload;
    },
    clearJoinSuccess: (state) => {
      state.joinSuccess = false;
      state.joinMessage = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchLibraries
    builder
      .addCase(fetchLibraries.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLibraries.fulfilled, (state, action) => {
        state.loading = false;
        state.librariesList = action.payload;
      })
      .addCase(fetchLibraries.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchLibraryById
    builder
      .addCase(fetchLibraryById.fulfilled, (state, action) => {
        state.selectedLibrary = action.payload;
      });

    // joinLibrary
    builder
      .addCase(joinLibrary.pending, (state) => {
        state.joining = true;
        state.error = null;
        state.joinSuccess = false;
      })
      .addCase(joinLibrary.fulfilled, (state, action) => {
        state.joining = false;
        state.joinSuccess = true;
        state.joinMessage = action.payload.message || 'Join request sent!';
      })
      .addCase(joinLibrary.rejected, (state, action) => {
        state.joining = false;
        state.error = action.payload;
      });

    // fetchMyLibraries
    builder
      .addCase(fetchMyLibraries.fulfilled, (state, action) => {
        state.joinedLibraries = action.payload;
      });
  }
});

export const { setLibraries, setJoinedLibraries, clearJoinSuccess, clearError } = librarySlice.actions;
export default librarySlice.reducer;
