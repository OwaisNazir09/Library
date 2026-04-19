/**
 * Mock Notification Service
 * Temporarily disabled React Native Firebase
 */

export const registerForPushNotificationsAsync = async (userId) => {
  console.log('Push notifications are currently disabled on mobile');
  return null;
};

export const setupNotificationListeners = (navigation) => {
  console.log('Notification listeners disabled');
  return () => {};
};

export const handleNotificationOpen = (remoteMessage, navigation) => {
  console.log('Manual notification opening disabled');
};

export const scheduleLocalNotification = async (title, body) => {
   console.log('Local Alert:', title, body);
};
