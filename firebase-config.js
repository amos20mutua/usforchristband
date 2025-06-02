// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWqsCnKNB5swzX9cUzA_TTtXvx4S0rxfQ",
    authDomain: "us-for-crist-band.firebaseapp.com",
    projectId: "us-for-crist-band",
    storageBucket: "us-for-crist-band.firebasestorage.app",
    messagingSenderId: "988539412486",
    appId: "1:988539412486:web:b5a59cb721661a14876387",
    measurementId: "G-B0EPWVX0LD"
};

// Initialize Firebase
let app;
let db;
let auth;
let storage;

try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
} catch (error) {
    console.error("Firebase initialization error:", error);
    // Provide fallback or show error to user
    document.body.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1>Connection Error</h1>
            <p>Unable to connect to the server. Please try again later.</p>
        </div>
    `;
}

export { db, auth, storage }; 