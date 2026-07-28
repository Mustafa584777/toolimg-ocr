import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Helper function to retry Gemini API calls with exponential backoff and model fallback chain
async function generateContentWithRetryAndFallback(aiClient: any, params: any) {
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let modelIndex = modelsToTry.indexOf(params.model);
  if (modelIndex === -1) {
    modelIndex = 0;
  }
  
  let attempt = 0;
  const maxRetries = 2; // Retry 2 times per model before trying next fallback
  const baseDelayMs = 1000;
  
  while (modelIndex < modelsToTry.length) {
    params.model = modelsToTry[modelIndex];
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
                            error.message.includes('resource') ||
                            error.message.includes('quota')
                          ));
                          
      if (isTransient && attempt <= maxRetries) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1) * (0.8 + Math.random() * 0.4);
        console.log(`Transient error on ${params.model} (Attempt ${attempt}/${maxRetries + 1}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // If we have more models to try in the fallback list, fall back to the next one!
        if (modelIndex < modelsToTry.length - 1) {
          const nextModel = modelsToTry[modelIndex + 1];
          console.warn(`Model ${params.model} failed/exhausted. Falling back to ${nextModel}...`);
          modelIndex++;
          attempt = 0; // Reset attempts for the next model
        } else {
          // No more fallbacks left, throw the original error
          throw error;
        }
      }
    }
  }
}

export default async function handler(req: Request, res: Response) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Guest-ID, Authorization, *');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { base64Data, fileName = 'mockup.png', mimeType = 'image/png', framework = 'html-tailwind', styleTheme = 'match-image', customPrompt = '', interactivity = 'interactive' } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.' });
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

    const ai = getAIClient();
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
      model: 'gemini-3.6-flash',
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
    res.status(200).json(parsedResult);
  } catch (error: any) {
    console.error('Error processing Image-to-Code request:', error);
    res.status(500).json({ error: error.message || 'Failed to convert image to code' });
  }
}
