import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBooks = createAsyncThunk('books/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await api.get('/books', { params });
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const addBook = createAsyncThunk('books/add', async (bookData, { rejectWithValue }) => {
  try {
    const response = await api.post('/books', bookData);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const updateBook = createAsyncThunk('books/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/books/${id}`, data);
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

export const deleteBook = createAsyncThunk('books/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/books/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

const bookSlice = createSlice({
  name: 'books',
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
      // Fetch Books
      .addCase(fetchBooks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBooks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.books || action.payload.data;
        state.total = action.payload.results || action.payload.total || 0;
      })
      .addCase(fetchBooks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to sync with library inventory';
      })
      
      // Add Book
      .addCase(addBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBook.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data.book || action.payload.data);
      })
      .addCase(addBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to add new book';
      })

      // Update Book
      .addCase(updateBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBook.fulfilled, (state, action) => {
        state.loading = false;
        const updatedBook = action.payload.data.book || action.payload.data;
        const index = state.items.findIndex(b => b._id === updatedBook._id);
        if (index !== -1) state.items[index] = updatedBook;
      })
      .addCase(updateBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update book details';
      })

      // Delete Book
      .addCase(deleteBook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBook.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(b => (b._id || b.id) !== action.payload);
      })
      .addCase(deleteBook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to remove book';
      });
  },
});

export default bookSlice.reducer;
