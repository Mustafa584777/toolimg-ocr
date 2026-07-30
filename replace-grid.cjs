const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

const regex = /<!-- Premium Features Grid -->[\s\S]*?<\/main>/;

const newGrid = `<!-- Premium Features Grid -->
    <div class="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left z-10 w-full" id="tools-grid">
        <!-- Tool Card 1 -->
        <a href="/tools/image-to-code/" class="group block p-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-md hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20">
            <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Image to Code AI</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Convert any UI screenshot, wireframe, or sketch directly into clean HTML/Tailwind/React code.</p>
            <div class="flex items-center text-violet-600 dark:text-violet-400 font-semibold text-sm">
                Try Tool <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
        </a>

        <!-- Tool Card 2 -->
        <a href="/tools/handwriting-to-text/" class="group block p-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-md hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20">
            <div class="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">English Handwriting OCR</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Extract clean digital English text from handwritten pages, notes, or cursive drafts instantly.</p>
            <div class="flex items-center text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                Try Tool <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
        </a>
        
        <!-- Tool Card 3 -->
        <a href="/tools/hindi-handwriting-to-text/" class="group block p-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-md hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20">
            <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">Hindi Handwriting OCR</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Extract clean digital Hindi Devanagari text from handwritten pages, notes, or mixed Hinglish documents instantly.</p>
            <div class="flex items-center text-violet-600 dark:text-violet-400 font-semibold text-sm">
                Try Tool <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
        </a>
    </div>
</main>`;

indexHtml = indexHtml.replace(regex, newGrid);

fs.writeFileSync('index.html', indexHtml);
console.log('Grid replaced');
