
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
    