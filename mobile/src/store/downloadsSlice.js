import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const DOWNLOADS_KEY = '@lib_downloaded_resources';

export const loadDownloads = createAsyncThunk(
  'downloads/load',
  async () => {
    const data = await AsyncStorage.getItem(DOWNLOADS_KEY);
    return data ? JSON.parse(data) : [];
  }
);

export const addDownload = createAsyncThunk(
  'downloads/add',
  async (resource, { dispatch, getState }) => {
    const { items } = getState().downloads;
    const exists = items.find(i => i._id === resource._id);
    if (exists) return items;

    const newItems = [...items, {
      ...resource,
      downloadedAt: new Date().toISOString(),
      localUri: resource.localUri
    }];

    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(newItems));
    return newItems;
  }
);

export const removeDownload = createAsyncThunk(
  'downloads/remove',
  async (resourceId, { getState }) => {
    const { items } = getState().downloads;
    const item = items.find(i => i._id === resourceId);

    if (item?.localUri) {
      try {
        await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      } catch (e) {
        console.log('Error deleting file:', e);
      }
    }

    const newItems = items.filter(i => i._id !== resourceId);
    await AsyncStorage.setItem(DOWNLOADS_KEY, JSON.stringify(newItems));
    return newItems;
  }
);

const downloadsSlice = createSlice({
  name: 'downloads',
  initialState: {
    items: [],
    loading: false
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDownloads.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addDownload.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(removeDownload.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  }
});

export default downloadsSlice.reducer;
