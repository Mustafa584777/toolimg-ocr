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

  } catch (error) {
    console.error('OCR/Mockup to Code error:', error);
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
