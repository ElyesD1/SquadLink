/**
 * Auth utility functions for managing sessions and cookies
 */

/**
 * Clear all NextAuth cookies to ensure clean session
 * This is critical to prevent stale user data from persisting
 */
export function clearAllAuthCookies() {
  if (typeof window === 'undefined') return;
  
  // Get all cookies
  const cookies = document.cookie.split(';');
  
  // Clear all cookies (not just NextAuth ones)
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    
    // Multiple deletion attempts with different configurations
    const deletionConfigs = [
      { path: '/', domain: '' },
      { path: '/', domain: window.location.hostname },
      { path: '/', domain: `.${window.location.hostname}` },
      { path: '/', domain: window.location.hostname.split('.').slice(-2).join('.') },
      { path: '/', domain: `.${window.location.hostname.split('.').slice(-2).join('.')}` },
      { path: '/api/auth', domain: '' },
      { path: '/api/auth', domain: window.location.hostname },
    ];
    
    deletionConfigs.forEach(config => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${config.path}; ${config.domain ? `domain=${config.domain};` : ''} SameSite=Lax`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${config.path}; ${config.domain ? `domain=${config.domain};` : ''} SameSite=Strict`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${config.path}; ${config.domain ? `domain=${config.domain};` : ''} SameSite=None; Secure`;
    });
  });
  
  // Force clear any remaining cookies
  document.cookie.split(';').forEach(c => {
    document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
  });
}

/**
 * Clear all session storage and local storage auth data
 */
export function clearAllAuthStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear ALL localStorage
    localStorage.clear();
    
    // Clear all sessionStorage
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
}

/**
 * Clear IndexedDB storage (sometimes used by NextAuth)
 */
export async function clearIndexedDB() {
  if (typeof window === 'undefined') return;
  
  try {
    const dbs = await window.indexedDB.databases();
    dbs.forEach(db => {
      if (db.name) {
        window.indexedDB.deleteDatabase(db.name);
      }
    });
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
  }
}

/**
 * Complete auth reset - clears everything aggressively
 */
export async function completeAuthReset() {
  clearAllAuthCookies();
  clearAllAuthStorage();
  await clearIndexedDB();
  
  // Additional aggressive clearing
  if (typeof window !== 'undefined') {
    try {
      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
    } catch (error) {
      console.error('Error clearing caches:', error);
    }
  }
}
