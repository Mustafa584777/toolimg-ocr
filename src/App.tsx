/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import Homepage from "./components/Homepage";
import OCRToolPage from "./components/OCRToolPage";
import { TOOLS_DATA, HOME_META_DESC } from "./data/toolsData";
import { OCRTool } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeToolId, setActiveToolId] = useState<string | null>(null);

  // Synchronize state with URL hash on load and whenever hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/tool/")) {
        const id = hash.replace("#/tool/", "");
        const matched = TOOLS_DATA.find((t) => t.id === id);
        if (matched) {
          setActiveToolId(matched.id);
        } else {
          setActiveToolId(null);
          window.location.hash = "";
        }
      } else {
        setActiveToolId(null);
      }
    };

    // Run once on mount to handle direct links
    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Update document title and meta description dynamically for full SEO compliance
  useEffect(() => {
    let title = "ToolIMG: Free Online AI OCR & Image Scanning Hub";
    let metaDescription = HOME_META_DESC;

    if (activeToolId) {
      const currentTool = TOOLS_DATA.find((t) => t.id === activeToolId);
      if (currentTool) {
        title = `${currentTool.title} - Free Online AI OCR | ToolIMG`;
        metaDescription = currentTool.metaDescription;
      }
    }

    // Update document title
    document.title = title;

    // Dynamically update or create meta description tag
    let metaDescTag = document.querySelector('meta[name="description"]');
    if (!metaDescTag) {
      metaDescTag = document.createElement("meta");
      metaDescTag.setAttribute("name", "description");
      document.head.appendChild(metaDescTag);
    }
    metaDescTag.setAttribute("content", metaDescription);

  }, [activeToolId]);

  // Navigate to specific tool page by updating hash
  const handleSelectTool = (toolId: string) => {
    window.location.hash = `#/tool/${toolId}`;
  };

  // Return back to homepage by clearing hash
  const handleBackToHome = () => {
    window.location.hash = "";
  };

  const currentTool = TOOLS_DATA.find((t) => t.id === activeToolId);

  return (
    <div className="bg-white min-h-screen text-[#1E2937]">
      {/* 
        Aesthetic slide-fade container for multi-page routes transition.
        Using motion/react for high-fidelity interactive flow transitions.
      */}
      <AnimatePresence mode="wait">
        {currentTool ? (
          <motion.div
            key={`tool-${currentTool.id}`}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <OCRToolPage tool={currentTool} onBack={handleBackToHome} />
          </motion.div>
        ) : (
          <motion.div
            key="homepage"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <Homepage onSelectTool={handleSelectTool} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
