import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

let aiClient: GoogleGenAI | null = null;

function getAIClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured on the server. Please configure it in Vercel settings.');
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

export default async function handler(req: Request, res: Response) {
  // CORS support
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
    const { toolId, fileName, mimeType, targetLanguage, base64Data } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Vercel settings.' });
    }

    // Prepare Gemini Prompt based on toolId and targetLanguage
    let systemInstruction = '';
    let responseSchema: any = null;

    switch (toolId) {
      case 'image-to-text':
        systemInstruction = `
You are a high-accuracy document and screenshot OCR text extractor.
Analyze the provided image and extract all text content exactly as it appears.
Maintain standard paragraph breaks, lists, and indentation.
If there are any visible details, transcribe them precisely.
Return a JSON response with:
1. extractedText: The raw text extracted from the image.
2. markdownSummary: A beautiful Markdown formatted representation of the extracted document.
3. structuredData: An empty object {}.
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: { type: Type.OBJECT }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'handwriting':
        systemInstruction = `
You are a handwriting to text transcriber.
Analyze the handwritten text in the image.
Perform handwriting OCR to transcribe cursive, printing, or rough draft scripts into clean text.
Analyze the spatial layout, list bullets, journal items and headings.
Return a JSON response with:
1. extractedText: The transcribed raw text.
2. markdownSummary: A beautiful Markdown formatted summary of the transcribed text, explaining any unclear or cursive sections.
3. structuredData: An empty object {}.
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: { type: Type.OBJECT }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'pdf-to-text':
        systemInstruction = `
You are a scanned document PDF-to-Text page converter.
Analyze the image of the document page.
Filter out headers, footers, page numbers and margin noise.
Recognize math formulas, special punctuation, and titles.
Return a JSON response with:
1. extractedText: The continuous readable raw text.
2. markdownSummary: A beautiful Markdown formatted structure mapping headings (using #, ##), bold sections, and blockquotes logically.
3. structuredData: An empty object {}.
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: { type: Type.OBJECT }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'receipt':
        systemInstruction = `
You are an AI Smart Receipt & Invoice OCR Parser.
Accurately parse all transactional data from the receipt or invoice.
Extract merchant name, date, time, total amount, taxes, payment method, and individual line items with their quantities and prices.
Return a JSON response with:
1. extractedText: A neat formatted summary of the purchase.
2. markdownSummary: A beautiful Markdown representation of the purchase details.
3. structuredData: A JSON object containing:
   - merchantName: string
   - transactionDate: string
   - totalAmount: number
   - paymentMethod: string
   - items: array of objects { name: string, quantity: number, price: number }
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: {
              type: Type.OBJECT,
              properties: {
                merchantName: { type: Type.STRING },
                transactionDate: { type: Type.STRING },
                totalAmount: { type: Type.NUMBER },
                paymentMethod: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantity: { type: Type.NUMBER },
                      price: { type: Type.NUMBER }
                    },
                    required: ['name', 'quantity', 'price']
                  }
                }
              },
              required: ['merchantName', 'transactionDate', 'totalAmount', 'paymentMethod', 'items']
            }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'table':
        systemInstruction = `
You are an AI Table OCR Extractor.
Detect any tabular structures, spreadsheets, grids, or data matrixes in the image.
Extract the table layout and cells precisely.
Return a JSON response with:
1. extractedText: A markdown table representation.
2. markdownSummary: A clean Markdown section with descriptive notes on the data trends or column structures.
3. structuredData: A JSON object containing:
   - headers: array of strings
   - rows: array of arrays (representing cell strings for each row)
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: {
              type: Type.OBJECT,
              properties: {
                headers: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                rows: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                }
              },
              required: ['headers', 'rows']
            }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'translate':
        systemInstruction = `
You are an AI Multilingual OCR Translator.
First, detect the source language and extract the text from the image.
Then, translate the extracted text into the target language: "${targetLanguage}".
Return a JSON response with:
1. extractedText: A raw text block formatted with 'Original [detected language]:\\n...\\n\\nTranslated [${targetLanguage}]:\\n...'
2. markdownSummary: A clean Markdown formatted comparison block showing the original and translated text side-by-side or stacked.
3. structuredData: An empty object {}.
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: { type: Type.OBJECT }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'barcode':
        systemInstruction = `
You are an AI Barcode & QR Code reader.
Read the barcode, QR code, UPC, or EAN standard in the image.
Identify the code standard/type, decoded alphanumeric payload, and check if it is a URL.
Return a JSON response with:
1. extractedText: A raw text block showing the code type and payload.
2. markdownSummary: A neat Markdown summary showing code parameters.
3. structuredData: A structured object containing:
   - codeType: string
   - decodedValue: string
   - isUrl: boolean
   - actionUrl: string (the URL itself, if it is a URL, otherwise empty string)
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: {
              type: Type.OBJECT,
              properties: {
                codeType: { type: Type.STRING },
                decodedValue: { type: Type.STRING },
                isUrl: { type: Type.BOOLEAN },
                actionUrl: { type: Type.STRING }
              },
              required: ['codeType', 'decodedValue', 'isUrl', 'actionUrl']
            }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      default:
        systemInstruction = `
Analyze the provided image and perform Optical Character Recognition (OCR).
Extract text content and format it nicely.
Return a JSON response with extractedText, markdownSummary, and an empty structuredData object.
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: { type: Type.OBJECT }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
    }

    const ai = getAIClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: base64Data
      }
    };

    const textPart = {
      text: `Process this image for OCR task: "${toolId}". Source filename: "${fileName}". Target Language: "${targetLanguage || 'English'}"`
    };

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
    console.error('Error processing OCR request:', error);
    res.status(500).json({ error: error.message || 'Failed to process OCR request' });
  }
}
