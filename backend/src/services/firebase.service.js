import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '../../firebase-service-account.json';
const serviceAccountPath = path.isAbsolute(saPath) ? saPath : path.resolve(__dirname, saPath);

let firebaseApp;

export const initializeFirebase = () => {
  try {
    if (!admin.apps.length) {
      console.log(`[FCM] Resolving service account from: ${serviceAccountPath}`);
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log('✅ Firebase Admin SDK initialized');
    }
  } catch (error) {
    console.error('❌ Firebase Admin SDK could not be initialized:', error.message);
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

    console.log(`[FCM] Attempting to send multicast to ${tokens.length} tokens`);
    console.log(`[FCM] Payload:`, JSON.stringify(payload));

    const message = {
      tokens: tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data || {},
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`[FCM] Success count: ${response.successCount}`);
    console.log(`[FCM] Failure count: ${response.failureCount}`);
    
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`[FCM] Error for token ${tokens[idx].substring(0, 10)}... :`, resp.error);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('❌ [FCM] Critical error in multicast:', error);
    throw error;
  }
};
