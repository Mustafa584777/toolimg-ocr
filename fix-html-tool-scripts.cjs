const fs = require('fs');
let content = fs.readFileSync('tools/html-to-image/index.html', 'utf-8');

// Completely replace the script tag up to the SEO reference
content = content.replace(/<script>\s*let currentBase64[\s\S]*?(?=<\!-- Detailed SEO Reference)/m, 
`<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"></script>
<script>
    window.TAILWIND_CSS_CACHE = \`${fs.readFileSync('style.css', 'utf-8').replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
    const defaultSample = \`<div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; font-family: sans-serif; color: white; width: 400px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
  <h2 style="margin: 0 0 10px 0; font-size: 28px;">Beautiful Image</h2>
  <p style="opacity: 0.9; line-height: 1.5; margin-bottom: 20px;">Created from raw HTML and CSS instantly using ToolIMG.</p>
  <button style="background: white; color: #764ba2; border: none; padding: 10px 20px; border-radius: 30px; font-weight: bold; cursor: pointer;">Awesome!</button>
</div>\`;

    function loadSample() {
        document.getElementById('html-input').value = defaultSample;
        updatePreview();
    }

    function updatePreview() {
        const html = document.getElementById('html-input').value;
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write('<html><head><style>' + window.TAILWIND_CSS_CACHE + '</style></head><body style="margin:0; display:inline-block;">' + html + '</body></html>');
        doc.close();
        
        setTimeout(() => {
            if(doc.body) {
                frame.style.width = doc.body.scrollWidth + 'px';
                frame.style.height = doc.body.scrollHeight + 'px';
            }
        }, 300);
    }

    async function downloadImage() {
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        const btn = document.getElementById('download-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-pulse">Rendering...</span>';
        
        try {
            const dataUrl = await htmlToImage.toPng(doc.body, { quality: 1.0, pixelRatio: 2 });
            const link = document.createElement('a');
            link.download = 'toolimg-design.png';
            link.href = dataUrl;
            link.click();
        } catch(e) {
            console.error(e);
            alert('Error generating image. Ensure your HTML does not have cross-origin images.');
        } finally {
            btn.innerHTML = originalText;
        }
    }
    
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    loadSample();
</script>

    `);

fs.writeFileSync('tools/html-to-image/index.html', content);
