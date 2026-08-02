import { app, auth, db } from './firebase-config.js';
import { signInWithPopup, signInWithRedirect, signOut, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const provider = new GoogleAuthProvider();

window.handleLogin = async function() {
    if (!auth) {
        alert("Firebase Authentication is not configured or initialized on this domain. Please make sure 'toolimg.online' is added to Authorized Domains in Firebase Console (Authentication > Settings > Authorized domains).");
        return;
    }
    try {
        await signInWithPopup(auth, provider);
    } catch (error) {
        if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
            console.log('User closed the login popup.');
            return;
        }
        console.warn("Popup login failed, trying redirect method:", error);
        try {
            await signInWithRedirect(auth, provider);
        } catch (redirectError) {
            console.error("Login failed via redirect as well:", redirectError);
            alert("Login failed: " + (redirectError.message || error.message || String(error)) + "\n\nPlease ensure 'toolimg.online' is added to Authorized Domains in Firebase Console.");
        }
    }
};

window.handleLogout = async function() {
    if (!auth) return;
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed", error.message || String(error));
    }
};

// Also sync Auth state across pages for the UI
if (auth) {
    onAuthStateChanged(auth, (user) => {
        const headerAuthGuest = document.getElementById('header-auth-guest');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        const userAvatar = document.getElementById('user-avatar');
        const userFallback = document.getElementById('user-fallback');
        const headerHistoryBtn = document.getElementById('header-history-btn');
        const mobileAuthGuest = document.getElementById('mobile-auth-guest');
        const mobileAuthUser = document.getElementById('mobile-auth-user');
        const mobileUserName = document.getElementById('mobile-user-name');
        const dashboardNav = document.getElementById('dashboard-nav');
        const mobileDashboardNav = document.getElementById('mobile-dashboard-nav');

        if (user) {
            if (headerAuthGuest) {
                headerAuthGuest.style.display = '';
                headerAuthGuest.classList.add('hidden'); 
                headerAuthGuest.classList.remove('md:flex');
            }
            if(userMenu) userMenu.style.display = 'flex';
            if(userName) userName.textContent = user.displayName || user.email.split('@')[0];
            if(headerHistoryBtn) headerHistoryBtn.classList.remove('hidden');
            if (userAvatar) {
                if (user.photoURL) {
                    userAvatar.src = user.photoURL;
                    userAvatar.classList.remove('hidden');
                    if(userFallback) userFallback.classList.add('hidden');
                } else {
                    userAvatar.classList.add('hidden');
                    if(userFallback) userFallback.classList.remove('hidden');
                }
            }
            
            if(mobileAuthGuest) mobileAuthGuest.style.display = 'none';
            if(mobileAuthUser) mobileAuthUser.style.display = 'flex';
            if(mobileUserName) mobileUserName.textContent = user.displayName || user.email.split('@')[0];
            if(dashboardNav) dashboardNav.classList.remove('hidden');
            if(mobileDashboardNav) mobileDashboardNav.classList.remove('hidden');
        } else {
            if (headerAuthGuest) {
                headerAuthGuest.style.display = '';
                headerAuthGuest.classList.remove('hidden'); 
                headerAuthGuest.classList.add('md:flex');
            }
            if(userMenu) userMenu.style.display = 'none';
            if(headerHistoryBtn) headerHistoryBtn.classList.add('hidden');
            if(userAvatar) userAvatar.classList.add('hidden');
            
            if(mobileAuthGuest) mobileAuthGuest.style.display = 'flex';
            if(mobileAuthUser) mobileAuthUser.style.display = 'none';
            if(dashboardNav) dashboardNav.classList.add('hidden');
            if(mobileDashboardNav) mobileDashboardNav.classList.add('hidden');
        }
    });
}

window.getAuthToken = async function() {
    if (auth && auth.currentUser) {
        return await auth.currentUser.getIdToken();
    }
    return null;
};
