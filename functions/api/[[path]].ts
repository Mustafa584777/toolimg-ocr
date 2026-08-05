interface Env {
  GEMINI_API_KEY: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  VITE_FIREBASE_API_KEY?: string;
  FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_FIRESTORE_DATABASE_ID?: string;
  FIREBASE_FIRESTORE_DATABASE_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  FIREBASE_APP_ID?: string;
}

// Helper to verify a Razorpay payment signature using the standard Web Crypto API
async function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${orderId}|${paymentId}`);
  const keyData = encoder.encode(secret);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign('HMAC', key, data);
  const hashArray = Array.from(new Uint8Array(signatureBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex === signature;
}

// Helper function to retry Gemini API calls with exponential backoff and model fallback chain
async function callGeminiWithFallback(
  apiKey: string,
  systemInstruction: string,
  promptText: string,
  imagePart: { inlineData: { mimeType: string; data: string } } | null,
  responseSchema: any,
  modelsToTry: string[] = ['gemini-3.5-flash', 'gemini-3.1-flash-lite']
): Promise<any> {
  let lastError: any = null;
  
  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const model = modelsToTry[modelIndex];
    let attempt = 0;
    const maxRetries = 2;
    const baseDelayMs = 1000;
    
    while (attempt <= maxRetries) {
      try {
        attempt++;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const parts: any[] = [];
        if (imagePart) {
          parts.push(imagePart);
        }
        parts.push({ text: promptText });

        const requestBody: any = {
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema
          }
        };

        if (systemInstruction) {
          requestBody.systemInstruction = {
            parts: [{ text: systemInstruction }]
          };
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini API returned status ${response.status}: ${errText}`);
        }

        const data = await response.json();
        
        // Extract result text
        const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!resultText) {
          throw new Error('Gemini API returned an empty response candidate');
        }
        
        return JSON.parse(resultText);
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini API call (${model}) attempt ${attempt} failed:`, error.message || error);
        
        const isTransient = error.message && (
          error.message.includes('503') || 
          error.message.includes('UNAVAILABLE') || 
          error.message.includes('429') ||
          error.message.includes('demand') ||
          error.message.includes('resource') ||
          error.message.includes('quota')
        );

        if (isTransient && attempt <= maxRetries) {
          const delay = baseDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Fall back to next model if available
          break;
        }
      }
    }
  }
  
  throw lastError || new Error("Failed to call Gemini API after all fallback options.");
}

export async function onRequest(context: {
  request: Request;
  env: Env;
  params: { path: string[] };
}) {
  const { request, env, params } = context;
  const url = new URL(request.url);
  const path = params.path ? params.path.join('/') : '';

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *',
    'Content-Type': 'application/json'
  };

  // Preflight handler
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    // 1. GET /api/config
    if (request.method === 'GET' && path === 'config') {
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

    // 2. POST /api/ocr (Image to Code)
    if (request.method === 'POST' && path === 'ocr') {
      const body = await request.json() as any;
      const { base64Data, fileName = 'mockup.png', mimeType = 'image/png', framework = 'html-tailwind', styleTheme = 'modern-dark', customPrompt = '', interactivity = 'interactive' } = body;

      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400, headers: corsHeaders });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare. Please configure it in your Pages Dashboard Environment Variables.' }), { status: 500, headers: corsHeaders });
      }

      const systemInstruction = `
You are a master frontend engineer specializing in converting user designs, wireframes, screenshots, or hand-drawn sketches into pixel-perfect, highly polished, responsive, and functional frontend code.
Analyze the provided screenshot/mockup image.
Your absolute goal is to reconstruct the EXACT design, typography, spacing, visual layout, colors, elements, and icons of the uploaded image.

