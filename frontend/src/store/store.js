import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookReducer from './slices/bookSlice';
import userReducer from './slices/userSlice';
import borrowingReducer from './slices/borrowingSlice';
import eventReducer from './slices/eventSlice';
import tableReducer from './slices/tableSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    books: bookReducer,
    users: userReducer,
    borrowings: borrowingReducer,
    events: eventReducer,
    tables: tableReducer,
  },
});
