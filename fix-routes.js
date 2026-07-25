const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const serveFrontendRegex = /\/\/ Serve frontend in dev \/ prod[\s\S]*$/;
const serveFrontendMatch = code.match(serveFrontendRegex);

if (serveFrontendMatch) {
    const serveFrontendCode = serveFrontendMatch[0];
    let withoutFrontend = code.replace(serveFrontendRegex, '');
    
    // Find the Handwriting endpoint
    const handwritingRegex = /\/\/ Handwriting to Text Generation Endpoint[\s\S]*?\}\);/g;
    const handwritingMatches = [...withoutFrontend.matchAll(handwritingRegex)];
    
    let finalCode = code;
    // Extract it if it's at the end
    const lastHandwriting = code.match(/\/\/ Handwriting to Text Generation Endpoint[\s\S]*$/);
    if (lastHandwriting && lastHandwriting.index > serveFrontendMatch.index) {
        // It's after serve frontend. Let's rebuild
        const pureCode = code.slice(0, serveFrontendMatch.index);
        const extractedHandwriting = lastHandwriting[0];
        const fixedCode = pureCode + "\n" + extractedHandwriting + "\n\n" + serveFrontendCode.replace(extractedHandwriting, '');
        fs.writeFileSync('server.ts', fixedCode);
        console.log("Fixed route order.");
    } else {
        console.log("No fix needed or not found.");
    }
}
