const fs = require('fs');
const path = require('path');

const files = [
    'index.html',
    'dashboard/index.html',
    'pricing/index.html',
    'tools/index.html',
    'tools/image-to-code/index.html',
    'tools/handwriting-to-text/index.html',
    'tools/hindi-handwriting-to-text/index.html',
];

const blockPath = path.join(__dirname, 'translation-block.html');
if (!fs.existsSync(blockPath)) {
    console.error('Error: translation-block.html does not exist!');
    process.exit(1);
}

const newScriptBlock = fs.readFileSync(blockPath, 'utf8');

for (const f of files) {
    const filePath = path.join(__dirname, f);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Match from <!-- Google Translate integration --> to the end of the file
        const pattern = /<!-- Google Translate integration -->[\s\S]*?<\/html>/;
        
        if (pattern.test(content)) {
            content = content.replace(pattern, newScriptBlock);
            fs.writeFileSync(filePath, content);
            console.log(`Successfully patched ${f}`);
        } else {
            console.log(`Pattern not matched in ${f}`);
        }
    } else {
        console.log(`File not found: ${f}`);
    }
}
console.log('Finished translation logic patch.');
