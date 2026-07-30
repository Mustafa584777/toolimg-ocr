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

const extraScript = `
document.addEventListener('DOMContentLoaded', () => {
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
});
`;

for (const f of files) {
    if (fs.existsSync(f)) {
        let content = fs.readFileSync(f, 'utf8');
        
        if (!content.includes('langBtn.addEventListener')) {
            content = content.replace(/<\/script>\s*<\/body>/, extraScript + '\n</script>\n</body>');
        }

        fs.writeFileSync(f, content);
    }
}
console.log('Fixed lang script');
