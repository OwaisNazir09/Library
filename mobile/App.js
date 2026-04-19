import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadAuthFromStorage } from './src/store/authSlice';
import { ActivityIndicator, View, Platform } from 'react-native';
import { registerForPushNotificationsAsync, setupNotificationListeners } from './src/services/notificationService';
import { createNavigationContainerRef } from '@react-navigation/native';

const navigationRef = createNavigationContainerRef();

// Inner component so it has access to dispatch
function AppContent() {
  const dispatch = useDispatch();
  const { initialized } = useSelector(state => state.auth);

  useEffect(() => {
    // Auto-login from AsyncStorage on startup
    dispatch(loadAuthFromStorage());

    // Initialize FCM
    const initNotifications = async () => {
      await registerForPushNotificationsAsync();
    };
    initNotifications();

    // Listen for incoming FCM messages
    const unsubscribe = setupNotificationListeners(navigationRef);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!initialized) {
    // Show a simple spinner while reading stored token
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return <AppNavigator navigationRef={navigationRef} />;
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
