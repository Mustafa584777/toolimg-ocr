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
        content = content.replace('const langPrefixRegex = /^\\/(es|fr|de|ru|ar)\\//;', 'const langPrefixRegex = /^\\/(es|fr|de|ru|ar)(\\/|$)/;');
        // Let's also make sure that if newPath becomes empty or something, it defaults to /
        // Wait, if replace('/es', '/') -> '/', if replace('/es/tools', '/') -> '/tools'. This works!
        fs.writeFileSync(f, content);
    }
}
console.log('Fixed regex');
