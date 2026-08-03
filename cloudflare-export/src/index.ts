import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { jwt, sign } from 'hono/jwt';
import puppeteer from '@cloudflare/puppeteer';
import { GoogleGenAI } from '@google/genai';

type Bindings = {
  DB: D1Database;
  MYBROWSER: any; // Cloudflare Browser Rendering binding
  JWT_SECRET: string;
  GEMINI_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS for frontend integration
app.use('/*', cors());

// Basic health check
app.get('/api/health', (c) => c.json({ status: 'ok' }));

/**
 * =======================
 * AUTHENTICATION (D1 based)
 * =======================
 */
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json();
  // 1. Query D1 for user by email
  const user = await c.env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first();
  
  // NOTE: In production, use standard crypto APIs to hash/compare password
  if (!user || user.password_hash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // 2. Sign JWT
  const token = await sign({ id: user.id, email: user.email }, c.env.JWT_SECRET);
  return c.json({ token, user: { email: user.email, credits: user.credits } });
});

/**
 * =======================
 * PROTECTED ROUTES
 * =======================
 */
// Middleware to protect routes that require credits
app.use('/api/tools/*', async (c, next) => {
  const jwtMiddleware = jwt({ secret: c.env.JWT_SECRET });
  return jwtMiddleware(c, next);
});

// Helper to deduct credit
async function deductCredit(env: Bindings, userId: string, toolName: string) {
  // Use D1 Transaction-like batching
  const deductRes = await env.DB.prepare('UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0 RETURNING credits').bind(userId).first();
  
  if (!deductRes) {
    throw new Error('Insufficient credits');
  }

  // Log usage
  await env.DB.prepare('INSERT INTO tool_usage (id, user_id, tool_name) VALUES (lower(hex(randomblob(16))), ?, ?)')
    .bind(userId, toolName)
    .run();
    
  return deductRes.credits;
}

/**
 * =======================
 * AI TOOLS (Gemini)
 * =======================
 */
app.post('/api/tools/image-to-code', async (c) => {
  const payload = await c.req.parseBody();
  // payload extraction logic...
  const user = c.get('jwtPayload');
  
  try {
    const remainingCredits = await deductCredit(c.env, user.id, 'image-to-code');
    
    // Edge-compatible fetch with @google/genai
    const ai = new GoogleGenAI({ apiKey: c.env.GEMINI_API_KEY });
    
    // Process image...
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: 'Convert this image to HTML/Tailwind Code',
        // In CF Workers, you must pass image bytes in inlineData
    });

    return c.json({ code: response.text, credits: remainingCredits });
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});

/**
 * =======================
 * HTML TO IMAGE (Cloudflare Browser Rendering)
 * =======================
 */
app.post('/api/tools/html-to-image', async (c) => {
  const { html } = await c.req.json();
  const user = c.get('jwtPayload');

  try {
    const remainingCredits = await deductCredit(c.env, user.id, 'html-to-image');

    // Launch Cloudflare's browser instance
    const browser = await puppeteer.launch(c.env.MYBROWSER);
    const page = await browser.newPage();
    
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const screenshotBuffer = await page.screenshot({ type: 'png', fullPage: true });
    
    await browser.close();

    // Return the image as base64 or directly as a response buffer
    const base64Image = Buffer.from(screenshotBuffer).toString('base64');
    
    return c.json({ image: `data:image/png;base64,${base64Image}`, credits: remainingCredits });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

/**
 * =======================
 * PAYMENTS (Razorpay)
 * =======================
 */
app.post('/api/payments/create-order', async (c) => {
  // Implement Razorpay API call using standard fetch (edge-compatible)
  // instead of the Node Razorpay SDK which relies on 'crypto'/'fs'
  
  const { amount } = await c.req.json();
  
  const auth = btoa(`${c.env.RAZORPAY_KEY_ID}:${c.env.RAZORPAY_KEY_SECRET}`);
  
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      amount: amount * 100, // INR paise
      currency: 'INR',
      receipt: `rcptid_${Date.now()}`
    })
  });
  
  const order = await response.json();
  return c.json(order);
});

export default app;
