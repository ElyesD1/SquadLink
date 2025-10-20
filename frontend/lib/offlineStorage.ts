// Offline storage utilities for caching data locally

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn?: number; // milliseconds
}

const CACHE_PREFIX = 'squadlink_offline_';

export const offlineStorage = {
  /**
   * Save data to local storage with timestamp
   */
  set<T>(key: string, data: T, expiresIn?: number): void {
    try {
      const cached: CachedData<T> = {
        data,
        timestamp: Date.now(),
        expiresIn,
      };
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cached));
    } catch (error) {
      console.error('Error saving to offline storage:', error);
    }
  },

  /**
   * Get data from local storage
   * Returns null if expired or not found
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(CACHE_PREFIX + key);
      if (!item) return null;

      const cached: CachedData<T> = JSON.parse(item);
      
      // Check if expired
      if (cached.expiresIn) {
        const isExpired = Date.now() - cached.timestamp > cached.expiresIn;
        if (isExpired) {
          this.remove(key);
          return null;
        }
      }

      return cached.data;
    } catch (error) {
      console.error('Error reading from offline storage:', error);
      return null;
    }
  },

  /**
   * Remove specific item from storage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (error) {
      console.error('Error removing from offline storage:', error);
    }
  },

  /**
   * Clear all cached data
   */
  clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing offline storage:', error);
    }
  },

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  },
};

// Cache keys for different data types
export const CACHE_KEYS = {
  PARTIES: 'parties',
  USER_PROFILE: 'user_profile',
  MY_PARTIES: 'my_parties',
  NOTIFICATIONS: 'notifications',
  LOL_ACCOUNT: 'lol_account',
};
