import React, { useState, useRef, useEffect } from "react";
import { OCRTool, OCRResponse } from "../types";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { 
  ArrowLeft, Upload, FileText, Copy, Download, RefreshCw, AlertCircle, 
  Check, Sparkles, Languages, ChevronDown, ChevronUp, Clock, HelpCircle, 
  ExternalLink, User, Phone, Mail, Globe, MapPin, Building, Briefcase, Barcode,
  CreditCard, Receipt, Car, Table, CheckSquare
} from "lucide-react";

// Target languages for translation tool dropdown
const TARGET_LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", 
  "Korean", "Arabic", "Hindi", "Portuguese", "Russian", "Italian"
];

interface OCRToolPageProps {
  tool: OCRTool;
  onBack: () => void;
}

export default function OCRToolPage({ tool, onBack }: OCRToolPageProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResponse | null>(null);
  
  // Interactive UI tab state
  const [activeTab, setActiveTab] = useState<"visual" | "text" | "json">("visual");
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  
  // Custom states for specific tools
  const [targetLanguage, setTargetLanguage] = useState("Spanish");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top on load of new tool
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    resetTool();
  }, [tool]);

  const resetTool = () => {
    setImageFile(null);
    setImagePreviewUrl(null);
    setOcrResult(null);
    setErrorMessage(null);
    setIsProcessing(false);
    setCopySuccess(false);
    setDownloadSuccess(false);
    setActiveTab("visual");
  };

  // Drag and drop event handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndSetFile(files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Only image files (PNG, JPG, JPEG, WEBP) are supported.");
      return;
    }
    setErrorMessage(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setOcrResult(null);
  };

  // Convert uploaded image file to base64 string
  const convertBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        // Strip the dataURL header (e.g. "data:image/png;base64,")
        const base64String = (fileReader.result as string).split(",")[1];
        resolve(base64String);
      };
      fileReader.onerror = (error) => reject(error);
    });
  };

  // Submit the base64 payload to the Express server-side OCR API
  const handleProcessImage = async () => {
    if (!imageFile) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const base64Data = await convertBase64(imageFile);
      const mimeType = imageFile.type;

      const response = await fetch("/api/ocr/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolId: tool.id,
          base64: base64Data,
          mimeType,
          extraParams: {
            targetLanguage,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "The server failed to parse the OCR request.");
      }

      const data: OCRResponse = await response.json();
      setOcrResult(data);
    } catch (error: any) {
      console.error("Error processing OCR:", error);
      setErrorMessage(error.message || "An error occurred while connecting to the server's AI service.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy results to clipboard
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Download raw extracted text, CSV, or vCard file
  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const getVCardDownload = () => {
    if (!ocrResult?.structuredData) return "";
    return ocrResult.structuredData.vcardText || "";
  };

  const getCsvDownload = () => {
    if (!ocrResult?.structuredData || !ocrResult.structuredData.rows) return "";
    const headers = ocrResult.structuredData.headers as string[];
    const rows = ocrResult.structuredData.rows as string[][];
    
    const csvContent = [
      headers.map(h => `"${h.replace(/"/g, '""')}"`).join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    return csvContent;
  };

  return (
    <div className="min-h-screen bg-white text-[#1E2937] font-sans antialiased">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Navigation Action */}
        <div className="mb-6">
          <button 
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-[#64748B] hover:text-[#4F46E5] bg-slate-50 hover:bg-indigo-50/50 rounded-xl transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Go Back to Homepage</span>
          </button>
        </div>

        {/* Dynamic Tool Title & Descriptions */}
        <section className="mb-10 text-center md:text-left">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1E2937] mb-3">
            {tool.h1}
          </h1>
          <p className="text-lg text-[#64748B] max-w-4xl leading-relaxed">
            {tool.seoDescription}
          </p>
        </section>

        {/* Primary Workspace Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* LEFT COLUMN: Upload Area and Controls */}
          <div className="space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#1E2937]">
                <Upload className="h-5 w-5 text-[#4F46E5]" />
                <span>Upload & Prepare Image</span>
              </h2>

              {/* Special options for Translate Tool */}
              {tool.id === "translate" && (
                <div className="mb-5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-[#4F46E5]" />
                    <span className="text-sm font-semibold text-[#1E2937]">Translate Output Into:</span>
                  </div>
                  <select
                    value={targetLanguage}
                    onChange={(e) => setTargetLanguage(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] text-[#1E2937] font-medium"
                  >
                    {TARGET_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Drop Zone Area supporting Click and Drag */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[220px] ${
                  isDragging 
                    ? "border-[#4F46E5] bg-indigo-50/20" 
                    : "border-slate-200 hover:border-[#4F46E5] bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                {imagePreviewUrl ? (
                  <div className="relative max-h-[260px] overflow-hidden rounded-xl border border-slate-100 group">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Source preview" 
                      className="max-h-[240px] w-auto object-contain rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200 rounded-lg">
                      <p className="text-white text-xs font-semibold bg-[#4F46E5] px-3 py-1.5 rounded-full">Replace Image</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="h-14 w-14 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-4 shadow-sm">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="font-semibold text-[#1E2937] text-base mb-1">
                      Drag and drop your image here, or <span className="text-[#4F46E5]">browse</span>
                    </p>
                    <p className="text-xs text-[#64748B]">
                      Supports PNG, JPEG, JPG, WEBP up to 25MB.
                    </p>
                  </>
                )}
              </div>

              {/* Submit trigger button */}
              {imageFile && (
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleProcessImage}
                    disabled={isProcessing}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-2xl shadow-md shadow-indigo-100 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="animate-spin h-5 w-5" />
                        <span>Scanning Characters...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5" />
                        <span>Run OCR Scan</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetTool}
                    disabled={isProcessing}
                    className="px-4 py-3 bg-slate-100 text-[#64748B] hover:bg-slate-200 font-semibold rounded-2xl transition-colors"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Error messages */}
              {errorMessage && (
                <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold">OCR Processing Error</p>
                    <p className="text-rose-600">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Static Tips block */}
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
              <h3 className="font-bold text-[#1E2937] mb-3 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-[#10B981]" />
                <span>Tips for Perfect OCR Results:</span>
              </h3>
              <ul className="space-y-2 text-sm text-[#64748B]">
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span><strong>Maximize contrast:</strong> Ensure text is dark and background is light, avoiding shadows.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span><strong>Maintain Focus:</strong> Avoid fuzzy, motion-blurred or low-resolution camera screenshots.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#10B981] font-bold">•</span>
                  <span><strong>Flat Orientation:</strong> Keep the document or paper aligned straight to prevent curved line issues.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN: Loading States and Extracted Results */}
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              {isProcessing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-50 border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]"
                >
                  <div className="relative mb-6">
                    <div className="h-16 w-16 rounded-full border-4 border-indigo-100 border-t-[#4F46E5] animate-spin" />
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#4F46E5] animate-pulse" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#1E2937] mb-2">Analyzing Image Patterns</h3>
                  <p className="text-sm text-[#64748B] max-w-sm mb-6 leading-relaxed">
                    ToolIMG's server-side AI model is mapping lines, predicting handwritten characters, and parsing structures.
                  </p>
                  
                  <div className="bg-indigo-50/50 px-4 py-2 rounded-full inline-flex items-center gap-2 text-xs text-[#4F46E5] font-semibold">
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Processing takes 2-4 seconds...</span>
                  </div>
                </motion.div>
              ) : ocrResult ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col flex-1"
                >
                  {/* Results Header Tabs */}
                  <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex bg-slate-200/60 p-1 rounded-xl">
                      <button
                        onClick={() => setActiveTab("visual")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          activeTab === "visual" 
                            ? "bg-white text-[#4F46E5] shadow-sm" 
                            : "text-[#64748B] hover:text-[#1E2937]"
                        }`}
                      >
                        Visual Render
                      </button>
                      <button
                        onClick={() => setActiveTab("text")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          activeTab === "text" 
                            ? "bg-white text-[#4F46E5] shadow-sm" 
                            : "text-[#64748B] hover:text-[#1E2937]"
                        }`}
                      >
                        Raw Text
                      </button>
                      <button
                        onClick={() => setActiveTab("json")}
                        className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                          activeTab === "json" 
                            ? "bg-white text-[#4F46E5] shadow-sm" 
                            : "text-[#64748B] hover:text-[#1E2937]"
                        }`}
                      >
                        JSON Data
                      </button>
                    </div>

                    {/* Dynamic download triggers */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopyToClipboard(ocrResult.extractedText)}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-slate-200 text-[#64748B] hover:text-[#4F46E5] hover:bg-slate-50 transition-colors shadow-sm"
                        title="Copy raw text"
                      >
                        {copySuccess ? <Check className="h-4 w-4 text-[#10B981]" /> : <Copy className="h-4 w-4" />}
                      </button>

                      {tool.id === "business-card" && getVCardDownload() && (
                        <button
                          onClick={() => handleDownloadFile(getVCardDownload(), "contact.vcf", "text/vcard")}
                          className="inline-flex items-center gap-1 px-3 h-9 text-xs font-semibold bg-[#10B981] hover:bg-[#0e9d6d] text-white rounded-xl shadow-sm transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>vCard</span>
                        </button>
                      )}

                      {tool.id === "table" && getCsvDownload() && (
                        <button
                          onClick={() => handleDownloadFile(getCsvDownload(), "table.csv", "text/csv")}
                          className="inline-flex items-center gap-1 px-3 h-9 text-xs font-semibold bg-[#10B981] hover:bg-[#0e9d6d] text-white rounded-xl shadow-sm transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>CSV Excel</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleDownloadFile(ocrResult.extractedText, "extracted-text.txt", "text/plain")}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-white border border-slate-200 text-[#64748B] hover:text-[#4F46E5] hover:bg-slate-50 transition-colors shadow-sm"
                        title="Download as TXT"
                      >
                        {downloadSuccess ? <Check className="h-4 w-4 text-[#10B981]" /> : <Download className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Results Container Body */}
                  <div className="p-6 flex-1 overflow-y-auto max-h-[500px]">
                    {activeTab === "visual" && (
                      <div className="prose prose-slate max-w-none">
                        
                        {/* Render specialized UIs first, otherwise fallback to standard markdown */}
                        {tool.id === "business-card" && ocrResult.structuredData?.name ? (
                          <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="h-10 w-10 rounded-full bg-indigo-50 text-[#4F46E5] flex items-center justify-center">
                                <User className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-lg font-bold text-[#1E2937]">{ocrResult.structuredData.name}</h4>
                                <p className="text-xs text-[#64748B]">{ocrResult.structuredData.title || "Profession"} at {ocrResult.structuredData.company || "Company"}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2.5 text-sm text-[#1E2937]">
                              {ocrResult.structuredData.phone && (
                                <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#64748B]" /> <span>{ocrResult.structuredData.phone}</span></div>
                              )}
                              {ocrResult.structuredData.email && (
                                <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#64748B]" /> <span className="text-[#4F46E5]">{ocrResult.structuredData.email}</span></div>
                              )}
                              {ocrResult.structuredData.website && (
                                <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-[#64748B]" /> <a href={`https://${ocrResult.structuredData.website.replace(/^https?:\/\//, '')}`} target="_blank" rel="noreferrer" className="text-[#4F46E5] hover:underline flex items-center gap-0.5">{ocrResult.structuredData.website} <ExternalLink className="h-3 w-3" /></a></div>
                              )}
                              {ocrResult.structuredData.address && (
                                <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#64748B]" /> <span>{ocrResult.structuredData.address}</span></div>
                              )}
                            </div>
                          </div>
                        ) : null}

                        {tool.id === "receipt" && ocrResult.structuredData?.merchantName ? (
                          <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-6">
                            <div className="flex justify-between items-start mb-4 border-b border-slate-200/50 pb-3">
                              <div>
                                <h4 className="text-base font-bold text-[#1E2937]">{ocrResult.structuredData.merchantName}</h4>
                                <p className="text-xs text-[#64748B]">Date: {ocrResult.structuredData.date || "Unknown"}</p>
                              </div>
                              <div className="text-right">
                                <span className="inline-flex bg-indigo-50 text-[#4F46E5] px-2.5 py-1 rounded-full text-xs font-bold">
                                  {ocrResult.structuredData.paymentMethod || "Transaction"}
                                </span>
                              </div>
                            </div>

                            {ocrResult.structuredData.items && Array.isArray(ocrResult.structuredData.items) && (
                              <div className="space-y-1.5 mb-4 text-sm border-b border-slate-200/50 pb-3">
                                {ocrResult.structuredData.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex justify-between text-slate-700">
                                    <span>{item.qty || 1}x {item.name}</span>
                                    <span>{ocrResult.structuredData.currency || "$"} {item.total || item.price || "0.00"}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="text-sm space-y-1 text-right max-w-[200px] ml-auto">
                              {ocrResult.structuredData.taxAmount > 0 && <div className="text-[#64748B]">Tax: {ocrResult.structuredData.currency || "$"} {ocrResult.structuredData.taxAmount}</div>}
                              {ocrResult.structuredData.tipAmount > 0 && <div className="text-[#64748B]">Tip: {ocrResult.structuredData.currency || "$"} {ocrResult.structuredData.tipAmount}</div>}
                              <div className="text-lg font-bold text-[#1E2937] pt-1">Total: {ocrResult.structuredData.currency || "$"} {ocrResult.structuredData.totalAmount}</div>
                            </div>
                          </div>
                        ) : null}

                        {tool.id === "barcode" && ocrResult.structuredData?.decodedValue ? (
                          <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                            <Barcode className="h-10 w-10 text-[#4F46E5] mx-auto mb-2" />
                            <p className="text-xs text-[#64748B] font-semibold mb-1">Symbology: {ocrResult.structuredData.codeType || "Unknown"}</p>
                            <h4 className="text-lg font-mono font-bold text-[#1E2937] mb-4 tracking-wider">{ocrResult.structuredData.decodedValue}</h4>
                            
                            {ocrResult.structuredData.isUrl && ocrResult.structuredData.actionUrl ? (
                              <a 
                                href={ocrResult.structuredData.actionUrl} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                              >
                                <span>Go to Decoded URL</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            ) : (
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(ocrResult.structuredData.decodedValue)}`} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="inline-flex items-center gap-1.5 bg-slate-200 hover:bg-slate-300 text-[#1E2937] px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                              >
                                <span>Google Search Lookup</span>
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        ) : null}

                        {/* Fallback structured markdown render */}
                        <div className="markdown-body text-sm sm:text-base text-[#1E2937] leading-relaxed">
                          <Markdown>{ocrResult.markdownSummary}</Markdown>
                        </div>
                      </div>
                    )}

                    {activeTab === "text" && (
                      <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-50 p-4 rounded-xl border border-slate-100 text-[#1E2937]">
                        {ocrResult.extractedText}
                      </pre>
                    )}

                    {activeTab === "json" && (
                      <pre className="whitespace-pre-wrap font-mono text-xs bg-slate-50 p-4 rounded-xl border border-slate-100 text-[#1E2937] overflow-x-auto">
                        {JSON.stringify(ocrResult, null, 2)}
                      </pre>
                    )}
                  </div>

                  <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-xs text-[#64748B] flex items-center justify-between">
                    <span>Scan completed successfully</span>
                    <span>Powered by ToolIMG Server AI</span>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
                  <div className="h-14 w-14 rounded-full bg-slate-200/50 text-[#64748B] flex items-center justify-center mb-4">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-bold text-[#1E2937] mb-1">OCR Result Station</h3>
                  <p className="text-sm text-[#64748B] max-w-sm leading-relaxed">
                    Once you upload an image and launch the characters scan, the transcribed digital data sheet and structural preview will appear directly in this panel.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Detailed Tool Features and Educational Info */}
        <section className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E2937] mb-2 leading-tight">
              Features of {tool.title}
            </h2>
            <p className="text-[#64748B] mb-8 leading-relaxed">
              Explore why our specialized {tool.title} is trusted by professionals worldwide for scanning and parsing details.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {tool.features.map((feature, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1E2937] mb-1">{feature.title}</h3>
                    <p className="text-sm text-[#64748B] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tool-Specific FAQs Accordion */}
        <section className="max-w-3xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E2937] mb-2">
              FAQs about our {tool.title}
            </h2>
            <p className="text-[#64748B]">
              Common questions answered specifically about the {tool.title} scanning capabilities.
            </p>
          </div>

          <div className="space-y-4">
            {tool.faqs.map((faq, index) => {
              const isOpen = faqOpenIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setFaqOpenIndex(isOpen ? null : index)}
                    className="w-full px-6 py-4.5 text-left flex items-center justify-between font-bold text-base sm:text-lg text-[#1E2937] hover:bg-slate-50 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp className="h-5 w-5 text-[#4F46E5]" /> : <ChevronDown className="h-5 w-5 text-[#64748B]" />}
                  </button>
                  
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm sm:text-base text-[#64748B] border-t border-slate-50 pt-4 leading-relaxed bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </div>
  );
}
