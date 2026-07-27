const fs = require('fs');
const path = require('path');

const cssContent = fs.readFileSync('output.css', 'utf-8');

function processHtmlFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Remove the Tailwind CDN script
    content = content.replace(/<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\n?/g, '');
    
    // Remove the tailwind.config script block
    content = content.replace(/<script>\s*tailwind\.config = \{[\s\S]*?\}\s*<\/script>\n?/g, '');
    
    // Check if we already injected the inline CSS
    if (content.includes('/* TAILWIND INJECTED CSS */')) {
        console.log(`Already injected in ${filePath}`);
        return;
    }
    
    // Prepare the <style> block
    const styleBlock = `\n<style>\n/* TAILWIND INJECTED CSS */\n${cssContent}\n</style>\n</head>`;
    
    // Insert right before </head>
    content = content.replace('</head>', styleBlock);
    
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Injected CSS into ${filePath}`);
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
