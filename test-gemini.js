import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("No GEMINI_API_KEY found in .env!");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    }
  }
});

const systemInstruction = `You are an expert AI prompt engineer specializing in reverse-engineering high-quality, professional image generation prompts from reference images.
Generate an optimized prompt tailored for the specified target AI image generator: "midjourney".
Return a JSON response with the following structured format:
{
  "htmlCode": "A beautifully styled HTML element showing the prompt clearly.",
  "frameworkCode": "The primary generated prompt text itself.",
  "markdownSummary": "A highly detailed breakdown of the prompt.",
  "designAnalysis": {
    "colors": ["detected hex codes or prominent colors"],
    "typography": "detected style",
    "layout": "framing composition",
    "componentsIdentified": ["subjects found"]
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

// 1x1 black pixel base64
const tiny_png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

const imagePart = {
  inlineData: { mimeType: 'image/png', data: tiny_png }
};
const textPart = { text: "Analyze this image and reverse engineer an image generation prompt optimized for the engine: midjourney." };

console.log("Calling Gemini API...");
try {
  const response = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: { parts: [imagePart, textPart] },
    config: {
      systemInstruction,
      responseMimeType: 'application/json',
      responseSchema
    }
  });
  console.log("Success!");
  console.log(response.text);
} catch (error) {
  console.error("Gemini API Error:", error);
}
