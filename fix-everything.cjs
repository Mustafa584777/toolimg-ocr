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

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        // Remove old DOMContentLoaded script if present
        content = content.replace(/document\.addEventListener\('DOMContentLoaded',\s*\(\)\s*=>\s*\{[\s\S]*?\}\);\s*/, '');
        
        // Inject script that runs immediately
        const extraScript = `
(function() {
    const langBtn = document.getElementById('lang-menu-btn');
    const langPopover = document.getElementById('lang-popover');
    if (langBtn && langPopover) {
        langBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (langPopover.classList.contains('hidden')) {
                langPopover.classList.remove('hidden');
                langPopover.classList.add('flex');
            } else {
                langPopover.classList.add('hidden');
                langPopover.classList.remove('flex');
            }
        });
        document.addEventListener('click', (e) => {
            if (!langPopover.contains(e.target) && !langBtn.contains(e.target)) {
                langPopover.classList.add('hidden');
                langPopover.classList.remove('flex');
            }
        });
    }
})();
`;
        if (!content.includes('langBtn.addEventListener')) {
            content = content.replace(/<\/script>\s*<\/body>/, extraScript + '\n</script>\n</body>');
        }

        // Change payload properties to strings to prevent circular JSON errors
        content = content.replace(/base64Data:\s*currentBase64/g, 'base64Data: String(currentBase64)');
        content = content.replace(/framework:\s*selectedFramework\s*\|\|\s*'html-tailwind'/g, 'framework: String(selectedFramework || "html-tailwind")');
        content = content.replace(/customPrompt:\s*document\.getElementById\('opt-prompt'\)\.value/g, 'customPrompt: String(document.getElementById("opt-prompt").value)');

        // Replace the icon with a better translate icon
        const oldIcon = /<svg class="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"><\/path><\/svg>/;
        
        const newIcon = `<svg class="w-5 h-5 text-violet-600 dark:text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 8l6 6"></path>
            <path d="M4 14l6-6 2-3"></path>
            <path d="M2 5h12"></path>
            <path d="M7 2h1"></path>
            <path d="M22 22l-5-10-5 10"></path>
            <path d="M14 18h6"></path>
        </svg>`;
        content = content.replace(oldIcon, newIcon);

        fs.writeFileSync(f, content);
    }
}
console.log('Fixed scripts and icon');
