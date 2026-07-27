const fs = require('fs');

const themeMobileMenuHTML = `
        <!-- Divider -->
        <div class="h-px bg-slate-100 dark:bg-slate-800 w-full my-2"></div>
        <!-- Theme Toggle -->
        <div class="px-3 py-2 relative">
            <button id="theme-menu-btn" class="w-full px-4 py-3.5 flex justify-between items-center text-[15px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                <span>Theme</span>
                <svg class="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </button>
            
            <!-- Theme Dropdown Popover -->
            <div id="theme-popover" class="absolute bottom-[100%] right-3 mb-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 hidden flex-col gap-1 z-50">
                <button onclick="setTheme('light')" id="theme-light-btn" class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-900 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                    <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        Light
                    </div>
                    <svg class="w-4 h-4 text-violet-600 hidden check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button onclick="setTheme('dark')" id="theme-dark-btn" class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                    <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                        Dark
                    </div>
                    <svg class="w-4 h-4 text-violet-600 hidden check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
                <button onclick="setTheme('system')" id="theme-system-btn" class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition">
                    <div class="flex items-center gap-3">
                        <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        System
                    </div>
                    <svg class="w-4 h-4 text-violet-600 hidden check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                </button>
            </div>
        </div>
`;

const themeScript = `
<script>
    function updateThemeUI(theme) {
        // Update check icons in mobile menu
        ['light', 'dark', 'system'].forEach(t => {
            const btn = document.getElementById('theme-' + t + '-btn');
            if (btn) {
                const check = btn.querySelector('.check-icon');
                if (t === theme) {
                    check.classList.remove('hidden');
                    btn.classList.add('bg-slate-50', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white');
                    btn.classList.remove('text-slate-600', 'dark:text-slate-300');
                } else {
                    check.classList.add('hidden');
                    btn.classList.remove('bg-slate-50', 'dark:bg-slate-800', 'text-slate-900', 'dark:text-white');
                    btn.classList.add('text-slate-600', 'dark:text-slate-300');
                }
            }
        });
    }

    function setTheme(theme) {
        if (theme === 'system') {
            localStorage.removeItem('theme');
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        } else {
            localStorage.theme = theme;
            if (theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
        updateThemeUI(theme);
    }

    // Initialize Theme (Default Light)
    let initialTheme = 'light';
    if (localStorage.theme === 'dark') {
        document.documentElement.classList.add('dark');
        initialTheme = 'dark';
    } else if (localStorage.theme === 'light') {
        document.documentElement.classList.remove('dark');
        initialTheme = 'light';
    } else if (!('theme' in localStorage)) {
        // By default light theme as requested, ignore system dark mode
        document.documentElement.classList.remove('dark');
        initialTheme = 'light';
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateThemeUI(initialTheme);
        
        // Desktop Toggle Button
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                if (document.documentElement.classList.contains('dark')) {
                    setTheme('light');
                } else {
                    setTheme('dark');
                }
            });
        }
        
        // Mobile Theme Menu Popover Logic
        const mobileThemeBtn = document.getElementById('theme-menu-btn');
        const themePopover = document.getElementById('theme-popover');
        if(mobileThemeBtn && themePopover) {
            mobileThemeBtn.addEventListener('click', (e) => {
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
                if(!themePopover.contains(e.target) && !mobileThemeBtn.contains(e.target)) {
                    themePopover.classList.add('hidden');
                    themePopover.classList.remove('flex');
                }
            });
        }
    });
</script>
`;

const files = [
    'index.html',
    'tools/index.html',
    'pricing/index.html',
    'tools/image-to-code/index.html',
    'tools/handwriting-to-text/index.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');
    
    // Add CSS * Selector
    if (!content.includes('* { font-family: "Poppins"')) {
        content = content.replace(/<style>/, '<style>\n        * { font-family: "Poppins", sans-serif !important; }');
        content = content.replace(/<style>/, '<style>\n        * { font-family: "Poppins", sans-serif !important; }'); // Just in case it missed, usually replaces first occurrence. Actually let's use a better replace:
        // Reset and do precise replacement
        content = fs.readFileSync(file, 'utf8');
        content = content.replace(/<style>/, '<style>\n        * { font-family: "Poppins", sans-serif !important; }');
    }

    // Insert Mobile Theme Menu HTML
    if (content.includes('<!-- Mobile Menu Modal -->') && !content.includes('id="theme-popover"')) {
        const linkEnd = content.indexOf('</div>\n    </div>\n</div>\n<script>');
        if (linkEnd !== -1) {
            content = content.substring(0, linkEnd) + themeMobileMenuHTML + content.substring(linkEnd);
        } else {
            // Alternative match
            const altEnd = content.indexOf('</div>\n    </div>\n</div>\n    \n    <script>');
            if (altEnd !== -1) {
                content = content.substring(0, altEnd) + themeMobileMenuHTML + content.substring(altEnd);
            }
        }
    }
    
    // Replace old theme script with new robust one
    if (content.includes('// Theme setup')) {
        content = content.replace(/<script>\s*\/\/ Theme setup[\s\S]*?<\/script>/, themeScript);
    } else {
        // Find existing theme setup logic and replace it
        const themeSetupStart = content.indexOf('if (localStorage.theme === \\'dark\\' || (!(\\'theme\\' in localStorage) && window.matchMedia(\\'(prefers-color-scheme: dark)\\').matches))');
        if (themeSetupStart !== -1) {
            const scriptTagStart = content.lastIndexOf('<script>', themeSetupStart);
            const scriptTagEnd = content.indexOf('</script>', themeSetupStart) + 9;
            content = content.substring(0, scriptTagStart) + themeScript + content.substring(scriptTagEnd);
        }
    }

    fs.writeFileSync(file, content);
    console.log('Fixed', file);
});
