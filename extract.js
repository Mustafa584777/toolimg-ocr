const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');

const headerMatch = content.match(/<header[\s\S]*?<\/header>/);
const footerMatch = content.match(/<footer[\s\S]*?<\/footer>/);

if (headerMatch) {
    fs.writeFileSync('header.html', headerMatch[0], 'utf8');
}
if (footerMatch) {
    fs.writeFileSync('footer.html', footerMatch[0], 'utf8');
}
