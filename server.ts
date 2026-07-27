import 'dotenv/config';
import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Config Endpoint to serve Firebase config safely to frontend
app.get('/api/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      return res.json({
        ...configData,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
      });
    }
    
    // Fallback to environment variables
    return res.json({
      apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY || '',
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.FIREBASE_AUTH_DOMAIN || '',
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || '',
      firestoreDatabaseId: process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID || '',
      storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.FIREBASE_MESSAGING_SENDER_ID || '',
      appId: process.env.VITE_FIREBASE_APP_ID || process.env.FIREBASE_APP_ID || '',
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || ''
    });
  } catch (error: any) {
    console.error('Error reading config:', error);
    res.status(500).json({ error: 'Failed to read configuration' });
  }
});

// Razorpay SDK Integration
import Razorpay from 'razorpay';
import crypto from 'crypto';

// Lazy initialization helper for Razorpay SDK Client
let razorpayClient: Razorpay | null = null;

function getRazorpayClient(): Razorpay {
  if (!razorpayClient) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error('Razorpay API keys (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are missing. Please configure them in your .env file.');
    }
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayClient;
}

// Shared logic to create a Razorpay payment order
async function createOrderHandler(req: express.Request, res: express.Response) {
  try {
    const { amount, currency = 'INR', receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    let amountInPaise = Number(amount);
    
    // Convert INR to Paise if called by old frontend endpoint /api/razorpay/order
    if (req.path === '/api/razorpay/order' && amountInPaise < 100) {
      amountInPaise = Math.round(amountInPaise * 100);
    }

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
    
    res.json({
      orderId: order.id,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID || ''
    });
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    if (error.statusCode === 401 || (error.message && error.message.toLowerCase().includes('auth'))) {
      return res.status(401).json({ error: 'Razorpay API credentials authentication failed' });
    }
    res.status(500).json({ error: error.message || 'Failed to create Razorpay order' });
  }
}

// Shared logic to verify a Razorpay payment signature
async function verifyPaymentHandler(req: express.Request, res: express.Response) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details for verification' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Razorpay secret key is not configured on the server.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (generatedSignature === razorpay_signature) {
      res.json({ success: true, message: 'Payment verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }
  } catch (error: any) {
    console.error('Razorpay Signature Verification Error:', error);
    res.status(500).json({ error: error.message || 'Verification system error' });
  }
}

// Order Creation routes (supports both styles)
app.post('/api/create-order', createOrderHandler);
app.post('/api/razorpay/order', createOrderHandler);

// Verification routes (supports both styles)
app.post('/api/verify-payment', verifyPaymentHandler);
app.post('/api/razorpay/verify', verifyPaymentHandler);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is missing.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Helper function to retry Gemini API calls with exponential backoff and model fallback
async function generateContentWithRetryAndFallback(aiClient: any, params: any) {
  let attempt = 0;
  const maxRetries = 3;
  const baseDelayMs = 1500;
  const primaryModel = params.model || 'gemini-3.5-flash';
  
  while (true) {
    try {
      attempt++;
      return await aiClient.models.generateContent(params);
    } catch (error: any) {
      console.error(`Gemini API call (${params.model}) attempt ${attempt} failed:`, error.message || error);
      
      const isTransient = error.status === 'UNAVAILABLE' || 
                          error.statusCode === 503 || 
                          error.statusCode === 429 ||
                          (error.message && (
                            error.message.includes('503') || 
                            error.message.includes('UNAVAILABLE') || 
                            error.message.includes('429') ||
                            error.message.includes('demand') ||
                            error.message.includes('resource')
                          ));
                          
      if (isTransient && attempt < maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        console.log(`Transient error on ${params.model} (Attempt ${attempt}/${maxRetries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // If primary model failed after all retries, try to fall back if it was gemini-3.5-flash
        if (primaryModel === 'gemini-3.5-flash' && params.model !== 'gemini-3.1-flash-lite') {
          console.warn(`Primary model gemini-3.5-flash failed all attempts. Falling back to gemini-3.1-flash-lite...`);
          params.model = 'gemini-3.1-flash-lite';
          attempt = 0; // Reset attempt count for fallback model
          continue;
        }
        throw error;
      }
    }
  }
}

// Image to Code Generation Endpoint
app.post('/api/ocr', async (req: express.Request, res: express.Response) => {
  try {
    const { base64Data, fileName = 'mockup.png', mimeType = 'image/png', framework = 'html-tailwind', styleTheme = 'modern-dark', customPrompt = '', interactivity = 'interactive' } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.' });
    }

    const systemInstruction = `
You are a master frontend engineer specializing in converting user designs, wireframes, screenshots, or hand-drawn sketches into pixel-perfect, highly polished, responsive, and functional frontend code.
Analyze the provided screenshot/mockup image.
Your goal is to reconstruct the exact design, typography, spacing, visual layout, and color scheme.

We support different target output options:
1. TARGET FRAMEWORK:
   - html-tailwind: Generate a single, completely self-contained, valid HTML5 file. This file MUST include Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>), Google Fonts for typography matches, and FontAwesome/Lucide or clean custom SVGs for icons. Use a script block inside to implement realistic interactions if requested (tab switching, modals, dropdown toggles, counter increments, or search filters).
   - react-tailwind: Generate a modern, highly interactive React functional component using Tailwind CSS utility classes and Lucide React or inline custom SVG icons. Ensure complete state management is written using React hooks (useState, useEffect, etc.).
   - vue-tailwind: Generate a single-file Vue 3 component with <template>, <script setup> (using ref, computed, etc.), and Tailwind utility classes.

2. STYLE THEMES (If specified, adapt or apply it cleanly):
   - modern-dark: Sleek deep slate/charcoal colors, high-tech dark background, glowing indicators, smooth contrast.
   - clean-light: Minimalist off-white backdrops, charcoal typography, elegant soft shadows, pristine light design.
   - neon-cyberpunk: Dark background, vibrant electric pink, neon purple, and cyan highlights, glowing borders, high contrast.
   - retro-90s: Windows 95/98 nostalgic style, retro grey buttons, thick borders, pixelated feel, serif typography, fun color tabs.
   - minimalist-slate: Monochromatic grays, slate, spacious padding, heavy rely on bold/thin typography contrasts.

3. INTERACTIVITY LEVEL (If 'interactive' is requested):
   - Make the mockup feel completely alive! Write robust client-side event handlers/scripts or component state. For instance, if there's a sidebar, support folding/unfolding; if there are cards/tabs, allow clicking them to filter or switch active views; if there's an input/button, allow adding dummy items; if there's a search, implement simple client-side search/filter on dummy cards.

Return a JSON response with the following structured format:
{
  "htmlCode": "A completely self-contained HTML file utilizing Tailwind CSS. This will be loaded into an iframe for instant rendering and interactive preview. It must be valid HTML with standard CSS/JS and no React syntax.",
  "frameworkCode": "The clean source code written exactly in the selected framework format (e.g. JSX React code or Vue SFC code). If 'html-tailwind' is selected, this can be identical to htmlCode or beautifully formatted clean HTML.",
  "markdownSummary": "A high-quality markdown document explaining: 1. Design Overview and color palette identified. 2. Key components implemented and their responsive adaptations. 3. Framework installation instructions (how to run the React/Vue component, what packages to install like 'lucide-react', 'recharts' if there were charts, etc.).",
  "designAnalysis": {
    "colors": ["list of hex codes or color names found"],
    "typography": "font names and styles identified or mapped",
    "layout": "structural strategy (e.g. sidebar left, main feed, header grid, bento box)",
    "componentsIdentified": ["navbar", "sidebar", "metrics card", "etc."]
  }
}
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        htmlCode: { type: Type.STRING },
        frameworkCode: { type: Type.STRING },
        markdownSummary: { type: Type.STRING },
        designAnalysis: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            typography: { type: Type.STRING },
            layout: { type: Type.STRING },
            componentsIdentified: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['colors', 'typography', 'layout', 'componentsIdentified']
        }
      },
      required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
    };

    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: base64Data
      }
    };

    let promptText = `Convert this image to code.
Target Framework: ${framework}
Style Theme: ${styleTheme}
Interactivity: ${interactivity}
Source filename: ${fileName}`;

    if (customPrompt && customPrompt.trim()) {
      promptText += `\nAdditional user instructions: "${customPrompt}"`;
    }

    const textPart = { text: promptText };

    // Call Gemini API with robust retry and fallback mechanism
    const response = await generateContentWithRetryAndFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('No response from Gemini API');
    }

    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error('Error converting image to code:', error);
    res.status(500).json({ error: error.message || 'Failed to convert image to code' });
  }
});

// Serve frontend in dev / prod
if (process.env.NODE_ENV === 'production') {
  // Production static server
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Vite Dev Server middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
