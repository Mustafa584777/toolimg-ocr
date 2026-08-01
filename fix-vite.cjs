const fs = require('fs');
let content = fs.readFileSync('vite.config.ts', 'utf8');
if (!content.includes('htmlToImage:')) {
    content = content.replace(/toolsArchive: resolve\(__dirname, 'tools\/index.html'\),/, "toolsArchive: resolve(__dirname, 'tools/index.html'),\n          htmlToImage: resolve(__dirname, 'tools/html-to-image/index.html'),");
    fs.writeFileSync('vite.config.ts', content);
}

let transContent = fs.readFileSync('fix-translation.cjs', 'utf8');
if (!transContent.includes('html-to-image/index.html')) {
    transContent = transContent.replace(/'tools\/hindi-handwriting-to-text\/index\.html',/, "'tools/hindi-handwriting-to-text/index.html',\n    'tools/html-to-image/index.html',");
    fs.writeFileSync('fix-translation.cjs', transContent);
}
