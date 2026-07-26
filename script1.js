
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
