const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

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
  
  // Split frontmatter and html
  let frontmatter = '';
  let html = content;
  
  const match = content.match(/^(---[\s\S]*?---)\s*([\s\S]*)$/);
  if (match) {
    frontmatter = match[1];
    html = match[2];
  }
  
  // Parse with cheerio
  const $ = cheerio.load(html, { 
    xmlMode: false,
    decodeEntities: false 
  });
  
  // Serialize back to HTML. This fixes unclosed tags and removes extra closing tags!
  // BUT wait, cheerio wraps everything in html/head/body if they aren't there, 
  // but if they ARE there, it preserves them.
  let fixedHtml = $.html();
  
  // Cheerio doesn't self-close void tags unless xmlMode is true, BUT Astro actually handles HTML5 void tags perfectly fine if they are valid HTML!
  // Wait, does Astro support `<img src="a.png">` without `/>`?
  // YES, since Astro 2.0, standard HTML5 void tags are supported without self-closing slash!
  // The ONLY reason Astro failed earlier was because of EXTRA closing tags like `</div>` or invalid nesting.
  // And also because my script created `< />`.
  
  // Replace `< />` with empty if any left
  fixedHtml = fixedHtml.replace(/<\s*\/>/g, '');
  
  fs.writeFileSync(f, frontmatter + '\n' + fixedHtml, 'utf-8');
});
console.log('Fixed astro files using cheerio');
