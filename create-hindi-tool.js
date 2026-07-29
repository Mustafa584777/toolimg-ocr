const fs = require('fs');

let hwHTML = fs.readFileSync('tools/handwriting-to-text/index.html', 'utf8');

// Replacements for SEO, Title, Meta
hwHTML = hwHTML.replace(
  '<title>English Handwriting to Text Converter AI - ToolIMG</title>',
  '<title>Free Online Hindi Handwriting to Text Converter - ToolIMG</title>'
);

hwHTML = hwHTML.replace(
  '<meta name="description" content="Free AI-powered English handwriting to text converter. Instantly digitize handwritten English notes, documents, letters, and sketches into copyable text.">',
  '<meta name="description" content="Free Online Hindi Handwriting to Text Converter. Effortlessly digitize Devanagari handwritten notes, diaries, mixed Hinglish documents, and letters using advanced vision models.">'
);

// Heading and Subheading
hwHTML = hwHTML.replace(
  /English Handwriting to <span class="text-violet-600 dark:text-violet-400">Text AI<\/span>/g,
  'Hindi Handwriting to <span class="text-violet-600 dark:text-violet-400">Text AI</span>'
);

hwHTML = hwHTML.replace(
  /Digitize handwritten English notes, letters, and documents instantly with high accuracy. Specially optimized for English language cursive and print handwriting styles\./g,
  'Free Online Hindi Handwriting to Text Converter. Digitize Devanagari notebooks, documents, diaries, and mixed Hinglish content with precision.'
);

// Upload area
hwHTML = hwHTML.replace(
  /Upload English Handwriting/g,
  'Upload Hindi Handwriting'
);

hwHTML = hwHTML.replace(
  /Click to upload English handwriting/g,
  'Click to upload Hindi handwriting'
);

// Extract Button
hwHTML = hwHTML.replace(
  /Extract English Text/g,
  'Extract Hindi Text'
);

// API endpoint call
hwHTML = hwHTML.replace(
  /fetch\('\/api\/handwriting'/g,
  "fetch('/api/hindi-handwriting'"
);

// Results Section
hwHTML = hwHTML.replace(
  /Extracted English Text/g,
  'Extracted Hindi Text'
);

hwHTML = hwHTML.replace(
  /Your transcribed English text will appear below\./g,
  'Your transcribed Hindi Devanagari text will appear below.'
);

// Animation/Loading states
hwHTML = hwHTML.replace(
  /Analyzing English cursive details\.\.\./g,
  'Analyzing Devanagari details...'
);

hwHTML = hwHTML.replace(
  /Running English script multimodal AI/g,
  'Running Hindi script multimodal AI'
);

hwHTML = hwHTML.replace(
  /Scanning English Characters/g,
  'Scanning Devanagari Characters'
);

hwHTML = hwHTML.replace(
  /Parsing Cursive Strokes/g,
  'Parsing Matras & Conjuncts'
);

hwHTML = hwHTML.replace(
  /Generating English Text/g,
  'Generating Devanagari Text'
);

// FAQ and SEO section
// We should replace the entire Learn More section.
const newSeoSection = `
        <!-- Distinct FAQ and SEO Section for Hindi Handwriting Tool -->
        <section class="mt-20 border-t border-slate-200 dark:border-slate-800 pt-16">
            <div class="max-w-4xl mx-auto space-y-12">
                <div class="text-center">
                    <span class="text-violet-600 dark:text-violet-400 font-bold tracking-wider uppercase text-xs">Learn More</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">Specialized Devanagari script digitization at your fingertips</h2>
                    <p class="text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">Unlike standard OCR engines that struggle with Hindi handwriting structures, our tool uses trained multimodal models to correctly understand connected characters, matras, and complex mixed scripts.</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">📒 Notebook & Study Notes</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Instantly convert handwritten classroom lectures, competitive exam notes, and student journals written in Hindi into copyable, editable formats.</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">✉️ Historical Letters & Diaries</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Preserve older family letters, personal journals, memoirs, and rare paper documents written in Hindi with full contextual understanding.</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">🌐 Bilingual (Hinglish) Support</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Easily recognizes when notes transition between Hindi (Devanagari) and English (Latin) script mid-sentence, preventing errors in transcription.</p>
                    </div>
                    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2">⚡ 100% Secure & Private</h3>
                        <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Your uploaded images are only processed during the session and are never saved or trained on, keeping your private notebooks secure.</p>
                    </div>
                </div>

                <div class="space-y-6">
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white text-center">Frequently Asked Questions</h3>
                    <div class="space-y-4">
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 class="font-bold text-slate-900 dark:text-white mb-2">How accurate is the Hindi Handwriting to Text converter?</h4>
                            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">It is highly accurate! By using multimodal vision models, the system recognizes variations in Indian handwriting styles, cursive strokes, matra connections, and punctuation, outperforming legacy OCR technologies.</p>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 class="font-bold text-slate-900 dark:text-white mb-2">Does this support Devanagari matras and half-characters?</h4>
                            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">Yes, the AI understands conjuncts (sanyuktakshtra) like "क्ष", "त्र", "ज्ञ", and proper usage of vowel signs (matras), reph, or anusvara dots.</p>
                        </div>
                        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 class="font-bold text-slate-900 dark:text-white mb-2">What format of files can I upload?</h4>
                            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">You can upload common image formats including JPG, PNG, and WEBP. High-resolution screenshots or clearly lit mobile photos of physical pages work best.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
`;

hwHTML = hwHTML.replace(
  /<!-- Distinct FAQ and SEO Section for Handwriting Tool -->[\s\S]*?<\/section>/,
  newSeoSection
);

// We need to also replace 'await window.consumeUserCredit('handwriting-to-text')' 
// to use 'hindi-handwriting-to-text' ? Or keep it same for tracking? 
// The user hasn't asked for a new credit field, they just want the tool.
// If I use the same credit name, it won't break anything. I'll keep it as handwriting-to-text for credits to avoid breaking changes in the db schema.

fs.writeFileSync('tools/hindi-handwriting-to-text/index.html', hwHTML);
console.log('Done replacing content');
