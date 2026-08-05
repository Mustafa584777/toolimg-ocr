async function callGeminiWithFallback(
  apiKey,
  systemInstruction,
  promptText,
  imagePart,
  responseSchema,
  modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite']
) {
  let lastError = null;
  
  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const model = modelsToTry[modelIndex];
    let attempt = 0;
    const maxRetries = 2;
    const baseDelayMs = 1000;
    
    while (attempt <= maxRetries) {
      try {
        attempt++;
        
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const parts = [];
        if (imagePart) {
          parts.push(imagePart);
        }
        parts.push({ text: promptText });

        const requestBody = {
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
      } catch (error) {
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

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *',
    'Content-Type': 'application/json'
  };

  try {
    const body = await request.json();
    const { base64Data, fileName = 'handwriting.png', mimeType = 'image/png' } = body;

    if (!base64Data) {
      return new Response(JSON.stringify({ error: 'No image data provided' }), { status: 400, headers: corsHeaders });
    }

    const apiKey = env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured on Cloudflare. Please configure it.' }), { status: 500, headers: corsHeaders });
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

  } catch (error) {
    console.error('Hindi Handwriting Recognition error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Serverless Function execution error' }), {
      status: 500,
      headers: corsHeaders
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Guest-ID, Authorization, *'
    }
  });
}
