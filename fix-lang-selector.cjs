const fs = require('fs');

const files = [
    'index.html',
    'dashboard/index.html',
    'pricing/index.html',
    'tools/index.html',
    'tools/image-to-code/index.html',
    'tools/handwriting-to-text/index.html',
    'tools/hindi-handwriting-to-text/index.html',
];

const langSelector = `
            <div class="relative group hidden sm:block">
                <!-- Keep desktop one maybe? No, let's just put one global one. -->
            </div>
`;

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Remove the existing language selector that got injected
        const existingLangRegex = /<div class="relative group">[\s\S]*?<svg class="w-5 h-5 dark:hidden"/;
        if (existingLangRegex.test(content)) {
            content = content.replace(existingLangRegex, '<svg class="w-5 h-5 dark:hidden"');
        }
        
        // Let's also remove the extra wrapper if any. It seems we replaced '<button id="theme-btn"' 
        // with '<div class="relative group">...</div>\n<button id="theme-btn"'.
        const badLangRegex = /<div class="relative group">\s*<button class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition" aria-label="Select Language">[\s\S]*?<\/div>\s*<\/div>\s*<button id="theme-btn"/;
        
        if (badLangRegex.test(content)) {
            content = content.replace(badLangRegex, '<button id="theme-btn"');
        }

        // Now inject the new language selector right before id="credits-display"
        const globalLangSelector = `
            <div class="relative group">
                <button class="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center justify-center" aria-label="Select Language">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12a9 9 0 1018 0 9 9 0 00-18 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.6 9h16.8M3.6 15h16.8M12 3v18"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3c-2.5 0-4.5 4-4.5 9s2 9 4.5 9 4.5-4 4.5-9-2-9-4.5-9z"></path></svg>
                </button>
                <div class="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div class="py-2">
                        <a href="javascript:void(0)" onclick="switchLang('en')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">English</a>
                        <a href="javascript:void(0)" onclick="switchLang('es')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Español</a>
                        <a href="javascript:void(0)" onclick="switchLang('fr')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Français</a>
                        <a href="javascript:void(0)" onclick="switchLang('de')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Deutsch</a>
                        <a href="javascript:void(0)" onclick="switchLang('ru')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Русский</a>
                        <a href="javascript:void(0)" onclick="switchLang('ar')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">العربية</a>
                    </div>
                </div>
            </div>`;
        
        if (!content.includes('aria-label="Select Language"')) {
            content = content.replace('<div id="credits-display"', globalLangSelector + '\n            <div id="credits-display"');
        }

        fs.writeFileSync(f, content);
    }
}
console.log('Fixed lang selector position');
