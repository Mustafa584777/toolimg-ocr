const fs = require('fs');
const glob = require('glob');

const files = [
    './tools/image-to-code/index.html',
    './tools/handwriting-to-text/index.html',
    './tools/hindi-handwriting-to-text/index.html',
    './pricing/index.html',
    './dashboard/index.html',
    './tools/index.html',
    './index.html'
];

for (const file of files) {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    
    // Remove the old listener logic completely
    const regex = /\/\/\s*3\.\s*Dropdown toggling logic for Language Menu Button[\s\S]*?(?=\/\/\s*4\.\s*Translate Fading Toast\/Overlay Logic)/;
    content = content.replace(regex, '');
    
    // Add the global click listener
    if (!content.includes('document.addEventListener(\'click\', function(e) {')) {
        const toggleRegex = /(window\.toggleLangMenu = function\(e\) \{[\s\S]*?\};)/;
        content = content.replace(toggleRegex, `$1\n\ndocument.addEventListener('click', function(e) {\n    const langPopover = document.getElementById('lang-popover');\n    const langBtn = document.getElementById('lang-menu-btn');\n    if (langPopover && langBtn) {\n        if (!langPopover.contains(e.target) && !langBtn.contains(e.target)) {\n            langPopover.classList.add('hidden');\n            langPopover.classList.remove('flex');\n        }\n    }\n});\n`);
    }

    fs.writeFileSync(file, content);
}
console.log('Done cleaning up');
