const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf-8');
// Escape backticks and dollars so we can put it in a JS template literal safely
css = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

let content = fs.readFileSync('tools/html-to-image/index.html', 'utf-8');

const regex = /doc\.write\('<html><head><script src="https:\/\/cdn\.tailwindcss\.com"><\\\\\/script><\/head><body style="margin:0; display:inline-block;">' \+ html \+ '<\/body><\/html>'\);/;
const replacement = `
        doc.write(\`<html><head><style>\${window.TAILWIND_CSS_CACHE || ''}</style></head><body style="margin:0; display:inline-block;">\${html}</body></html>\`);
`;

content = content.replace(regex, replacement);

const scriptStartRegex = /const defaultSample = /;
const injection = `
    window.TAILWIND_CSS_CACHE = \`${css}\`;
    const defaultSample = `;

content = content.replace(scriptStartRegex, injection);
fs.writeFileSync('tools/html-to-image/index.html', content);
