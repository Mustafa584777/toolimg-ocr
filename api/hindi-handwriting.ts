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
    const { base64Data, fileName = 'handwriting.png', mimeType = 'image/png' } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemInstruction = `You are an expert handwriting recognition AI specializing in Hindi (Devanagari script) and mixed Hindi-English (Hinglish) text.
Your goal is to extract all handwritten text in Hindi/Devanagari from the provided image with the highest possible level of accuracy.
- Accurately transcribe Devanagari characters, matras (vowels), half-letters, conjuncts (sanyuktakshtra), and punctuation.
- If some words are written in English or mixed Hinglish, transcribe them accurately in their respective language/script.
- Strictly preserve formatting, line breaks, paragraphs, list structures, and layout where possible.
- Respond with a JSON object containing the transcribed Hindi text.`;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        htmlCode: { type: Type.STRING }, // Reusing the same response schema to match frontend parsing
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
    
    const textPart = { text: "Transcribe the Hindi handwriting (Devanagari script) in this image into text and put the final transcribed result in the markdownSummary field. For htmlCode and frameworkCode, you can just return the raw text as well." };

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
    res.status(200).json(parsedResult);
  } catch (error: any) {
    console.error('Error converting Hindi handwriting to text:', error);
    res.status(500).json({ error: error.message || 'Failed to convert' });
  }
}
