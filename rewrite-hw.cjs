const fs = require('fs');

const violetThemeConfig = `
    <script>
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
    </script>
`;

const headerHTML = `
    <!-- Navbar -->
    <header class="w-full max-w-6xl mx-auto px-6 py-4 flex justify-between items-center bg-transparent">
        <a href="/" class="flex items-center gap-2">
            <img src="https://toolimg.online/blog/wp-content/uploads/2026/06/logo.png" alt="ToolIMG Logo" class="h-8 object-contain" onerror="this.src='data:image/svg+xml;utf8,<svg class=\\'w-7 h-7 text-violet-600\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8L19.2 12H17v6H7v-6H4.8L12 4.8z\\'/></svg>'">
            <span class="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">ToolIMG</span>
        </a>
        
        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-6">
            <a href="/" class="text-sm font-medium text-slate-600 hover:text-violet-600 transition">Home</a>
            <a href="/#tools" class="text-sm font-medium text-slate-600 hover:text-violet-600 transition">Tools</a>
            <a href="/tools/image-to-code/" class="text-sm font-medium text-slate-600 hover:text-violet-600 transition">Image to Code</a>
            <a href="/tools/handwriting-to-text/" class="text-sm font-medium text-slate-600 hover:text-violet-600 transition">Handwriting</a>
        </nav>
        
        <div class="flex items-center gap-3">
            <button id="login-btn" onclick="handleLogin()" class="px-4 py-2 text-sm font-medium text-slate-700 hover:text-black border border-slate-300 rounded-lg bg-white shadow-sm transition">Log in</button>
            <button id="signup-btn" onclick="handleLogin()" class="px-4 py-2 text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 rounded-lg shadow-sm transition">Sign up</button>
            <div id="user-menu" class="hidden items-center gap-3">
                <span id="user-name" class="text-sm font-medium text-slate-700"></span>
                <button onclick="handleLogout()" class="text-sm text-slate-500 hover:text-slate-700">Logout</button>
            </div>
            
            <!-- Mobile menu button -->
            <button id="mobile-menu-btn" class="md:hidden text-slate-600 hover:text-slate-900 transition ml-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
        </div>
    </header>
    
    <!-- Mobile Nav Menu (hidden by default) -->
    <div id="mobile-menu" class="hidden md:hidden bg-white border-b border-slate-200 px-6 py-4 absolute w-full z-50 shadow-sm left-0">
        <div class="flex flex-col gap-4">
            <a href="/" class="text-base font-medium text-slate-700 hover:text-violet-600 transition">Home</a>
            <a href="/#tools" class="text-base font-medium text-slate-700 hover:text-violet-600 transition">Tools</a>
            <a href="/tools/image-to-code/" class="text-base font-medium text-slate-700 hover:text-violet-600 transition">Image to Code</a>
            <a href="/tools/handwriting-to-text/" class="text-base font-medium text-slate-700 hover:text-violet-600 transition">Handwriting to Text</a>
        </div>
    </div>
    
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const btn = document.getElementById('mobile-menu-btn');
            const menu = document.getElementById('mobile-menu');
            if(btn && menu) {
                btn.addEventListener('click', () => {
                    menu.classList.toggle('hidden');
                });
            }
        });
    </script>
`;

const footerHTML = `
    <!-- Footer -->
    <footer class="bg-white border-t border-slate-200 mt-auto">
        <div class="max-w-6xl mx-auto px-6 py-12">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div class="md:col-span-1">
                    <a href="/" class="flex items-center gap-2 mb-4">
                        <img src="https://toolimg.online/blog/wp-content/uploads/2026/06/logo.png" alt="ToolIMG Logo" class="h-8 object-contain" onerror="this.src='data:image/svg+xml;utf8,<svg class=\\'w-7 h-7 text-violet-600\\' viewBox=\\'0 0 24 24\\' fill=\\'currentColor\\' xmlns=\\'http://www.w3.org/2000/svg\\'><path d=\\'M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8L19.2 12H17v6H7v-6H4.8L12 4.8z\\'/></svg>'">
                        <span class="font-bold text-xl tracking-tight text-slate-800">ToolIMG</span>
                    </a>
                    <p class="text-slate-500 text-sm">Advanced AI vision tools designed for simplicity and efficiency. We extract code and text from your images instantly.</p>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4">Our Tools</h4>
                    <ul class="space-y-3">
                        <li><a href="/tools/image-to-code/" class="text-sm text-slate-500 hover:text-violet-600 transition">Image to Code</a></li>
                        <li><a href="/tools/handwriting-to-text/" class="text-sm text-slate-500 hover:text-violet-600 transition">Handwriting to Text</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4">Resources</h4>
                    <ul class="space-y-3">
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">Blog</a></li>
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">API Documentation</a></li>
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">Pricing</a></li>
                    </ul>
                </div>
                <div>
                    <h4 class="font-semibold text-slate-900 mb-4">Legal</h4>
                    <ul class="space-y-3">
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">Privacy Policy</a></li>
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">Terms of Service</a></li>
                        <li><a href="#" class="text-sm text-slate-500 hover:text-violet-600 transition">Contact Us</a></li>
                    </ul>
                </div>
            </div>
            <div class="pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p class="text-sm text-slate-400">© 2026 ToolIMG. All rights reserved.</p>
            </div>
        </div>
    </footer>
`;

