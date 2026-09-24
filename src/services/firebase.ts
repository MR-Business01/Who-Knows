// Firebase Realtime Database & Hosting Service
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration.
// Note: Firebase Web API keys and project IDs are client identifiers embedded in the frontend bundle.
// Security is enforced via Firebase Database Security Rules and Authentication, not secret API keys.
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyA-ooY53jgPNbOqFj8VvmzDpgcCiIVPcK0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "who-knows-8d326.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://who-knows-8d326-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "who-knows-8d326",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "who-knows-8d326.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "339464203635",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:339464203635:web:8b9c07819977335dfba906",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-S2XMN0BP0V"
};

// Initialize Firebase App & Realtime DB defensively
export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

let analyticsInstance = null;
if (typeof window !== 'undefined') {
  try {
    analyticsInstance = getAnalytics(app);
  } catch (err) {
    console.warn("Firebase Analytics initialization skipped:", err);
  }
}
export const analytics = analyticsInstance;
