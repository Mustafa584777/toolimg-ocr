import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initializeFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  "apiKey": "AIzaSyCFyGzp7viV1tq25DAMnpKKSJpPngtVa14",
  "authDomain": "gen-lang-client-0844549707.firebaseapp.com",
  "projectId": "gen-lang-client-0844549707",
  "firestoreDatabaseId": "ai-studio-toolimg-a40860b9-3db9-4eab-a65f-f070e159a9b3",
  "storageBucket": "gen-lang-client-0844549707.firebasestorage.app",
  "messagingSenderId": "845800015860",
  "appId": "1:845800015860:web:a6229be704605991785ba1"
};

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
    console.error('Firebase configuration is missing or invalid.');
}

export const config = firebaseConfig;
