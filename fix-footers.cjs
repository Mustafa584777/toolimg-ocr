const fs = require('fs');

const files = [
  'tools/handwriting-to-text/index.html',
  'tools/hindi-handwriting-to-text/index.html'
];

const oldFooter = `                <h4 class="font-bold text-slate-900 dark:text-white mb-5 text-[11px] md:text-base">Products</h4>
                <ul class="space-y-3.5">
                    <li><a href="/tools/image-to-code/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Image to Code AI</a></li>
                    <li><a href="/tools/handwriting-to-text/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Handwriting OCR</a></li>
                    <li><a href="/tools/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">All Tools</a></li>
                </ul>`;

const newFooterHw = `                <h4 class="font-bold text-slate-900 dark:text-white mb-5 text-[11px] md:text-base">Products</h4>
                <ul class="space-y-3.5">
                    <li><a href="/tools/image-to-code/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Image to Code AI</a></li>
                    <li><a href="/tools/handwriting-to-text/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold text-violet-600 dark:text-violet-400">English Handwriting OCR</a></li>
                    <li><a href="/tools/hindi-handwriting-to-text/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Hindi Handwriting OCR</a></li>
                    <li><a href="/tools/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">All Tools</a></li>
                </ul>`;

const newFooterHindi = `                <h4 class="font-bold text-slate-900 dark:text-white mb-5 text-[11px] md:text-base">Products</h4>
                <ul class="space-y-3.5">
                    <li><a href="/tools/image-to-code/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">Image to Code AI</a></li>
                    <li><a href="/tools/handwriting-to-text/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">English Handwriting OCR</a></li>
                    <li><a href="/tools/hindi-handwriting-to-text/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition font-semibold text-violet-600 dark:text-violet-400">Hindi Handwriting OCR</a></li>
                    <li><a href="/tools/" class="text-[11px] md:text-[15px] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">All Tools</a></li>
                </ul>`;


let hwHtml = fs.readFileSync('tools/handwriting-to-text/index.html', 'utf8');
hwHtml = hwHtml.replace(oldFooter.replace(/\s+/g, ' '), newFooterHw.replace(/\s+/g, ' '));
// If replace with spaces didn't work, just replace normally
fs.writeFileSync('tools/handwriting-to-text/index.html', hwHtml.replace(oldFooter, newFooterHw));

let hindiHtml = fs.readFileSync('tools/hindi-handwriting-to-text/index.html', 'utf8');
fs.writeFileSync('tools/hindi-handwriting-to-text/index.html', hindiHtml.replace(oldFooter, newFooterHindi));
