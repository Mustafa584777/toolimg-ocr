// assets/history.js - Centralized History Manager for ToolIMG
import { auth, db } from '/assets/firebase-config.js';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, collection, setDoc, getDocs, deleteDoc, query, orderBy, limit, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const GUEST_HISTORY_KEY = 'toolimg_guest_history';

// Toast Notification Helper
export function showToast(message, type = 'info') {
    const existing = document.getElementById('toolimg-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'toolimg-toast';
    toast.className = `fixed bottom-5 right-5 z-[10000] px-4 py-3 rounded-2xl shadow-2xl border text-sm font-semibold flex items-center gap-2.5 transition-all duration-300 transform translate-y-10 opacity-0 ${
        type === 'error' 
            ? 'bg-rose-900/90 text-rose-100 border-rose-700/50' 
            : type === 'success'
            ? 'bg-emerald-900/90 text-emerald-100 border-emerald-700/50'
            : 'bg-slate-900/90 text-slate-100 border-slate-700/50 backdrop-blur-md'
    }`;
    toast.innerHTML = `
        <svg class="w-5 h-5 shrink-0 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove('translate-y-10', 'opacity-0');
    });

    setTimeout(() => {
        toast.classList.add('translate-y-10', 'opacity-0');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// 1. Save History Item
export async function saveHistoryItem({ toolId, toolName, title, content, previewUrl = '', metadata = {} }) {
    const guestId = localStorage.getItem('guest_id') || ('guest_' + Math.random().toString(36).substring(2, 10));
    
    // Safely truncate content if overly large for storage (keep up to 100KB per result item)
    const truncatedContent = typeof content === 'string' && content.length > 100000 
        ? content.substring(0, 100000) + '\n...[Truncated]' 
        : content;

    const item = {
        id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        toolId: toolId || 'tool',
        toolName: toolName || 'ToolIMG Utility',
        title: title || (typeof truncatedContent === 'string' ? truncatedContent.substring(0, 60).trim() + '...' : 'Conversion Result'),
        content: truncatedContent || '',
        previewUrl: previewUrl || '',
        metadata: metadata || {},
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
        guestId: guestId
    };

    const user = auth.currentUser;
    if (user) {
        try {
            const historyRef = doc(db, 'users', user.uid, 'history', item.id);
            await setDoc(historyRef, {
                ...item,
                userId: user.uid
            });
            console.log('History saved to Firestore for user:', user.uid);
        } catch (err) {
            console.error('Error saving history to Firestore:', err);
            saveToLocalStorage(item);
        }
    } else {
        saveToLocalStorage(item);
    }

    window.dispatchEvent(new CustomEvent('historyUpdated', { detail: item }));
    return item;
}

function saveToLocalStorage(item) {
    try {
        const existing = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]');
        existing.unshift(item);
        if (existing.length > 50) existing.pop(); // Cap local history to 50 items
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(existing));
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
}

// 2. Sync Guest History on Login
export async function syncGuestHistory(user) {
    if (!user) return;
    try {
        const guestItems = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]');
        if (!guestItems || guestItems.length === 0) return;

        let syncedCount = 0;
        for (const item of guestItems) {
            if (item && item.id) {
                const historyRef = doc(db, 'users', user.uid, 'history', item.id);
                await setDoc(historyRef, {
                    ...item,
                    userId: user.uid,
                    syncedFromGuest: true
                });
                syncedCount++;
            }
        }

        localStorage.removeItem(GUEST_HISTORY_KEY);
        if (syncedCount > 0) {
            showToast(`🎉 Synced ${syncedCount} guest conversion history items to your account!`, 'success');
            window.dispatchEvent(new CustomEvent('historyUpdated'));
        }
    } catch (err) {
        console.error('Failed to sync guest history:', err);
    }
}

// 3. Fetch History Items
export async function fetchHistoryItems({ toolId = null } = {}) {
    const user = auth.currentUser;
    let items = [];

    if (user) {
        try {
            const historyColRef = collection(db, 'users', user.uid, 'history');
            const q = query(historyColRef, orderBy('timestamp', 'desc'), limit(100));
            const snapshot = await getDocs(q);
            snapshot.forEach(docSnap => {
                items.push(docSnap.data());
            });
        } catch (err) {
            console.error('Error fetching history from Firestore:', err);
            items = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]');
        }
    } else {
        items = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]');
    }

    if (toolId && toolId !== 'all') {
        items = items.filter(it => it.toolId === toolId);
    }

    return items;
}

// 4. Delete History Item
export async function deleteHistoryItem(itemId) {
    const user = auth.currentUser;
    if (user) {
        try {
            const itemRef = doc(db, 'users', user.uid, 'history', itemId);
            await deleteDoc(itemRef);
        } catch (err) {
            console.error('Error deleting item from Firestore:', err);
        }
    }

    // Also remove from local storage if present
    try {
        let existing = JSON.parse(localStorage.getItem(GUEST_HISTORY_KEY) || '[]');
        existing = existing.filter(it => it.id !== itemId);
        localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(existing));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('historyUpdated'));
    showToast('Item removed from history.');
}

// 5. Clear All History
export async function clearAllHistory() {
    const user = auth.currentUser;
    if (user) {
        try {
            const historyColRef = collection(db, 'users', user.uid, 'history');
            const snapshot = await getDocs(historyColRef);
            const promises = snapshot.docs.map(d => deleteDoc(d.ref));
            await Promise.all(promises);
        } catch (err) {
            console.error('Error clearing Firestore history:', err);
        }
    }

    localStorage.removeItem(GUEST_HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('historyUpdated'));
    showToast('All conversion history cleared.');
}

// Listen to auth state changes to trigger guest history sync automatically
onAuthStateChanged(auth, (user) => {
    if (user) {
        syncGuestHistory(user);
    }
});

// Trigger Google Auth from history UI
export async function handleHistoryLogin() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (err) {
        if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
            console.log('User closed the login popup.');
            return;
        }
        console.error('Login failed:', err);
        showToast('Login failed: ' + err.message, 'error');
    }
}

// Export for global window scope usage
window.ToolIMGHistory = {
    saveHistoryItem,
    syncGuestHistory,
    fetchHistoryItems,
    deleteHistoryItem,
    clearAllHistory,
    handleHistoryLogin,
    showToast
};
