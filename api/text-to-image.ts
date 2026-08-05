import type { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

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
    const { prompt, aspectRatio = '1:1', stylePreset = 'none', negativePrompt = '', base64Image, mimeType } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: 'Prompt text is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
    }

    let finalPrompt = prompt.trim();
    if (base64Image && mimeType) {
      try {
        const ai = getAIClient();
        const imagePart = {
          inlineData: { mimeType: mimeType || 'image/png', data: base64Image }
        };
        const descriptionResponse = await generateContentWithRetryAndFallback(ai, {
          model: 'gemini-3.5-flash',
          contents: {
            parts: [
              imagePart,
              { text: "Describe the visual content, subjects, layout, composition, and style of this reference image in detail. Focus on elements that can be used to recreate a similar image. Respond with a descriptive paragraph." }
            ]
          }
        });
        const referenceDescription = descriptionResponse.text;
        if (referenceDescription) {
          finalPrompt = `Inspired by the style and composition of this reference image description: "${referenceDescription.trim()}", generate: ${finalPrompt}`;
        }
      } catch (err) {
        console.error('Failed to describe reference image, falling back to prompt only:', err);
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

    const ai = getAIClient();
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite-image',
      contents: {
        parts: [
          { text: finalPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: validRatio
        }
      }
    });

    let imageUrl = '';
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
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

    res.json({
      success: true,
      imageUrl,
      prompt: prompt.trim(),
      finalPrompt,
      aspectRatio: validRatio,
      stylePreset
    });
  } catch (error: any) {
    console.error('Error generating image from text:', error);
    res.status(500).json({ error: error.message || 'Failed to generate image from text prompt' });
  }
}
