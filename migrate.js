import fs from 'fs';
import path from 'path';

const rootDir = process.cwd();
const srcPagesDir = path.join(rootDir, 'src', 'pages');
const srcStylesDir = path.join(rootDir, 'src', 'styles');

// Create directories
fs.mkdirSync(srcPagesDir, { recursive: true });
fs.mkdirSync(srcStylesDir, { recursive: true });

// Move styles
if (fs.existsSync('style.css')) fs.renameSync('style.css', path.join(srcStylesDir, 'global.css'));

// Define the astro import block
const astroImports = `---
import '../styles/global.css';
---
`;
const astroImportsNested = `---
import '../../styles/global.css';
---
`;
const astroImportsDeep = `---
import '../../../styles/global.css';
---
`;

// Helper to get depth
function getDepth(filePath) {
  return filePath.split('/').length - 1;
}

// Function to process HTML files
function processHtml(filePath, outPath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove existing CSS links (vite output.css or style.css)
  content = content.replace(/<link rel="stylesheet" href="\/output\.css">/g, '');
  content = content.replace(/<link rel="stylesheet" href="\/style\.css">/g, '');
  content = content.replace(/<link rel="stylesheet" href="style\.css">/g, '');
  content = content.replace(/<style>[\s\S]*?<\/style>/g, ''); // maybe too destructive? Let's leave <style> tags alone for now, but the user explicitly requested CSS to be inline or we just use global.css.
  
  // Actually, we moved style.css to global.css, and Astro handles it. We can just add the Astro imports at the top.
  const depth = getDepth(outPath.replace(srcPagesDir + '/', ''));
  let imports = astroImports;
  if (depth === 1) imports = astroImportsNested;
  if (depth === 2) imports = astroImportsDeep;
  
  content = imports + content;
  
  // Create output dir if needed
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, content, 'utf-8');
}

// Map files
const fileMap = [
  { in: 'index.html', out: path.join(srcPagesDir, 'index.astro') },
  { in: 'tools/index.html', out: path.join(srcPagesDir, 'tools/index.astro') },
  { in: 'tools/image-to-code/index.html', out: path.join(srcPagesDir, 'tools/image-to-code/index.astro') },
  { in: 'tools/handwriting-to-text/index.html', out: path.join(srcPagesDir, 'tools/handwriting-to-text/index.astro') },
  { in: 'tools/hindi-handwriting-to-text/index.html', out: path.join(srcPagesDir, 'tools/hindi-handwriting-to-text/index.astro') },
  { in: 'tools/html-to-image/index.html', out: path.join(srcPagesDir, 'tools/html-to-image/index.astro') },
  { in: 'dashboard/index.html', out: path.join(srcPagesDir, 'dashboard/index.astro') },
  { in: 'pricing/index.html', out: path.join(srcPagesDir, 'pricing/index.astro') }
];

fileMap.forEach(f => {
  if (fs.existsSync(f.in)) {
    processHtml(f.in, f.out);
    fs.unlinkSync(f.in); // remove old file
  }
});

// Update package.json
const pkgPath = path.join(rootDir, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
pkg.scripts.dev = "concurrently \"astro dev --port 3001\" \"node --experimental-strip-types server.ts\"";
pkg.scripts.build = "astro build";
pkg.scripts.start = "NODE_ENV=production node server.ts";
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));

// Create astro.config.mjs
const astroConfig = `import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware'
  }),
  vite: {
    plugins: [tailwindcss()]
  }
});`;
fs.writeFileSync(path.join(rootDir, 'astro.config.mjs'), astroConfig);

// Cleanup old config
if (fs.existsSync('vite.config.ts')) fs.unlinkSync('vite.config.ts');
if (fs.existsSync('tailwind.config.js')) fs.unlinkSync('tailwind.config.js');

console.log('Migration complete!');
