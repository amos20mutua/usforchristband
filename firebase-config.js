// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBWqsCnKNB5swzX9cUzA_TTtXvx4S0rxfQ",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "us-for-crist-band.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "us-for-crist-band",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "us-for-crist-band.firebasestorage.app",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "988539412486",
    appId: process.env.FIREBASE_APP_ID || "1:988539412486:web:b5a59cb721661a14876387",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-B0EPWVX0LD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage }; 