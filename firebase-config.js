// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "u4c-band.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "u4c-band",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "u4c-band.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
    appId: process.env.FIREBASE_APP_ID || "1:123456789:web:abcdef123456789"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Log initialization status
console.log('Firebase initialized:', {
    app: !!app,
    db: !!db,
    auth: !!auth,
    storage: !!storage
});

export { app, db, auth, storage }; 