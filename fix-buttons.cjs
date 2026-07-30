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

const targetDropdown = `<div class="py-2">
                        <a href="javascript:void(0)" onclick="switchLang('en')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">English</a>
                        <a href="javascript:void(0)" onclick="switchLang('es')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Español</a>
                        <a href="javascript:void(0)" onclick="switchLang('fr')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Français</a>
                        <a href="javascript:void(0)" onclick="switchLang('de')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Deutsch</a>
                        <a href="javascript:void(0)" onclick="switchLang('ru')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Русский</a>
                        <a href="javascript:void(0)" onclick="switchLang('ar')" class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">العربية</a>
                    </div>`;

const replacementDropdown = `<div class="py-2">
                        <button type="button" onclick="switchLang('en')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">English</button>
                        <button type="button" onclick="switchLang('es')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Español</button>
                        <button type="button" onclick="switchLang('fr')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Français</button>
                        <button type="button" onclick="switchLang('de')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Deutsch</button>
                        <button type="button" onclick="switchLang('ru')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">Русский</button>
                        <button type="button" onclick="switchLang('ar')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">العربية</button>
                    </div>`;

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Clean up formatting differences in the target search
        // We can use a regex to replace any <a> tags inside lang-popover
        const regex = /<div id="lang-popover"[\s\S]*?<div class="py-2">([\s\S]*?)<\/div>[\s\S]*?<\/div>/;
        const match = content.match(regex);
        if (match) {
            const oldInner = match[1];
            // Convert any <a> tags inside to <button type="button">
            let newInner = oldInner;
            newInner = newInner.replace(/<a\s+href="javascript:void\(0\)"\s+onclick="switchLang\('([a-z]{2})'\)"\s+class="([^"]+)">([^<]+)<\/a>/g, 
                '<button type="button" onclick="switchLang(\'$1\')" class="w-full text-left $2">$3</button>'
            );
            
            // Also handle any other whitespace variants of the <a> tags
            newInner = newInner.replace(/<a\s+href="javascript:void\(0\)"\s+onclick="switchLang\('([a-z]{2})'\)"\s+class="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">([^<]+)<\/a>/g, 
                '<button type="button" onclick="switchLang(\'$1\')" class="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">$2</button>'
            );

            content = content.replace(oldInner, newInner);
            fs.writeFileSync(f, content);
            console.log(`Updated popover tags in ${f}`);
        } else {
            console.log(`Could not find lang-popover in ${f}`);
        }
    }
}
console.log('Finished updating translation buttons.');
