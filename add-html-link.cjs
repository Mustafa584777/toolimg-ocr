const fs = require('fs');

const htmlToImageLink = `
        <!-- Tool Card 4 -->
        <a href="/tools/html-to-image/" class="group block p-8 rounded-3xl bg-white/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 backdrop-blur-md hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100/50 dark:hover:shadow-violet-900/20">
            <div class="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">HTML to Image Generator</h3>
            <p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">Convert custom HTML, CSS, or Tailwind markup into gorgeous, download-ready HD design images instantly.</p>
            <div class="flex items-center text-violet-600 dark:text-violet-400 font-semibold text-sm">
                Try Tool <svg class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </div>
        </a>
`;

['index.html', 'tools/index.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('href="/tools/html-to-image/"')) {
        // Insert right before the end of the grid
        content = content.replace(/(<\!-- Tool Card 1 -->[\s\S]*?)<\/div>\s*<\/main>/, `$1${htmlToImageLink}\n    </div>\n</main>`);
        fs.writeFileSync(file, content);
    }
});
