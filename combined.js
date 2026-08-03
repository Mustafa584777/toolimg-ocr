
function getApiUrl(endpoint) {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host.includes('192.168.') || host.includes('0.0.0.0');
    const isVercel = host.includes('vercel.app');
    const isAIS = host.includes('run.app');
    if (isLocal || isVercel || isAIS) {
        return endpoint;
    }
    return 'https://toolimg-ocr.vercel.app' + endpoint;
}

      tailwind.config = {
        theme: {
          extend: {
            colors: {
              violet: {
                50: '#f5f3ff',
                100: '#ede9fe',
                200: '#ddd6fe',
                300: '#c4b5fd',
                400: '#a78bfa',
                500: '#8b5cf6',
                600: '#7c3aed',
                700: '#6d28d9',
                800: '#5b21b6',
                900: '#4c1d95',
              }
            }
          }
        }
      }
    
    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('mobile-menu-btn');
        const closeBtn = document.getElementById('mobile-menu-close');
        const modal = document.getElementById('mobile-menu-modal');
        const backdrop = document.getElementById('mobile-menu-backdrop');
        const content = document.getElementById('mobile-menu-content');
        const themeBtn = document.getElementById('theme-menu-btn');
        const themePopover = document.getElementById('theme-popover');
        
        function openModal() {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            // trigger reflow
            void modal.offsetWidth;
            backdrop.classList.remove('opacity-0');
            backdrop.classList.add('opacity-100');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }
        
        function closeModal() {
            backdrop.classList.remove('opacity-100');
            backdrop.classList.add('opacity-0');
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }, 200);
            if(themePopover) {
                themePopover.classList.add('hidden');
                themePopover.classList.remove('flex');
            }
        }
        
        if(btn) btn.addEventListener('click', openModal);
        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        if(backdrop) backdrop.addEventListener('click', closeModal);
        
        if(themeBtn && themePopover) {
            themeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if(themePopover.classList.contains('hidden')) {
                    themePopover.classList.remove('hidden');
                    themePopover.classList.add('flex');
                } else {
                    themePopover.classList.add('hidden');
                    themePopover.classList.remove('flex');
                }
            });
            document.addEventListener('click', (e) => {
                if(!themePopover.contains(e.target) && !themeBtn.contains(e.target)) {
                    themePopover.classList.add('hidden');
                    themePopover.classList.remove('flex');
                }
            });
        }
    });

        let currentBase64 = null;
        let generatedData = null;

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                currentBase64 = result.split(',')[1];
                
                document.getElementById('upload-placeholder').classList.add('hidden');
                const preview = document.getElementById('image-preview');
                preview.src = result;
                preview.classList.remove('hidden');
                
                document.getElementById('image-overlay').classList.remove('hidden');
                document.getElementById('generate-btn').disabled = false;
                
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('view-visual').classList.add('hidden');
                document.getElementById('view-code').classList.add('hidden');
                document.getElementById('view-design').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        async function generateCode() {
            if (!currentBase64) return;
            
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('view-visual').classList.add('hidden');
            document.getElementById('view-code').classList.add('hidden');
            document.getElementById('view-design').classList.add('hidden');
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('generate-btn').disabled = true;

            const payload = {
                base64Data: currentBase64,
                framework: document.getElementById('opt-framework').value,
                styleTheme: document.getElementById('opt-style').value,
                customPrompt: document.getElementById('opt-prompt').value,
                interactivity: 'interactive'
            };

            try {
                const response = await fetch(getApiUrl('/api/ocr'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const data = await response.json();
                
                if (data.error) throw new Error(data.error);

                generatedData = data;
                
                // Populate views
                document.getElementById('preview-iframe').srcdoc = data.htmlCode || 'No HTML available';
                document.getElementById('code-output').textContent = data.frameworkCode || data.htmlCode || 'No code generated';
                
                if (data.designAnalysis) {
                    const da = data.designAnalysis;
                    document.getElementById('design-colors').innerHTML = (da.colors || []).map(c => 
                        `<div class="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-lg"><div class="w-6 h-6 rounded border border-slate-300" style="background-color: ${c}"></div><span class="font-mono text-xs">${c}</span></div>`
                    ).join('');
                    document.getElementById('design-typography').textContent = da.typography || 'N/A';
                    document.getElementById('design-layout').textContent = da.layout || 'N/A';
                    document.getElementById('design-components').innerHTML = (da.components || []).map(c => `<li>${c}</li>`).join('');
                }

                document.getElementById('loading-state').classList.add('hidden');
                switchTab('visual');

            } catch (err) {
                console.error(err);
                alert("Error generating code: " + err.message);
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('empty-state').classList.remove('hidden');
            } finally {
                document.getElementById('generate-btn').disabled = false;
            }
        }

        function switchTab(tabId) {
            const tabs = ['visual', 'code', 'design'];
            
            tabs.forEach(t => {
                const btn = document.getElementById(`tab-${t}`);
                const view = document.getElementById(`view-${t}`);
                
                if (t === tabId) {
                    btn.classList.add('bg-white', 'shadow-sm', 'text-slate-900', 'border', 'border-slate-200');
                    btn.classList.remove('text-slate-500', 'hover:bg-slate-100');
                    view.classList.remove('hidden');
                } else {
                    btn.classList.remove('bg-white', 'shadow-sm', 'text-slate-900', 'border', 'border-slate-200');
                    btn.classList.add('text-slate-500', 'hover:bg-slate-100');
                    view.classList.add('hidden');
                }
            });
        }

        function copyGeneratedCode() {
            if (!generatedData) return;
            const text = generatedData.frameworkCode || generatedData.htmlCode;
            navigator.clipboard.writeText(text).then(() => {
                alert("Copied to clipboard!");
            });
        }
    