CRITICAL DIRECTIVES FOR PIXEL-PERFECT FIDELITY:
1. COLORS: Analyze the exact color palette in the image. Do not use default or generic Tailwind colors if the mockup uses custom brand colors. Extract the exact hex values (backgrounds, cards, text, accents, buttons, borders, shadows) and apply them using arbitrary Tailwind values (e.g., bg-[#121824], text-[#f3f4f6], border-[#3b82f6]/20).
2. TYPOGRAPHY: Identify the typography style (e.g. a sharp sans-serif, elegant serif, monospace, handwriting, or geometric display font). Match the weight, letter-spacing, line-height, and size proportions exactly. Load the closest match from Google Fonts in the HTML file (e.g. Inter, Playfair Display, Plus Jakarta Sans, JetBrains Mono) and set it as the primary font.
3. ICONS: Do not use generic emoji or low-quality placeholders for icons. Analyze the visual shape, stroke-width, size, and color of each icon. Reconstruct them using highly precise, clean custom inline SVGs (or exact Lucide React icon components) that perfectly match the original visual.
4. SIZES, SPACING & ALIGNMENTS: Reconstruct the exact container widths, aspect ratios, margins, padding, rounded corners (border-radius), and box-shadows. Maintain the layout proportions relative to the viewport.
5. CONTENT & ELEMENTS: Translate the exact text labels, numbers, logos, buttons, images, and content from the image. Do not invent extra content, placeholder sidebars, footer links, or unrequested features unless they are visible in the image itself. If the image is a simple card, build ONLY that simple card.
6. TARGET FRAMEWORK:
   - html-tailwind: Generate a single, completely self-contained, valid HTML5 file. This file MUST include Tailwind CSS CDN (<script src="https://cdn.tailwindcss.com"></script>), Google Fonts for typography matches, and FontAwesome/Lucide or clean custom SVGs for icons. Implement realistic interaction only for the elements present in the image (e.g. basic tab switching or button states).
   - react-tailwind: Generate a modern React functional component using Tailwind CSS utility classes and Lucide React or inline custom SVG icons. Ensure complete state management is written using React hooks matching elements shown in the image.
   - vue-tailwind: Generate a single-file Vue 3 component with <template>, <script setup> (using ref, computed, etc.), and Tailwind utility classes.

7. STYLE THEMES (If specified, adapt or apply it cleanly):
   - match-image: Reconstruct and match the exact colors, backgrounds, and themes (whether light or dark, high contrast or low contrast) from the uploaded mockup image.
   - modern-dark: Sleek deep slate/charcoal colors, high-tech dark background, glowing indicators, smooth contrast.
   - clean-light: Minimalist off-white backdrops, charcoal typography, elegant soft shadows, pristine light design.
   - neon-cyberpunk: Dark background, vibrant electric pink, neon purple, and cyan highlights, glowing borders, high contrast.
   - retro-90s: Windows 95/98 nostalgic style, retro grey buttons, thick borders, pixelated feel, serif typography, fun color tabs.
   - minimalist-slate: Monochromatic grays, slate, spacious padding, heavy rely on bold/thin typography contrasts.

Return a JSON response with the following structured format:
{
  "htmlCode": "A completely self-contained HTML file utilizing Tailwind CSS matching the exact visual mockup. This will be loaded into an iframe for instant rendering. It must be valid HTML with standard CSS/JS and no React syntax.",
  "frameworkCode": "The clean source code written exactly in the selected framework format (e.g. JSX React code or Vue SFC code). If 'html-tailwind' is selected, this can be identical to htmlCode or beautifully formatted clean HTML.",
  "markdownSummary": "A high-quality markdown document explaining: 1. Design Overview and color palette identified. 2. Key components implemented and their responsive adaptations. 3. Framework installation instructions.",
  "designAnalysis": {
    "colors": ["list of hex codes or color names found"],
    "typography": "font names and styles identified or mapped",
    "layout": "structural strategy (e.g. sidebar left, main feed, header grid, bento box)",
    "componentsIdentified": ["navbar", "sidebar", "metrics card", "etc."]
  }
}
      `;

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          htmlCode: { type: 'STRING' },
          frameworkCode: { type: 'STRING' },
          markdownSummary: { type: 'STRING' },
          designAnalysis: {
            type: 'OBJECT',
            properties: {
              colors: { type: 'ARRAY', items: { type: 'STRING' } },
              typography: { type: 'STRING' },
              layout: { type: 'STRING' },
              componentsIdentified: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['colors', 'typography', 'layout', 'componentsIdentified']
          }
        },
        required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
      };

      const imagePart = {
        inlineData: { mimeType: mimeType || 'image/png', data: base64Data }
      };

      let promptText = `Convert this mockup screenshot into clean, fully functional, responsive code in framework "${framework || 'html-tailwind'}".`;
      if (styleTheme && styleTheme !== 'match-image') {
        promptText += ` Please theme it specifically in "${styleTheme}" style.`;
      } else {
        promptText += ` Reconstruct it to match the exact visual style and theme of the mockup image.`;
      }
      if (interactivity) {
        promptText += ` Add fully functioning frontend interactivity for elements like: ${interactivity}.`;
      }
      if (customPrompt && customPrompt.trim()) {
        promptText += `\nAdditional Custom Request/Guidelines: "${customPrompt.trim()}"`;
      }

      const result = await callGeminiWithFallback(apiKey, systemInstruction, promptText, imagePart, responseSchema);
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    }

    // 3. POST /api/handwriting (Handwriting to Text)
    if (request.method === 'POST' && path === 'handwriting') {
      const body = await request.json() as any;
      const { base64Data, fileName = 'handwriting.png', mimeType = 'image/png' } = body;

      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400, headers: corsHeaders });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare.' }), { status: 500, headers: corsHeaders });
      }

      const systemInstruction = `You are a highly accurate handwriting recognition AI.
Extract all text from the provided image accurately. Preserve formatting, line breaks, and spelling as best as possible.
Respond with a JSON object.`;

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          htmlCode: { type: 'STRING' },
          frameworkCode: { type: 'STRING' },
          markdownSummary: { type: 'STRING' },
          designAnalysis: {
            type: 'OBJECT',
            properties: {
              colors: { type: 'ARRAY', items: { type: 'STRING' } },
              typography: { type: 'STRING' },
              layout: { type: 'STRING' },
              componentsIdentified: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['colors', 'typography', 'layout', 'componentsIdentified']
          }
        },
        required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
      };

      const imagePart = {
        inlineData: { mimeType: mimeType || 'image/png', data: base64Data }
      };
      
      const promptText = "Transcribe the handwriting in this image into text and put the result in the markdownSummary field. For htmlCode and frameworkCode, you can just return the raw text as well.";

      const result = await callGeminiWithFallback(apiKey, systemInstruction, promptText, imagePart, responseSchema);
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    }

    // 4. POST /api/hindi-handwriting (Hindi Handwriting to Text)
    if (request.method === 'POST' && path === 'hindi-handwriting') {
      const body = await request.json() as any;
      const { base64Data, fileName = 'handwriting.png', mimeType = 'image/png' } = body;

      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400, headers: corsHeaders });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare.' }), { status: 500, headers: corsHeaders });
      }

      const systemInstruction = `You are an expert handwriting recognition AI specializing in Hindi (Devanagari script) and mixed Hindi-English (Hinglish) text.
Your goal is to extract all handwritten text in Hindi/Devanagari from the provided image with the highest possible level of accuracy.
- Accurately transcribe Devanagari characters, matras (vowels), half-letters, conjuncts (sanyuktakshtra), and punctuation.
- If some words are written in English or mixed Hinglish, transcribe them accurately in their respective language/script.
- Strictly preserve formatting, line breaks, paragraphs, list structures, and layout where possible.
- Respond with a JSON object containing the transcribed Hindi text.`;

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          htmlCode: { type: 'STRING' },
          frameworkCode: { type: 'STRING' },
          markdownSummary: { type: 'STRING' },
          designAnalysis: {
            type: 'OBJECT',
            properties: {
              colors: { type: 'ARRAY', items: { type: 'STRING' } },
              typography: { type: 'STRING' },
              layout: { type: 'STRING' },
              componentsIdentified: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['colors', 'typography', 'layout', 'componentsIdentified']
          }
        },
        required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
      };

      const imagePart = {
        inlineData: { mimeType: mimeType || 'image/png', data: base64Data }
      };
      
      const promptText = "Transcribe the Hindi handwriting (Devanagari script) in this image into text and put the final transcribed result in the markdownSummary field. For htmlCode and frameworkCode, you can just return the raw text as well.";

      const result = await callGeminiWithFallback(apiKey, systemInstruction, promptText, imagePart, responseSchema);
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    }

    // 5. POST /api/image-to-prompt (Image to Prompt engineering)
    if (request.method === 'POST' && path === 'image-to-prompt') {
      const body = await request.json() as any;
      const { base64Data, mimeType = 'image/png', promptType = 'Midjourney v6.0', customPrompt = '' } = body;

      if (!base64Data) {
        return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400, headers: corsHeaders });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare.' }), { status: 500, headers: corsHeaders });
      }

      const systemInstruction = `You are an expert AI prompt engineer specializing in reverse-engineering high-quality, professional image generation prompts (optimized for Midjourney, Stable Diffusion, DALL-E 3, and Adobe Firefly) from reference images.
Analyze the provided image in detail, including subject, visual style, camera parameters (if photographic), artistic medium, color palette, lighting condition, framing composition, mood, and atmospheric texture.

Generate an optimized prompt tailored for the specified target AI image generator: "${promptType}".

Return a JSON response with the following structured format:
{
  "htmlCode": "A beautifully styled HTML element showing the prompt clearly.",
  "frameworkCode": "The primary generated prompt text itself.",
  "markdownSummary": "A highly detailed breakdown of the prompt:\n\n1. **Primary Prompt**: (optimized for the selected engine)\n2. **Style Descriptors**: details about medium, lighting, art style\n3. **Subject & Composition**: details about what's in the image and framing\n4. **Parameters & Modifiers**: (such as aspect ratio, negative prompt, or engine-specific flags like --v 6.0, --ar 16:9, highly-detailed)",
  "designAnalysis": {
    "colors": ["detected hex codes or prominent colors"],
    "typography": "detected style (e.g., photograph, digital illustration, 3D render, watercolor, cinematic, vector art)",
    "layout": "framing composition (e.g., extreme close-up, wide angle, eye-level, bokeh background, low angle, macro)",
    "componentsIdentified": ["subjects found", "lighting types", "aesthetic modifiers", "camera settings/artist styles"]
  }
}`;

      const responseSchema = {
        type: 'OBJECT',
        properties: {
          htmlCode: { type: 'STRING' },
          frameworkCode: { type: 'STRING' },
          markdownSummary: { type: 'STRING' },
          designAnalysis: {
            type: 'OBJECT',
            properties: {
              colors: { type: 'ARRAY', items: { type: 'STRING' } },
              typography: { type: 'STRING' },
              layout: { type: 'STRING' },
              componentsIdentified: { type: 'ARRAY', items: { type: 'STRING' } }
            },
            required: ['colors', 'typography', 'layout', 'componentsIdentified']
          }
        },
        required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
      };

      const imagePart = {
        inlineData: { mimeType: mimeType || 'image/png', data: base64Data }
      };
      
      let promptText = `Analyze this image and reverse engineer an image generation prompt optimized for the engine: ${promptType}.`;
      if (customPrompt && customPrompt.trim()) {
        promptText += `\nAdditional user guidelines/adjustments: "${customPrompt.trim()}"`;
      }

      const result = await callGeminiWithFallback(apiKey, systemInstruction, promptText, imagePart, responseSchema);
      return new Response(JSON.stringify(result), { status: 200, headers: corsHeaders });
    }

    // 6. POST /api/text-to-image (Gemini Image Generation)
    if (request.method === 'POST' && path === 'text-to-image') {
      const body = await request.json() as any;
      const { prompt, aspectRatio = '1:1', stylePreset = 'none', negativePrompt = '', base64Image, mimeType } = body;

      if (!prompt || !prompt.trim()) {
        return new Response(JSON.stringify({ error: 'Prompt text is required' }), { status: 400, headers: corsHeaders });
      }

      const apiKey = env.GEMINI_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare.' }), { status: 500, headers: corsHeaders });
      }

      let finalPrompt = prompt.trim();
      if (base64Image && mimeType) {
        try {
          // Describe reference image first
          const describeUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
          const describeBody = {
            contents: [{
              parts: [
                { inlineData: { mimeType: mimeType || 'image/png', data: base64Image } },
                { text: "Describe the visual content, subjects, layout, composition, and style of this reference image in detail. Focus on elements that can be used to recreate a similar image. Respond with a descriptive paragraph." }
              ]
            }]
          };

          const descResponse = await fetch(describeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(describeBody)
          });
          if (descResponse.ok) {
            const descData = await descResponse.json() as any;
            const referenceDescription = descData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (referenceDescription) {
              finalPrompt = `Inspired by the style and composition of this reference image description: "${referenceDescription.trim()}", generate: ${finalPrompt}`;
            }
          }
        } catch (err) {
          console.error('Failed to describe reference image, using original prompt:', err);
        }
      }

      if (stylePreset && stylePreset !== 'none') {
        const stylePrompts: Record<string, string> = {
          'photorealistic': 'Photorealistic, 8k resolution, ultra-detailed, studio lighting, hyper-realistic photography',
          'digital-art': 'Vibrant digital art, detailed illustration, artstation trending, crisp digital painting',
          '3d-render': 'Octane render 3d illustration, smooth textures, volumetric lighting, raytracing, highly detailed',
          'anime': 'Anime style illustration, clean linework, vibrant colors, Studio Ghibli inspired aesthetic',
          'watercolor': 'Soft watercolor painting, delicate brushstrokes, expressive ink washes, artistic paper texture',
          'cyberpunk': 'Cyberpunk aesthetic, glowing neon lights, futuristic city vibes, dark rainy reflective streets',
          'cinematic': 'Cinematic movie screenshot, 35mm lens, dramatic lighting, anamorphic lens flare, shallow depth of field',
          'vector-art': 'Flat vector art illustration, clean geometry, bold outlines, modern graphic design'
        };
        if (stylePrompts[stylePreset]) {
          finalPrompt += `, ${stylePrompts[stylePreset]}`;
        }
      }

      if (negativePrompt && negativePrompt.trim()) {
        finalPrompt += `. Avoid: ${negativePrompt.trim()}`;
      }

      const validAspectRatios = ['1:1', '3:4', '4:3', '9:16', '16:9'];
      const validRatio = validAspectRatios.includes(aspectRatio) ? aspectRatio : '1:1';

      // Send image generation request
      const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-image:generateContent?key=${apiKey}`;
      const genBody = {
        contents: [{
          parts: [{ text: finalPrompt }]
        }],
        config: {
          imageConfig: {
            aspectRatio: validRatio
          }
        }
      };

      const response = await fetch(genUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genBody)
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Image API returned status ${response.status}: ${errText}`);
      }

      const data = await response.json() as any;
      let imageUrl = '';
      const parts = data?.candidates?.[0]?.content?.parts;
      if (parts && Array.isArray(parts)) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            imageUrl = `data:${mime};base64,${part.inlineData.data}`;
            break;
          }
        }
      }

      if (!imageUrl) {
        throw new Error('Image generation completed but no image data was returned by Gemini API.');
      }

      return new Response(JSON.stringify({
        success: true,
        imageUrl,
        prompt: prompt.trim(),
        finalPrompt,
        aspectRatio: validRatio,
        stylePreset
      }), { status: 200, headers: corsHeaders });
    }

    // 7. POST /api/create-order or /api/razorpay/order (Razorpay Order Creation)
    if (request.method === 'POST' && (path === 'create-order' || path === 'razorpay/order')) {
      const body = await request.json() as any;
      const { amount, currency = 'INR', receipt } = body;

      if (!amount) {
        return new Response(JSON.stringify({ error: 'Amount is required' }), { status: 400, headers: corsHeaders });
      }

      let amountInPaise = Number(amount);
      
      // Convert INR to Paise if called by old frontend endpoint /api/razorpay/order
      if (path === 'razorpay/order' && amountInPaise < 100) {
        amountInPaise = Math.round(amountInPaise * 100);
      }

      if (amountInPaise < 100) {
        return new Response(JSON.stringify({ error: 'Minimum amount must be at least 100 paise (₹1)' }), { status: 400, headers: corsHeaders });
      }

      const keyId = env.RAZORPAY_KEY_ID;
      const keySecret = env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        return new Response(JSON.stringify({ error: 'Razorpay keys are missing. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.' }), { status: 500, headers: corsHeaders });
      }

      const auth = btoa(`${keyId}:${keySecret}`);
      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: currency,
          receipt: receipt || 'rcpt_' + Math.random().toString(36).substring(2, 15)
        })
      });

      if (!rzpResponse.ok) {
        const errText = await rzpResponse.text();
        return new Response(JSON.stringify({ error: `Razorpay API Error: ${errText}` }), { status: rzpResponse.status, headers: corsHeaders });
      }

      const order = await rzpResponse.json() as any;
      return new Response(JSON.stringify({
        orderId: order.id,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: keyId
      }), { status: 200, headers: corsHeaders });
    }

    // 8. POST /api/verify-payment or /api/razorpay/verify (Razorpay Signature Verification)
    if (request.method === 'POST' && (path === 'verify-payment' || path === 'razorpay/verify')) {
      const body = await request.json() as any;
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return new Response(JSON.stringify({ error: 'Missing payment details for verification' }), { status: 400, headers: corsHeaders });
      }

      const secret = env.RAZORPAY_KEY_SECRET;
      if (!secret) {
        return new Response(JSON.stringify({ error: 'Razorpay secret key is not configured.' }), { status: 500, headers: corsHeaders });
      }

      const verified = await verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, secret);
      if (verified) {
        return new Response(JSON.stringify({ success: true, message: 'Payment verified successfully' }), { status: 200, headers: corsHeaders });
      } else {
        return new Response(JSON.stringify({ error: 'Invalid payment signature. Verification failed.' }), { status: 400, headers: corsHeaders });
      }
    }

    // Fallback if route matches `/api/*` but path not matched
    return new Response(JSON.stringify({ error: `Not Found: Path /api/${path} is not supported` }), { status: 404, headers: corsHeaders });

  } catch (error: any) {
    console.error('Cloudflare Worker Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Serverless Function execution error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}
