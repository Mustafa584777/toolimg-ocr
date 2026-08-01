// assets/firebase-config.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let firebaseConfig = {};
try {
    const response = await fetch('/api/config');
    if (response.ok) {
        firebaseConfig = await response.json();
    } else {
        throw new Error(`Server returned status ${response.status}`);
    }
} catch (error) {
    console.error('Failed to load firebase config from /api/config, trying fallback:', error);
    try {
        const fallbackResponse = await fetch('/firebase-applet-config.json');
        if (fallbackResponse.ok) {
            firebaseConfig = await fallbackResponse.json();
            console.log('Successfully loaded firebase config from fallback JSON');
        } else {
            throw new Error(`Fallback returned status ${fallbackResponse.status}`);
        }
    } catch (fallbackError) {
        console.error('Failed to load firebase config from fallback JSON:', fallbackError);
    }
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
