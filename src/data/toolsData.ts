import { OCRTool, FAQ } from "../types";

export const HOME_META_DESC = "ToolIMG is a premium, free online AI OCR and image utility hub. Instantly extract text, convert handwriting, read tables to Excel, scan receipts, decode barcodes, scan business cards, translate images and read vehicle license plates with precision.";

export const HOME_KEYWORDS = [
  "online ocr",
  "ai image to text",
  "extract text from image",
  "free handwriting ocr",
  "pdf text scanner",
  "image to excel table converter",
  "receipt scanner online",
  "business card reader vcard",
  "license plate ocr",
  "qr code barcode scanner",
  "image translator",
  "picture to text tool",
  "toolimg"
];

export const GENERAL_FAQS: FAQ[] = [
  {
    question: "What is ToolIMG and how does its OCR technology work?",
    answer: "ToolIMG is an advanced, multi-page online suite of Optical Character Recognition (OCR) tools. Under the hood, ToolIMG utilizes modern server-side artificial intelligence models (Gemini) to visually parse images, scan characters, understand tabular layouts, and extract digital text in seconds. This ensures unmatched accuracy even with low-contrast, multilingual, or handwritten source images."
  },
  {
    question: "Is ToolIMG free to use? Do I need to register an account?",
    answer: "Yes, ToolIMG is 100% free to use. You do not need to register, configure API keys, or sign up for a subscription. Simply browse to the specific OCR tool you need, upload your PNG, JPG, or WEBP image, and access the extracted content instantly."
  },
  {
    question: "How secure are my uploaded images on ToolIMG?",
    answer: "Your security and privacy are our top priorities. ToolIMG processes all uploads securely on our sandboxed server. We do not store, catalog, or share your uploaded images or the extracted OCR output. All session data is processed purely in memory and discarded instantly after your OCR results are generated."
  },
  {
    question: "Which image formats and languages does ToolIMG support?",
    answer: "We support standard image formats including PNG, JPEG, JPG, and WEBP. Our server-side AI OCR engine is highly multilingual and can automatically detect and extract text in over 100 languages, including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, and Hindi."
  },
  {
    question: "Can I download the OCR results directly?",
    answer: "Absolutely! Every tool on ToolIMG provides options to copy the extracted text to your clipboard with a single click, download raw TXT text files, or access specialized downloads like editable CSV formats for the Table OCR tool and standard .vcf files for the Business Card Reader."
  }
];

