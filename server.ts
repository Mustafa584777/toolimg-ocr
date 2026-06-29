import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Increase payload limit for base64 images
app.use(express.json({ limit: '50mb' }));

// Allow CORS for local development
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY environment variable is missing.');
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Real OCR Endpoint
app.post('/api/ocr', async (req: express.Request, res: express.Response) => {
  try {
    const { toolId, fileName, mimeType, targetLanguage, base64Data } = req.body;

    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server. Please configure it in Settings > Secrets.' });
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
You are an advanced Financial Receipt & Invoice OCR parser.
Identify the merchant name, transaction date, payment method, tax amount, tip amount, total amount, currency (or symbol), and list of items (each item must have name, qty, price, and total).
Return a JSON response with:
1. extractedText: A neat raw text representation of the receipt contents.
2. markdownSummary: A formatted Markdown summary including merchant details, items list, tax, and a bold Grand Total.
3. structuredData: A structured object containing:
   - merchantName: string (e.g. Starbucks)
   - date: string
   - paymentMethod: string (e.g. Visa Credit, Cash)
   - taxAmount: number
   - tipAmount: number
   - totalAmount: number
   - currency: string (the symbol like $ or currency code like USD)
   - items: array of objects with:
     - name: string
     - qty: number
     - price: string
     - total: string
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
                date: { type: Type.STRING },
                paymentMethod: { type: Type.STRING },
                taxAmount: { type: Type.NUMBER },
                tipAmount: { type: Type.NUMBER },
                totalAmount: { type: Type.NUMBER },
                currency: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      qty: { type: Type.INTEGER },
                      price: { type: Type.STRING },
                      total: { type: Type.STRING }
                    },
                    required: ['name', 'qty', 'price', 'total']
                  }
                }
              },
              required: ['merchantName', 'date', 'paymentMethod', 'taxAmount', 'tipAmount', 'totalAmount', 'currency', 'items']
            }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'business-card':
        systemInstruction = `
You are an AI Business Card Scanner and Reader.
Identify contact information including name, title, company, phone, email, website, and physical address.
Generate a valid RFC-compliant vCard (.vcf) string based on the parsed contact info.
Return a JSON response with:
1. extractedText: A raw text list of all identified contact parameters.
2. markdownSummary: A clean Markdown business card visual representation with links to the email and website.
3. structuredData: A structured object containing:
   - name: string
   - title: string
   - company: string
   - phone: string
   - email: string
   - website: string
   - address: string
   - vcardText: string (valid RFC-compliant vCard string)
        `;
        responseSchema = {
          type: Type.OBJECT,
          properties: {
            extractedText: { type: Type.STRING },
            markdownSummary: { type: Type.STRING },
            structuredData: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                phone: { type: Type.STRING },
                email: { type: Type.STRING },
                website: { type: Type.STRING },
                address: { type: Type.STRING },
                vcardText: { type: Type.STRING }
              },
              required: ['name', 'title', 'company', 'phone', 'email', 'website', 'address', 'vcardText']
            }
          },
          required: ['extractedText', 'markdownSummary', 'structuredData']
        };
        break;

      case 'license-plate':
        systemInstruction = `
You are an Automated License Plate Reader (LPR).
Identify the license plate number, state/country origin, vehicle color, vehicle model, and estimation confidence.
Return a JSON response with:
1. extractedText: A neat raw text description of the car and plate.
2. markdownSummary: A clean Markdown bullet-pointed description of the plate characters, origin, vehicle, and confidence level.
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

      case 'table':
        systemInstruction = `
You are a Table OCR image extractor.
Analyze the tabular data grid in the image.
Extract the columns and rows perfectly.
Return a JSON response with:
1. extractedText: Tab-separated table format.
2. markdownSummary: Beautiful Markdown representation of the table.
3. structuredData: A structured object containing:
   - headers: array of strings containing columns header names
   - rows: array of array of strings containing rows cell data
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
    res.json(parsedResult);
  } catch (error: any) {
    console.error('Error processing OCR request:', error);
    res.status(500).json({ error: error.message || 'Failed to process OCR request' });
  }
});

// Serve frontend in dev / prod
if (process.env.NODE_ENV === 'production') {
  // Production static server
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Vite Dev Server middleware
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  app.use(vite.middlewares);
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running at http://0.0.0.0:${port}`);
});
