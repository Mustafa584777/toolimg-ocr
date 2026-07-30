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

const newLangSelector = `            <div class="relative">
                <button id="lang-menu-btn" class="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition flex items-center justify-center" aria-label="Select Language">
                    <svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>
                </button>
                <div id="lang-popover" class="hidden absolute right-0 mt-2 w-40 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg flex-col z-50 overflow-hidden">
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

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Find the old lang selector and replace it
        const oldLangRegex = /<div class="relative group">\s*<button[\s\S]*?aria-label="Select Language"[\s\S]*?<\/button>\s*<div class="absolute right-0 mt-2 w-40 bg-white[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
        content = content.replace(oldLangRegex, newLangSelector);

        fs.writeFileSync(f, content);
    }
}
console.log('Fixed lang selector');
