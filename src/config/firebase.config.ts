import * as admin from 'firebase-admin';
import { logger } from '@shared/services/logger.service';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
  logger.warn('Firebase configuration missing in environment variables. DB operations may fail.');
}

const firebaseApp = admin.apps.length
  ? admin.app()
  : admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });

const db = admin.firestore(firebaseApp);
db.settings({ ignoreUndefinedProperties: true });

logger.info('Firebase Admin initialized');

export { db, admin };
