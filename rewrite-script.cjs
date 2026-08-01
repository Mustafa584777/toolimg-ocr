const fs = require('fs');

let content = fs.readFileSync('tools/html-to-image/index.html', 'utf-8');

const regex = /<script>\s*let currentBase64[\s\S]*?(?=<\!-- Detailed SEO Reference Article Section -->)/m;

const newScript = `<script src="https://cdn.jsdelivr.net/npm/html-to-image@1.11.11/dist/html-to-image.min.js"></script>
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

    window.loadSample = loadSample;

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

    window.updatePreview = updatePreview;

    async function downloadImage() {
        const frame = document.getElementById('preview-frame');
        const doc = frame.contentDocument || frame.contentWindow.document;
        const btn = document.getElementById('download-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="animate-pulse">Rendering...</span>';
        
        try {
            const dataUrl = await window.htmlToImage.toPng(doc.body, { quality: 1.0, pixelRatio: 2 });
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

    window.downloadImage = downloadImage;
    
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
    
    // Init
    setTimeout(loadSample, 100);
</script>

    `;

content = content.replace(regex, newScript);
fs.writeFileSync('tools/html-to-image/index.html', content);
