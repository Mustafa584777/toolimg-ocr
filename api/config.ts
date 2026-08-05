import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

export default async function handler(req: Request, res: Response) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Guest-ID, Authorization, *');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const configData = {
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
      firestoreDatabaseId: process.env.VITE_FIREBASE_DATABASE_ID || process.env.FIREBASE_DATABASE_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
    };

    // If any key is missing from environment, try to read from the JSON file as fallback
    let configPath = path.join(process.cwd(), 'firebase-applet-config.json');
    if (!fs.existsSync(configPath)) {
      configPath = path.join(__dirname, '../firebase-applet-config.json');
    }
    if (fs.existsSync(configPath) && (!configData.apiKey || !configData.projectId)) {
      const fileConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      Object.assign(configData, fileConfig);
      // Ensure Razorpay key is still present
      if (!configData.razorpayKeyId) {
        configData.razorpayKeyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || '';
      }
    }

    res.status(200).json(configData);
  } catch (error: any) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to retrieve configuration' });
  }
}
