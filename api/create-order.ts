import type { Request, Response } from 'express';
import Razorpay from 'razorpay';

let razorpayClient: Razorpay | null = null;

function getRazorpayClient() {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay API keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing. Please configure them in your Vercel Environment Variables.');
    }
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

export default async function handler(req: Request, res: Response) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    let amountInPaise = Number(amount);
    
    // Validate amount >= 100 paise
    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Minimum amount must be at least 100 paise (₹1)' });
    }

    const rzp = getRazorpayClient();
    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || 'rcpt_' + Math.random().toString(36).substring(2, 15),
    };

    const order = await rzp.orders.create(options);
    
    res.status(200).json({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    if (error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('auth'))) {
      return res.status(401).json({ error: 'Razorpay API credentials authentication failed. Please check your keys in Vercel settings.' });
    }
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
}
