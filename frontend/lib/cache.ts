'use client';

import { storage } from './storage';

// Cache configuration
const CACHE_CONFIG = {
  USER_PROFILE: 'cached_user_profile',
  ESPORTS_LEAGUES: 'cached_esports_leagues',
  ESPORTS_TOURNAMENTS: 'cached_esports_tournaments',
  ESPORTS_TEAMS: 'cached_esports_teams',
  ESPORTS_SCHEDULE: 'cached_esports_schedule',
  ESPORTS_STANDINGS: 'cached_esports_standings',
  PARTIES_LIST: 'cached_parties_list',
  USER_PREFERENCES: 'cached_user_preferences',
  CACHE_TIMESTAMP: 'cache_timestamp',
  CACHE_VERSION: 'cache_version'
} as const;

const CACHE_VERSION = '1.0.0';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CacheMetadata {
  timestamp: number;
  version: string;
  expiresAt: number;
}

interface CachedData<T> {
  data: T;
  metadata: CacheMetadata;
}

// Enhanced storage with caching capabilities
export const cache = {
  // Set data with automatic metadata
  set: <T>(key: string, data: T): void => {
    if (typeof window === 'undefined') return;

    const metadata: CacheMetadata = {
      timestamp: Date.now(),
      version: CACHE_VERSION,
      expiresAt: Date.now() + CACHE_EXPIRY
    };

    const cachedData: CachedData<T> = {
      data,
      metadata
    };

    try {
      localStorage.setItem(key, JSON.stringify(cachedData));
    } catch (error) {
      console.warn('Failed to cache data:', error);
      // If storage is full, try to clear old cache
      cache.clearExpired();
      try {
        localStorage.setItem(key, JSON.stringify(cachedData));
      } catch (retryError) {
        console.error('Failed to cache data after cleanup:', retryError);
      }
    }
  },

  // Get data with expiry check
  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const cachedData: CachedData<T> = JSON.parse(stored);

      // Check if cache is expired
      if (Date.now() > cachedData.metadata.expiresAt) {
        cache.remove(key);
        return null;
      }

      // Check if cache version is outdated
      if (cachedData.metadata.version !== CACHE_VERSION) {
        cache.remove(key);
        return null;
      }

      return cachedData.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      cache.remove(key);
      return null;
    }
  },

  // Check if data exists and is valid
  has: (key: string): boolean => {
    return cache.get(key) !== null;
  },

  // Remove specific cache entry
  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },

  // Clear all expired cache entries
  clearExpired: (): void => {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cached_'));

    cacheKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const cachedData = JSON.parse(stored);
          if (Date.now() > cachedData.metadata.expiresAt) {
            localStorage.removeItem(key);
          }
        }
      } catch (error) {
        // Remove corrupted cache entries
        localStorage.removeItem(key);
      }
    });
  },

  // Clear all cache
  clearAll: (): void => {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key =>
      key.startsWith('cached_') ||
      key === CACHE_CONFIG.CACHE_TIMESTAMP ||
      key === CACHE_CONFIG.CACHE_VERSION
    );

    cacheKeys.forEach(key => localStorage.removeItem(key));
  },

  // Get cache metadata
  getMetadata: (key: string): CacheMetadata | null => {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;

      const cachedData = JSON.parse(stored);
      return cachedData.metadata;
    } catch {
      return null;
    }
  },

  // Cache user profile data
  setUserProfile: (profile: any): void => {
    cache.set(CACHE_CONFIG.USER_PROFILE, profile);
  },

  getUserProfile: (): any => {
    return cache.get(CACHE_CONFIG.USER_PROFILE);
  },

  // Cache esports data
  setEsportsLeagues: (leagues: any[]): void => {
    cache.set(CACHE_CONFIG.ESPORTS_LEAGUES, leagues);
  },

  getEsportsLeagues: (): any[] => {
    return cache.get(CACHE_CONFIG.ESPORTS_LEAGUES) || [];
  },

  setEsportsTournaments: (tournaments: any[]): void => {
    cache.set(CACHE_CONFIG.ESPORTS_TOURNAMENTS, tournaments);
  },

  getEsportsTournaments: (): any[] => {
    return cache.get(CACHE_CONFIG.ESPORTS_TOURNAMENTS) || [];
  },

  setEsportsTeams: (teams: any[]): void => {
    cache.set(CACHE_CONFIG.ESPORTS_TEAMS, teams);
  },

  getEsportsTeams: (): any[] => {
    return cache.get(CACHE_CONFIG.ESPORTS_TEAMS) || [];
  },

  setEsportsSchedule: (schedule: any[]): void => {
    cache.set(CACHE_CONFIG.ESPORTS_SCHEDULE, schedule);
  },

  getEsportsSchedule: (): any[] => {
    return cache.get(CACHE_CONFIG.ESPORTS_SCHEDULE) || [];
  },

  setEsportsStandings: (standings: any): void => {
    cache.set(CACHE_CONFIG.ESPORTS_STANDINGS, standings);
  },

  getEsportsStandings: (): any => {
    return cache.get(CACHE_CONFIG.ESPORTS_STANDINGS);
  },

  // Cache parties data
  setPartiesList: (parties: any[]): void => {
    cache.set(CACHE_CONFIG.PARTIES_LIST, parties);
  },

  getPartiesList: (): any[] => {
    return cache.get(CACHE_CONFIG.PARTIES_LIST) || [];
  },

  // Cache user preferences
  setUserPreferences: (preferences: any): void => {
    cache.set(CACHE_CONFIG.USER_PREFERENCES, preferences);
  },

  getUserPreferences: (): any => {
    return cache.get(CACHE_CONFIG.USER_PREFERENCES);
  },

  // Initialize cache on app start
  initialize: (): void => {
    if (typeof window === 'undefined') return;

    // Set cache version
    localStorage.setItem(CACHE_CONFIG.CACHE_VERSION, CACHE_VERSION);

    // Clear expired cache entries
    cache.clearExpired();

    // Set initialization timestamp
    localStorage.setItem(CACHE_CONFIG.CACHE_TIMESTAMP, Date.now().toString());
  },

  // Get cache statistics
  getStats: () => {
    if (typeof window === 'undefined') return null;

    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter(key => key.startsWith('cached_'));

    let totalSize = 0;
    let validEntries = 0;
    let expiredEntries = 0;

    cacheKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          totalSize += stored.length;
          const cachedData = JSON.parse(stored);
          if (Date.now() > cachedData.metadata.expiresAt) {
            expiredEntries++;
          } else {
            validEntries++;
          }
        }
      } catch {
        // Corrupted entry
      }
    });

    return {
      totalEntries: cacheKeys.length,
      validEntries,
      expiredEntries,
      totalSizeBytes: totalSize,
      totalSizeKB: Math.round(totalSize / 1024 * 100) / 100
    };
  }
};

// Initialize cache when module loads
if (typeof window !== 'undefined') {
  cache.initialize();
}