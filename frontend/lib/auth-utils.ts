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
  
  // Clear all cookies related to NextAuth
  cookies.forEach(cookie => {
    const cookieName = cookie.split('=')[0].trim();
    
    // Clear NextAuth specific cookies
    if (
      cookieName.startsWith('next-auth') ||
      cookieName.startsWith('__Secure-next-auth') ||
      cookieName.startsWith('__Host-next-auth')
    ) {
      // Clear cookie for all possible paths and domains
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
    }
  });
}

/**
 * Clear all session storage and local storage auth data
 */
export function clearAllAuthStorage() {
  if (typeof window === 'undefined') return;
  
  try {
    // Clear all localStorage keys related to auth
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('auth') ||
        key.includes('token') ||
        key.includes('session') ||
        key.includes('user')
      )) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Clear all sessionStorage
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing auth storage:', error);
  }
}

/**
 * Complete auth reset - clears everything
 */
export function completeAuthReset() {
  clearAllAuthCookies();
  clearAllAuthStorage();
}
