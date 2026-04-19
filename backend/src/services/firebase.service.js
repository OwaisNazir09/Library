import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Note: You need to place your firebase-service-account.json in the backend root or src
// For now, we initialize it using environment variables or a placeholder
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, '../../firebase-service-account.json');

let firebaseApp;

export const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log('Firebase Admin SDK initialized');
    }
  } catch (error) {
    console.warn('Firebase Admin SDK could not be initialized. Check service account file.');
  }
};

export const sendPushNotification = async (token, payload) => {
  try {
    if (!admin.apps.length) initializeFirebase();
    
    const message = {
      token: token,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().send(message);
    return response;
  } catch (error) {
    console.error('Error sending single notification:', error);
    throw error;
  }
};

export const sendMulticastNotification = async (tokens, payload) => {
  try {
    if (!admin.apps.length) initializeFirebase();

    const message = {
      tokens: tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    return response;
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    throw error;
  }
};
