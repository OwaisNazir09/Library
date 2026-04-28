import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import resourceReducer from './resourceSlice';
import libraryReducer from './librarySlice';
import blogReducer from './blogSlice';
import attendanceReducer from './attendanceSlice';
import userReducer from './userSlice';
import downloadsReducer from './downloadsSlice';
import financeReducer from './financeSlice';
import notificationReducer from './notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resources: resourceReducer,
    libraries: libraryReducer,
    blogs: blogReducer,
    attendance: attendanceReducer,
    user: userReducer,
    downloads: downloadsReducer,
    finance: financeReducer,
    notifications: notificationReducer,
  },
});
