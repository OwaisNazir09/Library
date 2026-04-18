import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadAuthFromStorage } from './src/store/authSlice';
import { ActivityIndicator, View } from 'react-native';

// Inner component so it has access to dispatch
function AppContent() {
  const dispatch = useDispatch();
  const { initialized } = useSelector(state => state.auth);

  useEffect(() => {
    // Auto-login from AsyncStorage on startup
    dispatch(loadAuthFromStorage());
  }, []);

  if (!initialized) {
    // Show a simple spinner while reading stored token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </SafeAreaProvider>
  );
}
