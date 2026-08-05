export async function onRequestGet(context) {
  const { env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *',
    'Content-Type': 'application/json'
  };

  const configData = {
    apiKey: env.VITE_FIREBASE_API_KEY || env.FIREBASE_API_KEY || '',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || env.FIREBASE_AUTH_DOMAIN || '',
    projectId: env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || '',
    firestoreDatabaseId: env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || env.FIREBASE_FIRESTORE_DATABASE_ID || env.VITE_FIREBASE_PROJECT_ID || env.FIREBASE_PROJECT_ID || '',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: env.VITE_FIREBASE_APP_ID || env.FIREBASE_APP_ID || '',
    razorpayKeyId: env.RAZORPAY_KEY_ID || env.VITE_RAZORPAY_KEY_ID || ''
  };

  return new Response(JSON.stringify(configData), {
    status: 200,
    headers: corsHeaders
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *'
    }
  });
}
