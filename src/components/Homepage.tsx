import React, { useState } from "react";
import { TOOLS_DATA, GENERAL_FAQS } from "../data/toolsData";
import { OCRTool } from "../types";
import { motion } from "motion/react";
import { 
  Search, FileText, PenTool, Receipt, CreditCard, Car, Table, Languages, QrCode,
  ArrowRight, Shield, Zap, Sparkles, Check, HelpCircle, ChevronDown, ChevronUp
} from "lucide-react";

// Lucide icon mapping to safely render icons by name
const IconRenderer: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
  switch (name) {
    case "FileText": return <FileText className={className} />;
    case "PenTool": return <PenTool className={className} />;
    case "Receipt": return <Receipt className={className} />;
    case "CreditCard": return <CreditCard className={className} />;
    case "Car": return <Car className={className} />;
    case "Table": return <Table className={className} />;
    case "Languages": return <Languages className={className} />;
    case "QrCode": return <QrCode className={className} />;
    default: return <Sparkles className={className} />;
  }
};

interface HomepageProps {
  onSelectTool: (toolId: string) => void;
}

export default function Homepage({ onSelectTool }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Group tools into logical categories for filtering
  const getToolCategory = (toolId: string): string => {
    if (["image-to-text", "handwriting", "pdf-to-text"].includes(toolId)) return "text";
    if (["receipt", "business-card", "license-plate"].includes(toolId)) return "document";
    if (["table", "translate", "barcode"].includes(toolId)) return "utility";
    return "other";
  };

  const filteredTools = TOOLS_DATA.filter((tool) => {
    const matchesSearch = 
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.seoKeywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = 
      activeCategory === "all" || getToolCategory(tool.id) === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white text-[#1E2937] font-sans antialiased">
      {/* Container holding all content with max-width precision */}
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* SEO Hero Section */}
        <section id="hero" className="text-center py-12 md:py-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center mb-6"
          >
            <img 
              src="https://toolimg.online/blog/wp-content/uploads/2026/06/logo.png" 
              alt="ToolIMG Logo" 
              className="h-16 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1E2937] mb-4"
          >
            ToolIMG: Free Online <span className="text-[#4F46E5]">AI OCR</span> & Image Scanning Tools
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-[#64748B] mb-8 leading-relaxed"
          >
            Unlock data from your screenshots, scans, and photos. Instantly convert handwriting to text, tables to Excel, scan receipts, read license plates, and translate images completely free.
          </motion.p>

          {/* Interactive Search Bar inspired by toolghar.com */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="max-w-xl mx-auto relative mb-12"
          >
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#64748B]" />
            </div>
            <input
              type="text"
              placeholder="Search OCR tools (e.g., receipt, handwriting, translate...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3.5 border border-slate-200 rounded-2xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent text-[#1E2937] placeholder-[#64748B] shadow-sm transition-all duration-200"
            />
          </motion.div>

          {/* Category Navigation Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[
              { id: "all", label: "All Tools" },
              { id: "text", label: "Text Extraction" },
              { id: "document", label: "Document & Financial" },
              { id: "utility", label: "Utilities & Codes" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-250 ${
                  activeCategory === tab.id
                    ? "bg-[#4F46E5] text-white shadow-md shadow-indigo-100"
                    : "bg-slate-100 text-[#64748B] hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </section>

        {/* Tools Grid Section */}
        <section id="tools" className="mb-20">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool, index) => (
                <motion.article
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.5 }}
                  onClick={() => onSelectTool(tool.id)}
                  className="group relative bg-white border border-slate-100 hover:border-indigo-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                  id={`tool-card-${tool.id}`}
                >
                  <div>
                    {/* Tool Icon and Styling */}
                    <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-[#4F46E5] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#4F46E5] group-hover:text-white transition-all duration-300">
                      <IconRenderer name={tool.primaryIcon} className="h-6 w-6" />
                    </div>
                    
                    {/* Tool Title */}
                    <h2 className="text-xl font-bold text-[#1E2937] mb-2 group-hover:text-[#4F46E5] transition-colors duration-200">
                      {tool.title}
                    </h2>
                    
                    {/* Tool Short Description */}
                    <p className="text-sm text-[#64748B] line-clamp-3 leading-relaxed mb-6">
                      {tool.shortDesc}
                    </p>
                  </div>

                  {/* Call to Action Trigger inside card */}
                  <div className="flex items-center text-sm font-semibold text-[#06B6D4] group-hover:text-[#4F46E5] transition-colors duration-200 mt-auto">
                    <span>{tool.ctaText}</span>
                    <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-lg text-[#64748B] mb-2">No tools match your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="text-[#4F46E5] hover:underline font-semibold"
              >
                Clear search filter
              </button>
            </div>
          )}
        </section>

        {/* Semantic Marketing Copy Section */}
        <section id="marketing-copy" className="bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#4F46E5] px-3 py-1 rounded-full text-xs font-semibold mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The ToolIMG Edge</span>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E2937] mb-6 leading-tight">
              Advanced AI-Powered Optical Character Recognition (OCR) Engine
            </h2>
            
            <p className="text-[#64748B] leading-relaxed mb-6">
              ToolIMG stands as a modern, high-precision, offline-inspired digital scanner toolbelt. Powered by server-side machine learning frameworks, we bypass legacy pattern-matching limitations to read, analyze, and convert any uploaded file or image layout instantly into highly accurate texts, data tables, or standard vCard formats.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 bg-emerald-50 text-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2937] mb-1">Zero Cost, Unlimited Scans</h3>
                  <p className="text-sm text-[#64748B]">Fully free service. Scan and extract text as many times as you need without limits or watermarks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 bg-emerald-50 text-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2937] mb-1">Guaranteed Server Privacy</h3>
                  <p className="text-sm text-[#64748B]">No images are cataloged. All uploaded metadata is securely parsed in server memory and wiped immediately.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 bg-emerald-50 text-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2937] mb-1">Intelligent Formats</h3>
                  <p className="text-sm text-[#64748B]">Not just text—extract organized structured tables (Excel), vCards, decoded barcode payload links, and financial rows.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-1 h-5 w-5 bg-emerald-50 text-[#10B981] rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-3 w-3" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1E2937] mb-1">Next-Gen Handwriting OCR</h3>
                  <p className="text-sm text-[#64748B]">Deciphers complex cursive writing styles, journal structures, and handwritten list grids flawlessly.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* General FAQs Accordion Section */}
        <section id="faqs" className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1E2937] mb-3">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-[#64748B]">
              Got questions about ToolIMG or our image extraction utilities? Find quick answers here.
            </p>
          </div>

          <div className="space-y-4">
            {GENERAL_FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-lg text-[#1E2937] hover:bg-slate-50 transition-colors duration-200 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-[#4F46E5] flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-[#64748B] flex-shrink-0" />
                    )}
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
