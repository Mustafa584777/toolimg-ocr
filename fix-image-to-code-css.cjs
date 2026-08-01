const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf-8');
css = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

let content = fs.readFileSync('tools/image-to-code/index.html', 'utf-8');

const regex1 = /const finalCode = rawHtml\.includes\('https:\/\/cdn\.tailwindcss\.com'\) \? rawHtml : `<script src="https:\/\/cdn\.tailwindcss\.com"><\\\\\/script>\\n\$\{rawHtml\}`;/g;
const replacement1 = `
const finalCode = rawHtml.includes('https://cdn.tailwindcss.com') ? rawHtml : \`<style>\${window.TAILWIND_CSS_CACHE || ''}</style>\\n\${rawHtml}\`;
`;

const regex2 = /const finalHtml = rawHtml\.includes\('https:\/\/cdn\.tailwindcss\.com'\) \? rawHtml : `<script src="https:\/\/cdn\.tailwindcss\.com"><\\\\\/script>\\n\$\{rawHtml\}`;/g;
const replacement2 = `
const finalHtml = rawHtml.includes('https://cdn.tailwindcss.com') ? rawHtml : \`<style>\${window.TAILWIND_CSS_CACHE || ''}</style>\\n\${rawHtml}\`;
`;

content = content.replace(regex1, replacement1);
content = content.replace(regex2, replacement2);

if (!content.includes('window.TAILWIND_CSS_CACHE')) {
    const scriptStartRegex = /let currentBase64 = null;/;
    content = content.replace(scriptStartRegex, `window.TAILWIND_CSS_CACHE = \`${css}\`;\n        let currentBase64 = null;`);
}

fs.writeFileSync('tools/image-to-code/index.html', content);
