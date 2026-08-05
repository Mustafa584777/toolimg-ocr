// assets/history-ui.js - Drawer and Modal UI Manager for ToolIMG History
import { fetchHistoryItems, deleteHistoryItem, clearAllHistory, showToast, handleHistoryLogin } from './history.js';
import { auth, db } from './firebase-config.js';
import { onSnapshot, doc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentToolId = 'all'; // Default
let activeFilter = 'this'; // 'this' or 'all'
let cachedItems = [];

export function initHistoryUI(toolId = 'image-to-code') {
    currentToolId = toolId;
    if (toolId === 'all') {
        activeFilter = 'all';
    }
    
    // Dynamically inject history-drawer HTML if it does not exist
    if (!document.getElementById('history-drawer')) {
        const drawerDiv = document.createElement('div');
        drawerDiv.id = 'history-drawer';
        drawerDiv.className = 'fixed inset-0 z-[1000] hidden overflow-hidden transition-all duration-300';
        drawerDiv.innerHTML = `
    <div id="history-drawer-backdrop" onclick="closeHistoryDrawer()" class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm opacity-0 transition-opacity duration-300"></div>
    <div class="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div id="history-drawer-panel" class="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transform translate-x-full transition-transform duration-300">
            
            <div class="px-6 py-5 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                    <div class="p-2 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 rounded-xl">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-900 dark:text-white">Conversion History</h3>
                        <p class="text-xs text-slate-500 dark:text-slate-400">View & reload saved results</p>
                    </div>
                </div>
                <button onclick="closeHistoryDrawer()" class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-xl transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>

            <div id="history-guest-banner" class="hidden mx-4 mt-4 p-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-2xl shadow-md">
                <div class="flex items-start gap-3">
                    <div class="p-2 bg-white/20 rounded-xl shrink-0 mt-0.5">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 002-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                    </div>
                    <div class="flex-grow">
                        <h4 class="text-xs font-extrabold uppercase tracking-wider text-violet-200">Guest Session History</h4>
                        <p class="text-xs mt-1 text-violet-100 leading-relaxed">Your results are currently saved locally. Log in or sign up to permanently sync & back up your history across all devices!</p>
                        <button onclick="if (window.handleLogin) { window.handleLogin(); } else { window.ToolIMGHistory.handleHistoryLogin(); }" class="mt-3 px-3.5 py-1.5 bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/></svg>
                            <span>Log In to Sync History</span>
                        </button>
                    </div>
                </div>
            </div>

            <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div class="flex gap-1.5 overflow-x-auto text-xs">
                    <button onclick="setHistoryFilter('this')" id="hist-tab-this" class="px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition">This Tool</button>
                    <button onclick="setHistoryFilter('all')" id="hist-tab-all" class="px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition">All Tools</button>
                </div>
                <button onclick="clearHistoryWithConfirm()" class="text-xs font-bold text-rose-500 hover:text-rose-600 transition px-2.5 py-1 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg">
                    Clear All
                </button>
            </div>

            <div id="history-drawer-list" class="flex-grow overflow-y-auto p-4 space-y-3"></div>
            
        </div>
    </div>
        `;
        document.body.appendChild(drawerDiv);
    }

    // Hide "This Tool" filter if in 'all' context
    const thisTab = document.getElementById('hist-tab-this');
    const allTab = document.getElementById('hist-tab-all');
    if (thisTab && allTab && currentToolId === 'all') {
        thisTab.classList.add('hidden');
        allTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition';
    } else if (thisTab && allTab) {
        thisTab.classList.remove('hidden');
        if (activeFilter === 'this') {
            thisTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition';
            allTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        } else {
            allTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition';
            thisTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        }
    }
    
    // Listen for history updates
    window.addEventListener('historyUpdated', () => {
        updateBadgeCount();
        if (isDrawerOpen()) {
            loadAndRenderHistory();
        }
    });

    // Initial badge update
    updateBadgeCount();
}

export function isDrawerOpen() {
    const drawer = document.getElementById('history-drawer');
    return drawer && !drawer.classList.contains('hidden');
}

export async function openHistoryDrawer() {
    const drawer = document.getElementById('history-drawer');
    const backdrop = document.getElementById('history-drawer-backdrop');
    const panel = document.getElementById('history-drawer-panel');

    if (!drawer) return;

    drawer.classList.remove('hidden');
    void drawer.offsetWidth; // Reflow

    if (backdrop) backdrop.classList.remove('opacity-0');
    if (panel) panel.classList.remove('translate-x-full');

    await loadAndRenderHistory();
}

export function closeHistoryDrawer() {
    const drawer = document.getElementById('history-drawer');
    const backdrop = document.getElementById('history-drawer-backdrop');
    const panel = document.getElementById('history-drawer-panel');

    if (!drawer) return;

    if (backdrop) backdrop.classList.add('opacity-0');
    if (panel) panel.classList.add('translate-x-full');

    setTimeout(() => {
        drawer.classList.add('hidden');
    }, 300);
}

export function setHistoryFilter(filterType) {
    activeFilter = filterType;
    const thisTab = document.getElementById('hist-tab-this');
    const allTab = document.getElementById('hist-tab-all');

    if (filterType === 'this') {
        if (thisTab) {
            thisTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition';
        }
        if (allTab) {
            allTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        }
    } else {
        if (allTab) {
            allTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-violet-600 text-white shadow-sm transition';
        }
        if (thisTab) {
            thisTab.className = 'px-3 py-1.5 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition';
        }
    }

    renderFilteredItems();
}

async function updateBadgeCount() {
    try {
        const items = await fetchHistoryItems({ toolId: currentToolId });
        const badge = document.getElementById('history-badge-count');
        if (badge) {
            if (items.length > 0) {
                badge.textContent = items.length;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    } catch (e) {}
}

export async function loadAndRenderHistory() {
    const listContainer = document.getElementById('history-drawer-list');
    const guestBanner = document.getElementById('history-guest-banner');

    if (listContainer) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                <svg class="w-8 h-8 animate-spin text-violet-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span class="text-xs font-semibold">Loading history...</span>
            </div>
        `;
    }

    const currentUser = auth.currentUser;

    if (guestBanner) {
        if (!currentUser) {
            guestBanner.classList.remove('hidden');
        } else {
            guestBanner.classList.add('hidden');
        }
    }

    try {
        cachedItems = await fetchHistoryItems({ toolId: 'all' });
        renderFilteredItems();
    } catch (err) {
        console.error('Error rendering history list:', err);
        if (listContainer) {
            listContainer.innerHTML = `<div class="p-4 text-xs text-rose-500 font-semibold text-center">Failed to load history items.</div>`;
        }
    }
}

function renderFilteredItems() {
    const listContainer = document.getElementById('history-drawer-list');
    if (!listContainer) return;

    let itemsToDisplay = cachedItems;
    if (activeFilter === 'this' && currentToolId !== 'all') {
        itemsToDisplay = cachedItems.filter(it => it.toolId === currentToolId);
    }

    if (!itemsToDisplay || itemsToDisplay.length === 0) {
        listContainer.innerHTML = `
            <div class="flex flex-col items-center justify-center py-16 text-center text-slate-400 space-y-3">
                <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-400">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div>
                    <p class="text-sm font-bold text-slate-700 dark:text-slate-300">No History Items</p>
                    <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Perform a conversion to save your results here.</p>
                </div>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = itemsToDisplay.map(item => {
        const toolBadgeColor = 
            item.toolId === 'image-to-code' ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300' :
            item.toolId === 'handwriting-to-text' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
            item.toolId === 'hindi-handwriting-to-text' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' :
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';

        const formattedDate = item.createdAt ? new Date(item.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recently';

        return `
            <div class="p-4 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-3 group hover:border-violet-300 dark:hover:border-violet-800 transition">
                <div class="flex items-center justify-between">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${toolBadgeColor}">
                        ${item.toolName || item.toolId}
                    </span>
                    <span class="text-[11px] text-slate-400">${formattedDate}</span>
                </div>

                <div>
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">${escapeHtml(item.title || 'Result')}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 font-mono bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        ${escapeHtml(item.content || '')}
                    </p>
                </div>

                <div class="flex items-center justify-between pt-1">
                    <div class="flex gap-2">
                        <button onclick="copyHistoryContent('${item.id}')" class="px-2.5 py-1 text-[11px] font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 rounded-lg transition flex items-center gap-1 shadow-2xs">
                            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                            <span>Copy</span>
                        </button>
                        ${item.toolId === currentToolId ? `
                        <button onclick="loadHistoryIntoTool('${item.id}')" class="px-2.5 py-1 text-[11px] font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition flex items-center gap-1 shadow-2xs">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                            <span>Load</span>
                        </button>
                        ` : ''}
                    </div>

                    <button onclick="deleteHistoryItem('${item.id}')" class="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition" title="Delete">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

export function copyContent(itemId) {
    const item = cachedItems.find(it => it.id === itemId);
    if (item && item.content) {
        navigator.clipboard.writeText(item.content);
        showToast('Copied to clipboard!', 'success');
    }
}

export function loadIntoTool(itemId) {
    const item = cachedItems.find(it => it.id === itemId);
    if (!item) return;

    if (window.handleLoadHistoryItem && typeof window.handleLoadHistoryItem === 'function') {
        window.handleLoadHistoryItem(item);
        closeHistoryDrawer();
        showToast('Loaded result into workspace!', 'success');
    } else {
        copyContent(itemId);
        showToast('Copied result text to clipboard!');
    }
}

export async function deleteItem(itemId) {
    await deleteHistoryItem(itemId);
    cachedItems = cachedItems.filter(it => it.id !== itemId);
    renderFilteredItems();
}

export async function clearHistoryWithConfirm() {
    if (confirm('Are you sure you want to clear all conversion history? This action cannot be undone.')) {
        await clearAllHistory();
        cachedItems = [];
        renderFilteredItems();
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

window.ToolIMGHistoryUI = {
    initHistoryUI,
    openHistoryDrawer,
    closeHistoryDrawer,
    setHistoryFilter,
    copyContent,
    loadIntoTool,
    deleteItem,
    clearHistoryWithConfirm,
    loadAndRenderHistory,
    updateBadgeCount
};

// Also expose common actions directly on window for easier access from HTML
window.openHistoryDrawer = openHistoryDrawer;
window.closeHistoryDrawer = closeHistoryDrawer;
window.setHistoryFilter = setHistoryFilter;
window.copyHistoryContent = copyContent;
window.loadHistoryIntoTool = loadIntoTool;
window.deleteHistoryItem = deleteItem;
window.clearHistoryWithConfirm = clearHistoryWithConfirm;
