export interface FAQ {
  question: string;
  answer: string;
}

export interface Feature {
  title: string;
  description: string;
  iconName: string;
}

export interface OCRTool {
  id: string;
  title: string;
  shortDesc: string;
  seoDescription: string;
  longDesc: string;
  features: Feature[];
  faqs: FAQ[];
  seoKeywords: string[];
  ctaText: string;
  primaryIcon: string;
  metaDescription: string;
  h1: string;
}

export interface OCRResponse {
  extractedText: string;
  markdownSummary: string;
  structuredData: Record<string, any>;
}
