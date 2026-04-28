import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (!Device.isDevice) {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }

  if (Constants.appOwnership === 'expo' && Platform.OS === 'android') {
    console.warn('Remote notifications are not supported in Expo Go on Android. Please use a development build.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token: Permission not granted');
    return null;
  }

  try {
    // We use getDevicePushTokenAsync for direct FCM/APNs tokens required by the backend
    const nativeToken = await Notifications.getDevicePushTokenAsync();
    token = nativeToken.data;
    console.log('✅ Native Push Token generated:', token);
  } catch (error) {
    console.error('❌ Error getting native push token:', error);
    // Fallback to Expo Push Token if native fails (though backend prefers native)
    try {
      const expoToken = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });
      token = expoToken.data;
      console.log('⚠️ Fallback to Expo Push Token:', token);
    } catch (e) {
      console.error('❌ Both token methods failed:', e);
    }
  }

  return token;
};

export const setupNotificationListeners = (navigationRef) => {
  const notificationListener = Notifications.addNotificationReceivedListener(notification => {
    console.log('🔔 [MOBILE] Notification Received (Foreground):', JSON.stringify(notification, null, 2));
  });
  const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data;
    console.log('Notification Tapped:', data);

    if (data?.screen && navigationRef?.current) {
      navigationRef.current.navigate(data.screen, data.params || {});
    }
  });

  return () => {
    notificationListener.remove();
    responseListener.remove();
  };
};

export const scheduleLocalNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null,
  });
};
