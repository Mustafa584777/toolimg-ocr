const fs = require('fs');
let hwHTML = fs.readFileSync('tools/hindi-handwriting-to-text/index.html', 'utf8');
hwHTML = hwHTML.replace(/'\/api\/handwriting'/g, "'/api/hindi-handwriting'");
fs.writeFileSync('tools/hindi-handwriting-to-text/index.html', hwHTML);
