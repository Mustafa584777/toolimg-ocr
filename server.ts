import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with generous limits for base64 image uploads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Server-side OCR Processing route using @google/genai SDK
app.post("/api/ocr/process", async (req, res): Promise<any> => {
  try {
    const { toolId, base64, mimeType, extraParams } = req.body;

    if (!base64 || !mimeType) {
      return res.status(400).json({ error: "Missing required image data (base64 and mimeType)" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured in the server environment. Please set it up in Settings > Secrets." 
      });
    }

    // Initialize the GoogleGenAI client with standard configuration
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // Tailor instructions based on the specific tool requested
    let promptInstruction = "";
    
    switch (toolId) {
      case "image-to-text":
        promptInstruction = `
          Perform high-accuracy optical character recognition (OCR) on the uploaded image.
          Extract all readable text. Maintain paragraphs, formatting, and layout as closely as possible.
          In your markdownSummary, present the extracted text clearly with neat formatting.
          In structuredData, provide:
          {
            "wordCount": <integer count of extracted words>,
            "lineCount": <integer count of lines>,
            "hasTables": <boolean if tabular data exists>,
            "confidence": "high" | "medium" | "low"
          }
        `;
        break;
      case "handwriting":
        promptInstruction = `
          Analyze the uploaded image which contains handwritten text. 
          Transcribe the handwriting as accurately as possible. 
          Correct obvious structural typos but stay faithful to the exact written message.
          In markdownSummary, present the transcription nicely with readable styling.
          In structuredData, provide:
          {
            "originalHandwritingStyle": "cursive" | "print" | "mixed" | "sketchy",
            "transcriptionConfidence": "high" | "medium" | "low",
            "unreadableSegmentsCount": <integer>
          }
        `;
        break;
      case "pdf-to-text":
        promptInstruction = `
          Analyze this scanned document page (representing a PDF-to-text OCR operation).
          Perform layout-preserving text extraction. Identify headers, footers, list items, and sections.
          In markdownSummary, output a beautifully formatted and structured document using markdown headings (# , ##), lists (*, -), blockquotes, etc.
          In structuredData, provide:
          {
            "documentTitle": "Estimated document title",
            "sections": ["Section 1 Title", "Section 2 Title"],
            "language": "ISO 2-letter language code",
            "pageNumber": <estimated page number or 1>
          }
        `;
        break;
      case "receipt":
        promptInstruction = `
          Perform Invoice and Receipt OCR. Extract critical business values and transaction details.
          Extract merchant name, date, time, total, tax, tip, payment method, address, and item list.
          In markdownSummary, create a sleek invoice card detailing:
          - Merchant information
          - A clean table listing items (Qty, Name, Price, Total)
          - Transaction summary (Tax, Tip, Total)
          In structuredData, provide:
          {
            "merchantName": "Name of the store",
            "date": "YYYY-MM-DD format, or empty if not found",
            "totalAmount": <number representation of total payment>,
            "currency": "USD" | "EUR" | "INR" | "GBP" etc.,
            "items": [
              { "name": "Item name", "qty": <number>, "price": <number>, "total": <number> }
            ],
            "taxAmount": <number>,
            "tipAmount": <number>,
            "paymentMethod": "Cash" | "Credit Card" | "Debit Card" | "Mobile Pay" | "Unknown"
          }
        `;
        break;
      case "business-card":
        promptInstruction = `
          Perform Business Card OCR. Extract contact information.
          Identify Name, Job Title, Company Name, Phone Number, Email, Website, Address, and Social Media handles.
          Also generate a standard downloadable vCard text (.vcf format).
          In markdownSummary, create a beautiful digital business profile card.
          In structuredData, provide:
          {
            "name": "Full name",
            "title": "Job title",
            "company": "Company name",
            "phone": "Phone number",
            "email": "Email address",
            "website": "Website URL",
            "address": "Full physical address",
            "vcardText": "BEGIN:VCARD\\nVERSION:3.0\\nFN:Full Name\\nORG:Company\\nTITLE:Job Title\\nTEL:Phone\\nEMAIL:Email\\nURL:Website\\nADR:Address\\nEND:VCARD"
          }
        `;
        break;
      case "license-plate":
        promptInstruction = `
          Perform License Plate Recognition (LPR).
          Extract the alphanumeric characters of any license plate visible.
          Identify the country/state/region of the license plate, as well as vehicle make, model, or color if visible.
          In markdownSummary, present the plate cleanly in a stylized frame and list the vehicle details.
          In structuredData, provide:
          {
            "plateNumber": "Extracted plate number (caps)",
            "stateOrRegion": "Estimated State/Province/Country",
            "vehicleColor": "Color or unknown",
            "vehicleModel": "Estimated make/model, or unknown",
            "confidence": "high" | "medium" | "low"
          }
        `;
        break;
      case "table":
        promptInstruction = `
          Analyze the uploaded image containing a table, sheet, or grid.
          Perform structural table extraction.
          Extract column headers and all corresponding row cells as cleanly as possible.
          In markdownSummary, construct a responsive Markdown table representing the data.
          In structuredData, provide:
          {
            "headers": ["Header 1", "Header 2", ...],
            "rows": [
              ["Cell 1", "Cell 2", ...],
              ["Cell 1", "Cell 2", ...]
            ]
          }
        `;
        break;
      case "translate":
        const targetLang = extraParams?.targetLanguage || "Spanish";
        promptInstruction = `
          Perform OCR Translation.
          Step 1: Extract all readable text in the original language of the image.
          Step 2: Detect the source language.
          Step 3: Translate the extracted text accurately into ${targetLang}.
          In markdownSummary, display a split layout with "Original Text" and "Translated Text (${targetLang})", formatted beautifully.
          In structuredData, provide:
          {
            "detectedSourceLanguage": "Full name of source language",
            "originalText": "Full extracted original text",
            "translatedText": "Full translated text in ${targetLang}"
          }
        `;
        break;
      case "barcode":
        promptInstruction = `
          Detect and decode any QR Codes or Barcodes in the image.
          Scan and read the alphanumeric payload.
          Identify the symbology type (e.g. QR Code, UPC-A, EAN-13, Code 39, Code 128, etc.).
          Determine if the payload is a URL, product ID, plain text, or email, and generate a dynamic action URL if appropriate.
          In markdownSummary, show the barcode value, the type, and an actionable link if it is a website.
          In structuredData, provide:
          {
            "codeType": "QR Code" | "UPC-A" | "EAN-13" | "Code 128" | "Unknown",
            "decodedValue": "Decoded alphanumeric value",
            "isUrl": <boolean>,
            "actionUrl": "Direct HTTP URL if value is a link, or a search link like Google search for product ID"
          }
        `;
        break;
      default:
        promptInstruction = `
          Analyze the image and perform standard OCR text extraction.
          Provide extractedText, markdownSummary, and structuredData in JSON.
        `;
    }

    const systemPrompt = `
      You are a specialized AI Optical Character Recognition (OCR) engine for ToolIMG.
      Your goal is to parse images and extract texts, codes, tabular data, and key-value pairs with absolute precision.
      You must always return your output strictly in JSON format matching the schema requested below.
      Never include any conversational preambles or postscripts in your output. Return ONLY the raw JSON string.
    `;

    // Package the image for Gemini API inlineData part
    const imagePart = {
      inlineData: {
        mimeType,
        data: base64,
      },
    };

    const textPart = {
      text: `
        Analyze the image and apply the following OCR instructions:
        ${promptInstruction}
        
        Ensure you return your response in the exact JSON format specified below.
      `,
    };

    // Ask Gemini for content generation with Structured JSON Schema output
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            extractedText: {
              type: Type.STRING,
              description: "All raw extracted text from the image, formatted with spaces and newlines.",
            },
            markdownSummary: {
              type: Type.STRING,
              description: "A beautifully styled, professional markdown representation of the data suited for visual render on the web.",
            },
            structuredData: {
              type: Type.OBJECT,
              description: "A tool-specific JSON object as instructed by the prompts.",
            },
          },
          required: ["extractedText", "markdownSummary", "structuredData"],
        },
      },
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("No response received from the Gemini API model.");
    }

    // Parse the returned JSON from Gemini
    const resultJson = JSON.parse(responseText.trim());
    return res.json(resultJson);

  } catch (error: any) {
    console.error("Error processing server OCR:", error);
    return res.status(500).json({ 
      error: error.message || "An error occurred while processing the image on the server." 
    });
  }
});

// Configure Vite integration or static file serving depending on NODE_ENV
async function initializeViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite development middleware");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ToolIMG custom backend is actively listening on port ${PORT}`);
  });
}

initializeViteOrStatic();
