// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJ2qAejE87EqHfELbfaWqmfqWVsLs0Dls",
  authDomain: "younv-finance.firebaseapp.com",
  projectId: "younv-finance",
  storageBucket: "younv-finance.firebasestorage.app",
  messagingSenderId: "226251137770",
  appId: "1:226251137770:web:15a24ce8121b718b766d93",
  measurementId: "G-4QL6TN0H63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;

