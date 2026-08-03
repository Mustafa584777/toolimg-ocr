const fs = require('fs');
const path = require('path');

function fixHtml(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Check if cdn.tailwindcss.com script is already included
    if (!content.includes('cdn.tailwindcss.com')) {
        const tailwindInclude = `
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Poppins', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        svg { display: inline-block; vertical-align: middle; }
        svg:not([width]):not([class*="w-"]) { width: 1.5rem; height: 1.5rem; }
    </style>
`;
        // Insert right before </head> or after meta tags
        if (content.includes('</head>')) {
            content = content.replace('</head>', tailwindInclude + '\n</head>');
        } else {
            content = tailwindInclude + content;
        }
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated Tailwind CDN in ${filePath}`);
    } else {
        console.log(`Tailwind CDN already present in ${filePath}`);
    }
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
            fixHtml(fullPath);
        }
    }
}

walkDir(__dirname);
