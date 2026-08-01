const fs = require('fs');

let content = fs.readFileSync('tools/html-to-image/index.html', 'utf-8');

// Replace titles
content = content.replace(/Image To Code Converter AI/g, 'HTML to Image Generator');
content = content.replace(/Image to Code/g, 'HTML to Image');
content = content.replace(/image-to-code/g, 'html-to-image');

// Remove the upload zone and replace with a textarea code editor
const mainRegex = /<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-grow">[\s\S]*?<!-- Full Immersive View Modal -->/m;
const newMain = `
<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch flex-grow">
    <!-- Left Panel: Code Input -->
    <div class="lg:col-span-5 flex flex-col gap-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col flex-grow">
            <div class="flex items-center justify-between mb-3">
                <h2 class="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">1. Enter HTML & CSS</h2>
                <button onclick="loadSample()" class="text-xs text-violet-600 hover:underline">Load Sample</button>
            </div>
            <textarea id="html-input" class="w-full flex-grow text-xs p-4 bg-slate-950 text-emerald-400 font-mono rounded-xl focus:ring-1 focus:ring-violet-500 focus:outline-none leading-relaxed resize-none h-[400px]" placeholder="<div>\n  <h1 class=&quot;text-blue-500&quot;>Hello World</h1>\n</div>" oninput="updatePreview()"></textarea>
        </div>
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
            <button id="download-btn" onclick="downloadImage()" class="w-full py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                <span>Download HD Image</span>
            </button>
        </div>
    </div>
    <!-- Right Panel: Preview -->
    <div class="lg:col-span-7 flex flex-col">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col flex-grow overflow-hidden min-h-[500px]">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900">
                <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Live Preview</h3>
            </div>
            <div class="flex-grow flex items-center justify-center p-8 bg-slate-100 dark:bg-slate-950 relative overflow-auto">
                <div id="preview-container" class="bg-white shadow-xl flex items-center justify-center overflow-hidden transition-all relative">
                    <iframe id="preview-frame" class="w-full h-full border-0"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Full Immersive View Modal -->
`;
content = content.replace(mainRegex, newMain);

// We must also replace the script tags logic.
const scriptRegex = /<script>\s*let currentBase64[\s\S]*?<\/script>\n\n    <!-- Detailed SEO Reference/m;
const newScript = `<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"></script>
<script>
    const defaultSample = \`<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; font-family: sans-serif; color: white; width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
  <h2 style="margin: 0 0 10px 0; font-size: 28px;">Beautiful Image</h2>
  <p style="opacity: 0.9; line-height: 1.5; margin-bottom: 20px;">Created from raw HTML and CSS instantly using ToolIMG.</p>
  <button style="background: white; color: #764ba2; border: none; padding: 10px 20px; border-radius: 30px; font-weight: bold; cursor: pointer;">Awesome!</button>
</div>\`;

    function loadSample() {
        document.getElementById('html-input').value = defaultSample;
        updatePreview();
    }

    function updatePreview() {
        const html = document.getElementById('html-input').value;
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write('<html><head><script src="https://cdn.tailwindcss.com"><\\/script></head><body style="margin:0; display:inline-block;">' + html + '</body></html>');
        doc.close();
        
        // Auto-resize iframe to content
        setTimeout(() => {
            if(doc.body) {
                frame.style.width = doc.body.scrollWidth + 'px';
                frame.style.height = doc.body.scrollHeight + 'px';
            }
        }, 300);
    }

    async function downloadImage() {
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        const btn = document.getElementById('download-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-pulse">Rendering...</span>';
        
        try {
            const dataUrl = await htmlToImage.toPng(doc.body, { quality: 1.0, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = 'toolimg-design.png';
            link.href = dataUrl;
            link.click();
        } catch(e) {
            console.error(e);
            alert('Error generating image. Ensure your HTML does not have cross-origin images.');
        } finally {
            btn.innerHTML = originalText;
        }
    }
    
    // Theme setup
    const themeBtn = document.getElementById('theme-btn');
    themeBtn.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Init
    loadSample();
</script>

    <!-- Detailed SEO Reference`;
content = content.replace(scriptRegex, newScript);

fs.writeFileSync('tools/html-to-image/index.html', content);
