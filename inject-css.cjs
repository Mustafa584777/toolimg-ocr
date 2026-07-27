const fs = require('fs');
const path = require('path');

const cssContent = fs.readFileSync('style.css', 'utf-8');

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove the Tailwind CDN script
    content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\n?/g, '');
    
    // Remove the tailwind.config script block
    content = content.replace(/<script>\s*tailwind\.config = \{[\s\S]*?\}\s*<\/script>\n?/g, '');
    
    // Remove Vite css import if any (though typically handled by Vite, in dev it might be there)
    content = content.replace(/<link rel="stylesheet" href="\/style\.css">\n?/g, '');
    
    const styleBlock = `\n<style>\n/* TAILWIND INJECTED CSS */\n${cssContent}\n</style>\n</head>`;
    
    // Replace the existing style block if it exists
    if (content.includes('/* TAILWIND INJECTED CSS */')) {
        content = content.replace(/<style>\s*\/\* TAILWIND INJECTED CSS \*\/[\s\S]*?<\/style>\s*<\/head>/g, styleBlock);
        console.log(`Replaced CSS in ${filePath}`);
    } else {
        // Insert right before </head>
        content = content.replace('</head>', styleBlock);
        console.log(`Injected CSS into ${filePath}`);
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === 'dist' || file.startsWith('.')) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walkDir(fullPath);
        } else if (file.endsWith('.html')) {
            processHtmlFile(fullPath);
        }
    }
}

walkDir(__dirname);
