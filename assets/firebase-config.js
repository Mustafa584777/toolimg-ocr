// assets/firebase-config.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let firebaseConfig = {};
try {
    const response = await fetch('/api/config');
    firebaseConfig = await response.json();
} catch (error) {
    console.error('Failed to load firebase config:', error);
}

export let app, auth, db;

if (firebaseConfig && firebaseConfig.apiKey) {
    try {
        app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
        auth = getAuth(app);
        db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId || 'default');
    } catch (e) {
        console.error('Firebase initialization failed:', e);
    }
} else {
    console.error('Firebase configuration is missing or invalid. Check /api/config response.');
}

export const config = firebaseConfig;
