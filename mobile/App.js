import React, { useEffect } from 'react';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { loadAuthFromStorage, saveFcmToken } from './src/store/authSlice';
import { ActivityIndicator, View, Platform } from 'react-native';
import { registerForPushNotificationsAsync, setupNotificationListeners } from './src/services/notificationService';
import { createNavigationContainerRef } from '@react-navigation/native';

const navigationRef = createNavigationContainerRef();

function AppContent() {
  const dispatch = useDispatch();
  const { initialized, user, isGuest } = useSelector(state => state.auth);
  const notificationInitialized = React.useRef(false);

  useEffect(() => {
    dispatch(loadAuthFromStorage());
  }, []);

  useEffect(() => {
    if (initialized && !isGuest && user && !notificationInitialized.current) {
      notificationInitialized.current = true;

      const initNotifications = async () => {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          dispatch(saveFcmToken(token));
        }
      };
      initNotifications();

      const unsubscribe = setupNotificationListeners(navigationRef);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }

    if (!user) {
      notificationInitialized.current = false;
    }
  }, [initialized, isGuest, user]);

  if (!initialized) {
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