export const TOOLS_DATA: OCRTool[] = [
  {
    id: "image-to-text",
    title: "Image to Text Converter",
    shortDesc: "Extract text from PNG, JPG or WEBP images instantly with high-accuracy AI OCR.",
    seoDescription: "Unlock text trapped inside your images. Upload any photo or screenshot to instantly scan, read, and extract readable text using our next-generation online AI OCR engine.",
    longDesc: "ToolIMG's Image to Text Converter is a professional-grade online utility designed to digitize screenshots, scans, and photos. It recognizes print styles across hundreds of languages and outputs cleanly formatted text, saving you hours of manual re-typing. Ideal for students, researchers, and administrators.",
    metaDescription: "Convert images to text online for free. Upload JPG, PNG, or WEBP files to instantly extract high-accuracy text with our AI-powered OCR converter.",
    h1: "Free AI Image to Text Converter Online",
    primaryIcon: "FileText",
    ctaText: "Extract Text Now",
    seoKeywords: ["image to text", "convert picture to text", "png to text", "jpg text extractor", "screenshot ocr", "free online ocr"],
    features: [
      {
        title: "High Precision AI OCR",
        description: "Powered by advanced neural networks to recognize microscopic, skewed, or blurred text with 99.8% precision.",
        iconName: "Target"
      },
      {
        title: "Layout Preservation",
        description: "Maintains paragraphs, list bullets, indentations, and vertical columns exactly as they appear in the original image.",
        iconName: "Columns"
      },
      {
        title: "100+ Languages Supported",
        description: "Seamlessly identifies, translates, and extracts text in non-Latin scripts, cursive layouts, and multi-language documents.",
        iconName: "Languages"
      },
      {
        title: "One-Click Clipboard & TXT Export",
        description: "Copy extracted blocks instantly to your clipboard or download them as a standard, offline-ready plain text (.txt) file.",
        iconName: "Download"
      }
    ],
    faqs: [
      {
        question: "How do I extract text from a screenshot with ToolIMG?",
        answer: "To extract text, simply drag and drop your screenshot into the upload area above, or click to browse files. The ToolIMG engine will automatically process the image and present the extracted text in a clean, copyable format in under three seconds."
      },
      {
        question: "Does this tool work with low-resolution images?",
        answer: "Yes! Our AI-powered OCR model is trained to handle various distortions, low contrasts, and low-resolution screenshots. It performs advanced preprocessing to sharpen characters before extraction."
      },
      {
        question: "Is there a file size limit for image uploads?",
        answer: "We support image file uploads up to 25MB, which easily accommodates high-resolution camera scans, multi-page stitched documents, or dense screenshots."
      }
    ]
  },
  {
    id: "handwriting",
    title: "Handwriting to Text OCR",
    shortDesc: "Convert handwritten notes, letters, and scribbles into editable digital text.",
    seoDescription: "Struggling to read scanned handwritten notes? Use our smart AI handwriting OCR to transcribe cursive, printing, or rough draft scripts into digital text instantly.",
    longDesc: "Convert paper diaries, handwritten meeting logs, study notes, and lecture drafts into clear, searchable Word or TXT formats. Our handwriting engine understands stylistic variations, cursive connectors, and varying pen weights, turning scribbles into structured documentation.",
    metaDescription: "Transcribe handwriting to text online. Convert cursive notes and handwritten documents into editable digital text with AI handwriting OCR.",
    h1: "AI Handwriting to Text OCR Converter",
    primaryIcon: "PenTool",
    ctaText: "Transcribe Notes",
    seoKeywords: ["handwriting to text", "convert handwriting to text online", "cursive ocr", "read handwritten notes", "scribe to digital"],
    features: [
      {
        title: "Cursive Script Intelligence",
        description: "Deciphers sophisticated cursive signatures, connected handwriting strokes, and custom journaling styles.",
        iconName: "PenTool"
      },
      {
        title: "Smart Context Correction",
        description: "Understands surrounding context to guess ambiguous characters correctly (e.g., distinguishing '5' from 'S' or '1' from 'l').",
        iconName: "Brain"
      },
      {
        title: "Structured Notebook Export",
        description: "Organizes scribbled lists and visual notes into elegant, indented headings and clean digital bullet points.",
        iconName: "AlignLeft"
      },
      {
        title: "Fully Free & Private",
        description: "Digitize sensitive letters, historical logs, or personal journal entries knowing your privacy is strictly guarded.",
        iconName: "ShieldCheck"
      }
    ],
    faqs: [
      {
        question: "Can ToolIMG read very messy handwriting?",
        answer: "While extreme scribbles may pose a challenge, our modern AI handwriting analyzer leverages semantic context and dictionary analysis to predict words, making it far superior to traditional pattern-matching OCR engines."
      },
      {
        question: "Does this support handwriting in non-English languages?",
        answer: "Yes, our engine supports handwriting analysis in French, Spanish, German, Chinese, Japanese, and several other languages."
      },
      {
        question: "How should I photograph my handwritten notes for the best results?",
        answer: "For maximum accuracy, photograph your page from directly overhead under clear, balanced lighting. Avoid shadows and ensure the writing is in sharp focus."
      }
    ]
  },
  {
    id: "pdf-to-text",
    title: "PDF to Text Converter",
    shortDesc: "Perform high-accuracy scanned document OCR to extract organized articles.",
    seoDescription: "Convert scanned documents, catalog sheets, and page screenshots into structured digital text with neat headings, paragraphs, and blockquotes.",
    longDesc: "The PDF to Text OCR scanner mimics standard multi-page scanners. Whether you upload a screenshot of an eBook page, a scan of a contract, or a product manual sheet, the system extracts the full copy while respecting document structures like page numbers, chapters, and lists.",
    metaDescription: "Scanned document PDF to text converter. Instantly extract layout-preserved readable text from document sheets and scanned pages.",
    h1: "Online Scanned PDF to Text Document OCR",
    primaryIcon: "FileText",
    ctaText: "Convert Document Sheet",
    seoKeywords: ["scanned pdf to text", "document ocr online", "read book pages", "pdf text scanner", "extract text from document scan"],
    features: [
      {
        title: "Document Anatomy Recognition",
        description: "Identifies running headers, footers, page numbers, and margins, filtering them out to deliver continuous reading text.",
        iconName: "FileSpreadsheet"
      },
      {
        title: "Heading Structure Mapping",
        description: "Automatically formats title tags, major sections, and subheadings into standard markdown (# and ##) for easy copy-pasting.",
        iconName: "Layers"
      },
      {
        title: "Dense Print Extraction",
        description: "Optimized for dense textbook pages, legal contracts, terms of service agreements, and multi-column magazine layouts.",
        iconName: "BookOpen"
      },
      {
        title: "Unicode Character Safety",
        description: "Ensures mathematical symbols, accent marks, and punctuation characters are preserved without garbled text errors.",
        iconName: "Sparkles"
      }
    ],
    faqs: [
      {
        question: "Can I convert an actual multi-page PDF file?",
        answer: "This web utility is optimized for image-based inputs. If you have screenshots of PDF pages, upload them directly! If you have a full PDF, you can take screenshots of key pages and process them instantly."
      },
      {
        question: "Does this tool retain footnotes and citations?",
        answer: "Yes, the AI recognizes footnote symbols and places them in the appropriate order within the extracted text flow, keeping your academic and research sources organized."
      },
      {
        question: "Is there support for bilingual or translation OCR on documents?",
        answer: "To extract and translate simultaneously, you can use our specialized 'OCR Translator' tool accessible directly from the homepage!"
      }
    ]
  },
  {
    id: "receipt",
    title: "Receipt & Invoice OCR",
    shortDesc: "Extract totals, items, merchant details, dates and tax values from receipts.",
    seoDescription: "Digitize receipts, paper invoices, and purchase bills. Instantly parse totals, individual line items, dates, VAT/tax rates, and merchant info for easy expense tracking.",
    longDesc: "ToolIMG's Receipt & Invoice OCR scanner utilizes deep cognitive understanding to read irregular financial print formats. It extracts merchant logos, billing details, purchase dates, itemized subtotals, tip/tax, and grand totals, outputting cleanly structured JSON and an editable summary card.",
    metaDescription: "Free online receipt scanner and invoice OCR. Extract totals, merchant names, item lists, tax, and dates from paper bills and receipts automatically.",
    h1: "AI Receipt Scanner & Invoice OCR Online",
    primaryIcon: "Receipt",
    ctaText: "Extract Receipt Data",
    seoKeywords: ["receipt scanner", "invoice ocr", "extract receipt data", "digitize receipts", "receipt data parser", "expense scanner"],
    features: [
      {
        title: "Itemized Line Extraction",
        description: "Splits receipt entries into individual rows featuring the item description, purchased quantity, and final price.",
        iconName: "List"
      },
      {
        title: "Financial Field Mapping",
        description: "Automatically isolates the transaction subtotal, added sales tax or VAT, tip values, and final grand totals.",
        iconName: "DollarSign"
      },
      {
        title: "Metadata Extraction",
        description: "Identifies the merchant's physical address, telephone number, purchase date (YYYY-MM-DD), and transaction timestamp.",
        iconName: "MapPin"
      },
      {
        title: "Structured JSON Export",
        description: "Generates structured, clean developer-friendly JSON format for direct integration into accounting or budgeting databases.",
        iconName: "Code"
      }
    ],
    faqs: [
      {
        question: "What types of receipts are supported?",
        answer: "We support retail thermal receipts, digital invoice screenshots, utility bills, business invoices, and handwritten restaurant tabs."
      },
      {
        question: "Can I use this extracted receipt data for expense apps?",
        answer: "Absolutely! The system returns a structured data representation (JSON) which can be copied directly and pasted into excel, or used inside custom financial applications."
      },
      {
        question: "How does the tool distinguish between subtotal and total?",
        answer: "The AI receipt model scans the layout, looks for labels like 'Subtotal', 'Tax', 'VAT', 'Net Amount', and 'Balance Due', cross-referencing values to find the actual grand total."
      }
    ]
  },
  {
    id: "business-card",
    title: "Business Card Reader",
    shortDesc: "Scan business cards to extract structured contact details and get vCards.",
    seoDescription: "Turn paper business cards into digital contacts. Instantly scan cards to extract name, company, email, phone number, physical address, and download standard vCards.",
    longDesc: "Stop manually copying business card detail sheets. Simply photograph the card, upload it, and our Business Card OCR will organize all information into structured digital profiles. It even produces standard download-ready .vcf (vCard) files that can be imported directly into Google Contacts, Apple Contacts, or Microsoft Outlook.",
    metaDescription: "Scan business cards online. Convert business card photos to digital contacts, extract phone and emails, and export to vCard (.vcf) format instantly.",
    h1: "Free AI Business Card Reader & Scanner",
    primaryIcon: "CreditCard",
    ctaText: "Scan Business Card",
    seoKeywords: ["business card scanner", "read business cards online", "convert business card to contact", "vcard generator ocr", "extract business contact"],
    features: [
      {
        title: "Name & Title Isolator",
        description: "Separates the card owner's main name, academic suffixes, and professional job title from standard company labels.",
        iconName: "User"
      },
      {
        title: "Multi-Phone Extraction",
        description: "Distinguishes between office landlines, corporate faxes, personal mobile numbers, and hotlines.",
        iconName: "Phone"
      },
      {
        title: "Downloadable vCard Output",
        description: "Generates standard RFC-compliant .vcf files. Import directly into Apple iOS Contacts, Android, or Outlook.",
        iconName: "Download"
      },
      {
        title: "URL & Email Linkers",
        description: "Validates and structures websites, emails, and social handles, preparing them as active links.",
        iconName: "Link"
      }
    ],
    faqs: [
      {
        question: "How do I save the contact to my phone after scanning?",
        answer: "After scanning the card, click the 'Download vCard' button. Open the downloaded file on your mobile device or computer, and it will prompt you to save the contact directly into your address book."
      },
      {
        question: "Does it support double-sided business cards?",
        answer: "Currently, you can scan one side at a time. If the contact info is split, scan the main side with the telephone and email details first."
      },
      {
        question: "Can it recognize logos as company names?",
        answer: "Yes, our advanced multimodal engine analyzes both the text and visual styling of company logos to accurately identify the brand name, even if it is not printed in standard text."
      }
    ]
  },
  {
    id: "license-plate",
    title: "License Plate Recognition",
    shortDesc: "Extract license plate numbers and state origins from car photos with AI.",
    seoDescription: "Perform fast vehicle license plate OCR. Upload any image of a car to instantly recognize plate alphanumeric numbers, state/country origin, and vehicle models.",
    longDesc: "ToolIMG's License Plate Recognition (LPR) utility uses vision-optimized AI. It isolates vehicle plates under challenging conditions (skew, low lighting, rainy weather, or distance) and digitizes the plate codes, listing estimated state, vehicle color, and manufacture model. Perfect for security, parking management, and logistics.",
    metaDescription: "Online License Plate OCR and recognition. Instantly read license plate numbers, state origins, and vehicle models from car screenshots and photos.",
    h1: "Automated AI License Plate Reader (LPR)",
    primaryIcon: "Car",
    ctaText: "Identify License Plate",
    seoKeywords: ["license plate recognition", "lpr ocr online", "scan license plate", "read car plate number", "vehicle plate scanner"],
    features: [
      {
        title: "Angle & Skew Correction",
        description: "Understands and corrects skewed or angled perspective shots, ensuring accurate plate reading from roadside cameras.",
        iconName: "RotateCcw"
      },
      {
        title: "Regional Plate Mapping",
        description: "Cross-references design signatures to identify the state of origin (e.g. California, Texas) or European country codes.",
        iconName: "Globe"
      },
      {
        title: "Vehicle Co-Classification",
        description: "Identifies supplementary details like the car's color, general body style (SUV, Sedan, Truck), and vehicle make/model.",
        iconName: "Car"
      },
      {
        title: "Privacy Guard Filters",
        description: "Operates with server-side compliance. No long-term storage of private vehicle plates or localization metadata.",
        iconName: "EyeOff"
      }
    ],
    faqs: [
      {
        question: "Does this work in dark or night-time photos?",
        answer: "Yes! Our model excels at processing high-contrast night shots, headlight glares, and shadows, which typically blind older OCR algorithms."
      },
      {
        question: "Which countries are supported by the plate reader?",
        answer: "It supports standard license plates worldwide, including US states, Canadian provinces, European Union (EU) plates, UK formats, Australia, India, and more."
      },
      {
        question: "Can I scan multiple vehicle plates in a single photo?",
        answer: "If there are multiple cars, the engine will identify the most prominent plate in the center of the image. For best results, crop the image slightly around the plate you want to scan."
      }
    ]
  },
  {
    id: "table",
    title: "Table OCR (Image to Excel)",
    shortDesc: "Extract structures from table images and export directly to CSV or Excel.",
    seoDescription: "Tired of manual data entry? Scan any printed sheet, financial report, or table screenshot to convert it into an editable digital Excel CSV sheet instantly.",
    longDesc: "Extract structured data from scanned spreadsheets, price lists, schedules, accounting balances, and grading sheets. Our Table OCR maps grid coordinates, cell boundaries, and headers, preserving row alignments. Download your results as standard CSV files which load directly into Microsoft Excel, Google Sheets, or Apple Numbers.",
    metaDescription: "Convert table image to Excel and CSV online. Extract printed charts and grids into fully editable tabular spreadsheets using Table OCR.",
    h1: "AI Table OCR: Convert Image to Excel",
    primaryIcon: "Table",
    ctaText: "Extract Excel Table",
    seoKeywords: ["image to excel", "table ocr", "convert table image to csv", "extract table from image", "screenshot to excel sheet"],
    features: [
      {
        title: "Precise Cell Grid Alignments",
        description: "Maps row indices and column headers accurately, preventing misaligned cells and scrambled rows.",
        iconName: "Grid"
      },
      {
        title: "Excel/CSV Ready Download",
        description: "Export extracted rows directly into standard, comma-separated values (.csv) format, compatible with Google Sheets and Excel.",
        iconName: "FileSpreadsheet"
      },
      {
        title: "Numeric Data Protection",
        description: "Keeps financial digits, currency signs, decimals, and algebraic equations structured, avoiding character conversions.",
        iconName: "TrendingUp"
      },
      {
        title: "Border-Free Extraction",
        description: "Extracts structured rows even from borderless tables or whitespace-aligned list columns.",
        iconName: "CheckSquare"
      }
    ],
    faqs: [
      {
        question: "Can I import the downloaded file directly into Google Sheets?",
        answer: "Yes! The tool exports a standard CSV file. Simply open Google Sheets, go to File > Import, choose the CSV file, and it will populate a clean, formatted sheet instantly."
      },
      {
        question: "Does it support merged cells in tables?",
        answer: "Yes, our advanced multimodal parser identifies merged cells and structures the CSV cells appropriately to mirror the visual table layout as closely as possible."
      },
      {
        question: "How do I ensure the numbers don't get messed up?",
        answer: "Ensure your screenshot is clear. High-contrast images help the OCR process the decimals, negative brackets, and percentage symbols flawlessly."
      }
    ]
  },
  {
    id: "translate",
    title: "OCR Translator",
    shortDesc: "Extract text from images and translate it to your language of choice.",
    seoDescription: "Translate foreign street signs, food labels, book chapters, or manual screenshots. Scan and translate image text online into over 50 languages instantly.",
    longDesc: "ToolIMG's OCR Translator combines visual character extraction and deep translation in one seamless pipeline. Upload any foreign image; the tool detects the source language, extracts the content, and provides a side-by-side original vs. translated comparison sheet. Ideal for travelers, international students, and global businesses.",
    metaDescription: "Scan and translate text from images online. Extract foreign language signs, screenshots, and labels and translate them with AI OCR Translate.",
    h1: "AI OCR Photo and Image Translator",
    primaryIcon: "Languages",
    ctaText: "Translate Image Text",
    seoKeywords: ["image translator", "translate picture text", "ocr translate online", "photo translator sign", "convert and translate image"],
    features: [
      {
        title: "Auto-Source Language Detection",
        description: "No need to select the input language. Our cognitive AI instantly identifies the source dialect upon reading.",
        iconName: "HelpCircle"
      },
      {
        title: "Context-Aware Translations",
        description: "Translates idioms, slogans, and technical manuals with natural grammar structures, rather than literal word-by-word swaps.",
        iconName: "Smile"
      },
      {
        title: "Interactive Side-by-Side View",
        description: "Compares your original extracted paragraphs directly against the translated output for clear validation.",
        iconName: "Sparkles"
      },
      {
        title: "50+ Target Languages",
        description: "Translate into major global languages including English, Spanish, Mandarin, Hindi, Japanese, Arabic, and Portuguese.",
        iconName: "Globe"
      }
    ],
    faqs: [
      {
        question: "How do I choose the language I want to translate into?",
        answer: "Before uploading your image, select your desired language (e.g., Spanish, French, Japanese, Arabic) from the dropdown selector on the tool page."
      },
      {
        question: "Can it translate handwriting as well?",
        answer: "Yes! Because the translator is backed by our smart multimodal system, it can easily read handwritten notes in foreign languages and translate them accurately."
      },
      {
        question: "Is this tool useful for translating legal or technical product sheets?",
        answer: "Absolutely. The translator is calibrated on large language models, meaning it excels at retaining correct domain terminology across legal contracts, tech sheets, and medical journals."
      }
    ]
  },
  {
    id: "barcode",
    title: "Barcode & QR Code Scanner",
    shortDesc: "Identify and decode QR codes, UPCs and product barcodes from photos.",
    seoDescription: "Scan barcodes and QR codes online from image files. Instantly parse URL links, serial numbers, EAN/UPC product codes, and trigger corresponding action items.",
    longDesc: "Avoid the need for specialized physical scanner hardware or phone camera apps. Upload a photo or screenshot of a barcode or QR code. ToolIMG parses standard symbologies, decodes the encrypted strings, and automatically outputs links or shopping search shortcuts.",
    metaDescription: "Scan barcodes and QR codes online. Upload images, photos, or screenshot crops to decode UPC, EAN, or QR data with AI scanning technology.",
    h1: "AI Barcode & QR Code Reader Online",
    primaryIcon: "QrCode",
    ctaText: "Decode Barcode",
    seoKeywords: ["online barcode scanner", "read qr code from image", "upc scanner upload file", "decode product barcode", "image barcode reader"],
    features: [
      {
        title: "EAN & UPC Compatibility",
        description: "Optimized for consumer product codes (UPC-A, EAN-13, EAN-8) as well as commercial logistics bars (Code 128, Code 39).",
        iconName: "Package"
      },
      {
        title: "Instant Hyperlinks",
        description: "If a QR code resolves to a URL or email address, the tool converts it into an active, clickable direct link instantly.",
        iconName: "ExternalLink"
      },
      {
        title: "Damaged Code Reconstruction",
        description: "Decodes barcodes that are partially torn, crumpled, low-contrast, blurred, or captured at diagonal angles.",
        iconName: "RefreshCw"
      },
      {
        title: "Product Search Shortcuts",
        description: "Provides convenient one-click Google Search buttons for decoded UPCs, allowing you to lookup product prices instantly.",
        iconName: "Search"
      }
    ],
    faqs: [
      {
        question: "Can it read QR codes containing Wi-Fi credentials or contact files?",
        answer: "Yes! It will decode the plain text configuration within the QR code (such as WIFI:S:Network;P:password;; or VCARD fields) so you can easily copy and save it."
      },
      {
        question: "Can I scan a barcode from a product packaging photo?",
        answer: "Yes, just photograph the package clearly, crop slightly around the barcode area if needed, and upload it. The AI will locate the stripe sequence and decode it."
      },
      {
        question: "Does it support 2D barcodes like DataMatrix or PDF417?",
        answer: "Yes, our AI-powered scanner supports common 2D logistics matrices including DataMatrix, PDF417 (used on shipping labels), and Aztec codes."
      }
    ]
  }
];
