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
          const descData = await descResponse.json();
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
      const stylePrompts = {
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

    const data = await response.json();
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

  } catch (error) {
    console.error('Text to Image error:', error);
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
