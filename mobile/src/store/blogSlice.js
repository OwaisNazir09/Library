import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { blogApi } from '../services/api';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const fetchBlogs = createAsyncThunk(
  'blogs/fetchBlogs',
  async (params, { rejectWithValue }) => {
    try {
      const res = await blogApi.getBlogs(params);
      return res.data.data.blogs;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchBlogById = createAsyncThunk(
  'blogs/fetchBlogById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await blogApi.getBlog(id);
      return res.data.data.blog;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const submitBlog = createAsyncThunk(
  'blogs/submitBlog',
  async (data, { rejectWithValue }) => {
    try {
      const res = await blogApi.submitBlog(data);
      return res.data.data.blog;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const blogSlice = createSlice({
  name: 'blogs',
  initialState: {
    blogsList: [],
    selectedBlog: null,
    loading: false,
    submitting: false,
    error: null,
    submitSuccess: false,
  },
  reducers: {
    setBlogs: (state, action) => {
      state.blogsList = action.payload;
    },
    clearSelectedBlog: (state) => {
      state.selectedBlog = null;
    },
    clearSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchBlogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogsList = action.payload;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // fetchBlogById
    builder
      .addCase(fetchBlogById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBlogById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedBlog = action.payload;
      })
      .addCase(fetchBlogById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // submitBlog
    builder
      .addCase(submitBlog.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitBlog.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitSuccess = true;
        // Optimistically add to list (will show as pending)
        state.blogsList.unshift(action.payload);
      })
      .addCase(submitBlog.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  }
});

export const { setBlogs, clearSelectedBlog, clearSubmitSuccess, clearError } = blogSlice.actions;
export default blogSlice.reducer;
