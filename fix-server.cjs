const fs = require('fs');

let serverCode = fs.readFileSync('server.ts', 'utf8');

const rewriteMiddleware = `
// Rewrite language prefixes for static assets
app.use((req, res, next) => {
  const langPrefixRegex = /^\\/(es|fr|de|ru|ar)(\\/|$)/;
  if (langPrefixRegex.test(req.url)) {
    // If it's an API route or something we don't want to rewrite, skip it
    if (req.url.includes('/api/')) return next();
    req.url = req.url.replace(langPrefixRegex, '/');
  }
  next();
});

`;

if (!serverCode.includes('langPrefixRegex')) {
    serverCode = serverCode.replace("if (process.env.NODE_ENV === 'production') {", rewriteMiddleware + "if (process.env.NODE_ENV === 'production') {");
    fs.writeFileSync('server.ts', serverCode);
    console.log('Fixed server.ts');
}
