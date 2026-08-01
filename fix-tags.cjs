const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.astro')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src/pages');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf-8');
  
  // Fix heads
  content = content.replace(/<\/script>\s*<\s*\/>\s*<\s*\/>/g, 
    '</script>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />');
    
  // Fix stray empty tags in head
  content = content.replace(/<title>([^<]*)<\/title>\s*<\s*\/>/g, '<title>$1</title>');
  
  // Fix logo images
  content = content.replace(/<\s*\/>\s*<span class="font-bold[^>]*>ToolIMG<\/span>/g, '<img src="https://toolimg.online/blog/wp-content/uploads/2026/06/logo.png" alt="ToolIMG" class="h-8 object-contain" />\n                    <span class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">ToolIMG</span>');
  
  // User avatar
  content = content.replace(/<button id="user-menu-button"[^>]*>\s*<\s*\/>/g, '<button id="user-menu-button" class="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 overflow-hidden focus:outline-none focus:border-violet-500 transition-colors">\n                            <img id="user-avatar" src="" alt="User" class="w-full h-full object-cover hidden" referrerpolicy="no-referrer" crossorigin="anonymous" />');
  
  fs.writeFileSync(f, content, 'utf-8');
});
console.log('Fixed some tags');