const firebaseScriptsHTML = `
    <!-- Firebase Scripts -->
    <script type="module">
      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
      import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
      
      const firebaseConfig = {
          apiKey: "AIzaSyCFyGzp7viV1tq25DAMnpKKSJpPngtVa14",
          authDomain: "gen-lang-client-0844549707.firebaseapp.com",
          projectId: "gen-lang-client-0844549707",
          firestoreDatabaseId: "ai-studio-toolimg-a40860b9-3db9-4eab-a65f-f070e159a9b3",
          storageBucket: "gen-lang-client-0844549707.firebasestorage.app",
          messagingSenderId: "845800015860",
          appId: "1:845800015860:web:a6229be704605991785ba1"
      };
      
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();

      window.handleLogin = async function() {
          try {
              await signInWithPopup(auth, provider);
          } catch (error) {
              console.error("Login failed", error);
          }
      };

      window.handleLogout = async function() {
          try {
              await signOut(auth);
          } catch (error) {
              console.error("Logout failed", error);
          }
      };

      onAuthStateChanged(auth, (user) => {
          const loginBtn = document.getElementById('login-btn');
          const signupBtn = document.getElementById('signup-btn');
          const userMenu = document.getElementById('user-menu');
          const userName = document.getElementById('user-name');
          
          if (user) {
              if(loginBtn) loginBtn.style.display = 'none';
              if(signupBtn) signupBtn.style.display = 'none';
              if(userMenu) userMenu.style.display = 'flex';
              if(userName) userName.textContent = user.displayName || user.email;
          } else {
              if(loginBtn) loginBtn.style.display = 'block';
              if(signupBtn) signupBtn.style.display = 'block';
              if(userMenu) userMenu.style.display = 'none';
          }
      });
    </script>
`;

const hwHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Handwriting to Text Converter AI - ToolIMG</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    ${violetThemeConfig}
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background-color: #fafafa; }
        .hero-gradient { background: radial-gradient(circle at 50% -20%, #ede9fe 0%, transparent 40%); }
    </style>
</head>
<body class="hero-gradient text-slate-800 min-h-screen flex flex-col">
    ${headerHTML}

    <!-- Main Content -->
    <main class="flex-grow max-w-5xl mx-auto w-full px-6 py-12 flex flex-col">
        <div class="text-center mb-10">
            <h1 class="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                Handwriting to <span class="text-violet-600">Text</span>
            </h1>
            <p class="text-lg text-slate-500 max-w-2xl mx-auto">
                Upload a photo of your handwritten notes, and our AI will extract the text for you instantly.
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-grow">
            <!-- Left Panel: Upload -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col shadow-sm">
                <div class="mb-6">
                    <h2 class="text-xl font-bold text-slate-900">Upload Note</h2>
                    <p class="text-sm text-slate-500">Take a clear picture of your handwriting.</p>
                </div>

                <div id="upload-zone" onclick="document.getElementById('file-input').click()" class="flex-grow border-2 border-dashed border-slate-300 hover:border-violet-500 hover:bg-violet-50/50 rounded-2xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden group">
                    <input type="file" id="file-input" class="hidden" accept="image/png, image/jpeg, image/webp" onchange="handleFileSelect(event)">
                    
                    <div id="upload-placeholder" class="flex flex-col items-center">
                        <div class="w-16 h-16 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center mb-4">
                            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                        </div>
                        <h3 class="font-bold text-slate-800 text-lg mb-1">Click to Upload Image</h3>
                        <p class="text-sm text-slate-500">JPG, PNG or WEBP</p>
                    </div>

                    <img id="image-preview" class="absolute inset-0 w-full h-full object-contain hidden" />
                    
                    <div id="image-overlay" class="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 hidden flex items-center justify-center transition">
                        <span class="bg-white text-slate-900 font-bold px-4 py-2 rounded-xl text-sm shadow-sm">Change Image</span>
                    </div>
                </div>

                <button id="extract-btn" onclick="extractText()" disabled class="mt-6 w-full py-4 rounded-xl bg-violet-600 disabled:bg-slate-300 disabled:cursor-not-allowed hover:bg-violet-700 text-white font-bold text-lg transition flex items-center justify-center gap-2 shadow-sm">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Extract Text
                </button>
            </div>

            <!-- Right Panel: Result -->
            <div class="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 flex flex-col shadow-sm">
                <div class="flex justify-between items-center mb-6">
                    <div>
                        <h2 class="text-xl font-bold text-slate-900">Extracted Text</h2>
                        <p class="text-sm text-slate-500">Your digitized text will appear here.</p>
                    </div>
                    <button id="copy-btn" onclick="copyText()" class="hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition border border-slate-200 shadow-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        Copy
                    </button>
                </div>

                <div id="result-container" class="flex-grow bg-slate-50 rounded-2xl border border-slate-200 p-5 overflow-auto relative text-slate-700 min-h-[300px]">
                    <div id="empty-state" class="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                        <svg class="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        <p class="text-sm">Waiting for image...</p>
                    </div>
                    
                    <div id="loading-state" class="hidden absolute inset-0 flex flex-col items-center justify-center bg-slate-50/90 z-10">
                        <div class="w-10 h-10 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                        <p class="text-violet-700 font-semibold animate-pulse">Extracting text...</p>
                    </div>

                    <div id="text-output" class="hidden whitespace-pre-wrap font-medium leading-relaxed"></div>
                </div>
            </div>
        </div>

        <div class="mt-16 bg-white border border-slate-200 rounded-3xl p-8 max-w-3xl mx-auto shadow-sm w-full">
            <h3 class="text-2xl font-bold text-slate-900 mb-6 text-center">Frequently Asked Questions</h3>
            
            <div class="space-y-4">
                <div class="border-b border-slate-200 pb-4">
                    <h4 class="font-bold text-slate-800 mb-2">What is a handwriting to text converter AI?</h4>
                    <p class="text-slate-600 text-sm">It's a smart tool that uses vision models to read handwritten notes, sketches, and documents, turning them into selectable, copyable digital text instantly.</p>
                </div>
                <div class="border-b border-slate-200 pb-4">
                    <h4 class="font-bold text-slate-800 mb-2">Is this the best handwriting to text converter online free?</h4>
                    <p class="text-slate-600 text-sm">Yes, ToolIMG provides advanced AI models to ensure high accuracy in reading messy handwriting, entirely free of charge for casual users.</p>
                </div>
                <div class="border-b border-slate-200 pb-4">
                    <h4 class="font-bold text-slate-800 mb-2">How do I use this handwriting to text converter?</h4>
                    <p class="text-slate-600 text-sm">Simply click on the upload box, select your image (or drag and drop it), and click "Extract Text". The AI will process your image and output the text.</p>
                </div>
            </div>
        </div>
    </main>

    ${footerHTML}
    ${firebaseScriptsHTML}

    <script>
        let currentBase64 = null;

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                currentBase64 = result.split(',')[1];
                
                // Update UI
                document.getElementById('upload-placeholder').classList.add('hidden');
                
                const preview = document.getElementById('image-preview');
                preview.src = result;
                preview.classList.remove('hidden');
                
                document.getElementById('image-overlay').classList.remove('hidden');
                document.getElementById('extract-btn').disabled = false;
                
                // Reset states
                document.getElementById('empty-state').classList.remove('hidden');
                document.getElementById('text-output').classList.add('hidden');
                document.getElementById('copy-btn').classList.add('hidden');
            };
            reader.readAsDataURL(file);
        }

        async function extractText() {
            if (!currentBase64) return;
            
            document.getElementById('empty-state').classList.add('hidden');
            document.getElementById('text-output').classList.add('hidden');
            document.getElementById('loading-state').classList.remove('hidden');
            document.getElementById('extract-btn').disabled = true;
            document.getElementById('copy-btn').classList.add('hidden');

            try {
                const response = await fetch('https://toolimg-ocr.vercel.app/api/handwriting', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ base64Data: currentBase64 })
                });

                const data = await response.json();
                
                if (data.error) throw new Error(data.error);

                document.getElementById('loading-state').classList.add('hidden');
                
                const out = document.getElementById('text-output');
                out.textContent = data.markdownSummary || data.htmlCode || data.frameworkCode || "No text extracted.";
                out.classList.remove('hidden');
                
                document.getElementById('copy-btn').classList.remove('hidden');

            } catch (err) {
                console.error(err);
                alert("Error extracting text: " + err.message);
                document.getElementById('loading-state').classList.add('hidden');
                document.getElementById('empty-state').classList.remove('hidden');
            } finally {
                document.getElementById('extract-btn').disabled = false;
            }
        }

        function copyText() {
            const text = document.getElementById('text-output').textContent;
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copy-btn');
                const origHtml = btn.innerHTML;
                btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Copied!';
                setTimeout(() => { btn.innerHTML = origHtml; }, 2000);
            });
        }
    </script>
</body>
</html>
`;

fs.writeFileSync('tools/handwriting-to-text/index.html', hwHTML);

