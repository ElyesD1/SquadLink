// Utility functions for localStorage operations
export const storage = {
  // Remember me functionality
  setRememberMe: (value: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rememberMe', JSON.stringify(value));
    }
  },

  getRememberMe: (): boolean => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('rememberMe');
      return stored ? JSON.parse(stored) : false;
    }
    return false;
  },

  // Auto-login session
  setAutoLogin: (userData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoLogin', JSON.stringify({
        ...userData,
        timestamp: Date.now()
      }));
    }
  },

  getAutoLogin: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('autoLogin');
      if (stored) {
        const data = JSON.parse(stored);
        // Check if data is less than 30 days old
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (Date.now() - data.timestamp < thirtyDays) {
          return data;
        } else {
          // Remove expired data
          localStorage.removeItem('autoLogin');
        }
      }
    }
    return null;
  },

  clearAutoLogin: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('autoLogin');
      localStorage.removeItem('rememberMe');
    }
  },

  // Theme preference (already exists but adding for completeness)
  setTheme: (theme: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
    }
  },

  getTheme: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  }
};