const fs = require('fs');
const glob = require('glob');

const themeBtnHtml = `
                <button id="theme-btn" class="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition text-slate-600 dark:text-slate-300" aria-label="Toggle Theme">
                    <svg class="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                    <svg class="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                </button>
`;

const files = glob.sync('**/*.html', { ignore: ['node_modules/**', 'dist/**'] });
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // We only want to inject it in the main header (before mobile menu button)
    // If it's already in the header, skip.
    // To check if it's in the header, we can check if it exists right before `<!-- Mobile menu button -->`
    // Or we can just check if there is an <button id="theme-btn" BEFORE the mobile menu modal.
    
    // Let's just check if it has `<button id="theme-btn"` that is NOT the one inside the mobile menu popover or if the mobile menu popover has one...
    // The mobile menu popover doesn't have `id="theme-btn"`, it has `id="theme-menu-btn"`.
    
    if (content.includes('<!-- Mobile menu button -->')) {
        // If there's already `<button id="theme-btn" class="p-2` we might have it already.
        if (!content.includes('id="theme-btn" class="p-2')) {
            content = content.replace('<!-- Mobile menu button -->', themeBtnHtml + '                <!-- Mobile menu button -->');
            fs.writeFileSync(file, content);
            console.log(`Updated ${file}`);
        }
    }
}
