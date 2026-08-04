import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server.');
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

async function generateContentWithRetryAndFallback(aiClient: any, params: any) {
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  let modelIndex = modelsToTry.indexOf(params.model);
  if (modelIndex === -1) modelIndex = 0;
  
  let attempt = 0;
  const maxRetries = 2;
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
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        if (modelIndex < modelsToTry.length - 1) {
          modelIndex++;
          attempt = 0;
        } else {
          throw error;
        }
      }
    }
  }
}

export default async function handler(req: Request, res: Response) {
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
    const { base64Data, mimeType = 'image/png', promptType = 'Midjourney v6.0', customPrompt = '' } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
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
      type: Type.OBJECT,
      properties: {
        htmlCode: { type: Type.STRING },
        frameworkCode: { type: Type.STRING },
        markdownSummary: { type: Type.STRING },
        designAnalysis: {
          type: Type.OBJECT,
          properties: {
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            typography: { type: Type.STRING },
            layout: { type: Type.STRING },
            componentsIdentified: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ['colors', 'typography', 'layout', 'componentsIdentified']
        }
      },
      required: ['htmlCode', 'frameworkCode', 'markdownSummary', 'designAnalysis']
    };

    const ai = getAIClient();
    const imagePart = {
      inlineData: { mimeType: mimeType || 'image/png', data: base64Data }
    };
    
    let promptText = `Analyze this image and reverse engineer an image generation prompt optimized for the engine: ${promptType}.`;
    if (customPrompt && customPrompt.trim()) {
      promptText += `\nAdditional user guidelines/adjustments: "${customPrompt}"`;
    }

    const textPart = { text: promptText };

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
    if (!resultText) throw new Error('No response from Gemini API');
    
    const parsedResult = JSON.parse(resultText);
    res.json(parsedResult);
  } catch (error: any) {
    console.error('Error generating prompt from image:', error);
    res.status(500).json({ error: error.message || 'Failed to convert' });
  }
}
