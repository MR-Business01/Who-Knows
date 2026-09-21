// Firebase Realtime Database & Hosting Service
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyA-ooY53jgPNbOqFj8VvmzDpgcCiIVPcK0",
  authDomain: "who-knows-8d326.firebaseapp.com",
  databaseURL: "https://who-knows-8d326-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "who-knows-8d326",
  storageBucket: "who-knows-8d326.firebasestorage.app",
  messagingSenderId: "339464203635",
  appId: "1:339464203635:web:8b9c07819977335dfba906",
  measurementId: "G-S2XMN0BP0V"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
