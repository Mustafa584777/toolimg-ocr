const fs = require('fs');

const files = [
    { path: 'index.html', urlPath: '' },
    { path: 'dashboard/index.html', urlPath: 'dashboard/' },
    { path: 'pricing/index.html', urlPath: 'pricing/' },
    { path: 'tools/index.html', urlPath: 'tools/' },
    { path: 'tools/image-to-code/index.html', urlPath: 'tools/image-to-code/' },
    { path: 'tools/handwriting-to-text/index.html', urlPath: 'tools/handwriting-to-text/' },
    { path: 'tools/hindi-handwriting-to-text/index.html', urlPath: 'tools/hindi-handwriting-to-text/' },
];

const langs = ['es', 'fr', 'de', 'ru', 'ar'];

for (const file of files) {
    if (!fs.existsSync(file.path)) continue;
    let html = fs.readFileSync(file.path, 'utf8');
    
    // 1. Add hreflang tags
    const hreflangTags = `
    <link rel="alternate" hreflang="en" href="https://toolimg.online/${file.urlPath}" />
${langs.map(l => `    <link rel="alternate" hreflang="${l}" href="https://toolimg.online/${l}/${file.urlPath}" />`).join('\n')}
    <link rel="alternate" hreflang="x-default" href="https://toolimg.online/${file.urlPath}" />
`;
    
    // Replace after <meta name="viewport" ...>
    if (!html.includes('hreflang="en"')) {
        // Just insert before <title>
        html = html.replace(/<title>/, hreflangTags + '<title>');
    }

    // 2. Add Language Selector to Header
    const langSelector = `
            <div class="relative group">
                <button class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition" aria-label="Select Language">
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

    // Ensure we don't insert it twice.
    if (!html.includes('id="theme-btn"')) {
        console.log('Skipping ' + file.path + ' (no theme-btn found)');
    } else if (!html.includes('switchLang(')) {
        html = html.replace(/<button id="theme-btn"/, langSelector + '\n                <button id="theme-btn"');
    }

    // 3. Add switchLang script
    if (!html.includes('function switchLang')) {
        const switchLangScript = `
<script>
function switchLang(lang) {
    const currentPath = window.location.pathname;
    let newPath = currentPath;
    const langPrefixRegex = /^\\/(es|fr|de|ru|ar)\\//;
    if (langPrefixRegex.test(newPath)) {
        newPath = newPath.replace(langPrefixRegex, '/');
    }
    if (lang === 'en') {
        window.location.href = newPath;
    } else {
        window.location.href = '/' + lang + newPath;
    }
}
</script>
`;
        html = html.replace('</body>', switchLangScript + '</body>');
    }

    fs.writeFileSync(file.path, html);
    console.log('Processed ' + file.path);
}
