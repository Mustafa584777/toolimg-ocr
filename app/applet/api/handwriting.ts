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

async function generateContentWithRetryAndFallback(aiClient: any, params: any) {
  let attempt = 0;
  const maxRetries = 3;
  const baseDelayMs = 1500;
  while (true) {
    try {
      attempt++;
      return await aiClient.models.generateContent(params);
    } catch (error: any) {
      console.error(`Gemini API call attempt ${attempt} failed:`, error.message || error);
      if (attempt >= maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, baseDelayMs * Math.pow(2, attempt - 1)));
    }
  }
}

export default async function handler(req: Request, res: Response) {
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
    const { base64Data, mimeType = 'image/png' } = req.body;
    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    const systemInstruction = `You are a highly accurate handwriting recognition AI. Extract all text from the provided image accurately. Preserve formatting, line breaks, and spelling as best as possible. Respond with a JSON object.`;
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
    const textPart = { text: "Transcribe the handwriting in this image into text and put the result in the markdownSummary field. For htmlCode and frameworkCode, return the transcribed text as well." };

    const response = await generateContentWithRetryAndFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.1
      }
    });

    const textResult = response.text();
    if (!textResult) {
      throw new Error('Empty response from Gemini AI');
    }

    const parsed = JSON.parse(textResult);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Handwriting API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to process handwriting OCR' });
  }
}
