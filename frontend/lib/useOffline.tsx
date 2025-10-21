'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useOfflineMode } from './useOfflineMode';
import { cache } from './cache';

interface OfflineContextType {
  isOnline: boolean;
  isOfflineMode: boolean;
  connectionType: string | null;
  cachedData: {
    userProfile: any;
    esportsLeagues: any[];
    esportsTournaments: any[];
    esportsTeams: any[];
    esportsSchedule: any[];
    esportsStandings: any;
    partiesList: any[];
    userPreferences: any;
  };
  cacheStats: any;
  refreshCache: () => Promise<void>;
  clearCache: () => void;
  isDataAvailable: (dataType: keyof OfflineContextType['cachedData']) => boolean;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

interface OfflineProviderProps {
  children: ReactNode;
}

export const OfflineProvider: React.FC<OfflineProviderProps> = ({ children }) => {
  const { isOnline, connectionType } = useOfflineMode();
  const [cachedData, setCachedData] = useState<OfflineContextType['cachedData']>({
    userProfile: null,
    esportsLeagues: [],
    esportsTournaments: [],
    esportsTeams: [],
    esportsSchedule: [],
    esportsStandings: null,
    partiesList: [],
    userPreferences: null,
  });
  const [cacheStats, setCacheStats] = useState<any>(null);

  // Load cached data on mount and when coming back online
  const loadCachedData = () => {
    const data = {
      userProfile: cache.getUserProfile(),
      esportsLeagues: cache.getEsportsLeagues(),
      esportsTournaments: cache.getEsportsTournaments(),
      esportsTeams: cache.getEsportsTeams(),
      esportsSchedule: cache.getEsportsSchedule(),
      esportsStandings: cache.getEsportsStandings(),
      partiesList: cache.getPartiesList(),
      userPreferences: cache.getUserPreferences(),
    };
    setCachedData(data);
    setCacheStats(cache.getStats());
  };

  // Refresh cache with fresh data (when online)
  const refreshCache = async (): Promise<void> => {
    if (!isOnline) return;

    try {
      // This would typically fetch fresh data from APIs
      // For now, we'll just reload from cache
      loadCachedData();
    } catch (error) {
      console.error('Failed to refresh cache:', error);
    }
  };

  // Clear all cached data
  const clearCache = (): void => {
    cache.clearAll();
    setCachedData({
      userProfile: null,
      esportsLeagues: [],
      esportsTournaments: [],
      esportsTeams: [],
      esportsSchedule: [],
      esportsStandings: null,
      partiesList: [],
      userPreferences: null,
    });
    setCacheStats(null);
  };

  // Check if specific data type is available in cache
  const isDataAvailable = (dataType: keyof OfflineContextType['cachedData']): boolean => {
    const data = cachedData[dataType];
    if (Array.isArray(data)) {
      return data.length > 0;
    }
    return data !== null && data !== undefined;
  };

  // Load cached data on mount
  useEffect(() => {
    loadCachedData();
  }, []);

  // Reload cache when coming back online
  useEffect(() => {
    if (isOnline) {
      loadCachedData();
    }
  }, [isOnline]);

  // Periodic cache cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      cache.clearExpired();
      setCacheStats(cache.getStats());
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(cleanupInterval);
  }, []);

  const value: OfflineContextType = {
    isOnline,
    isOfflineMode: !isOnline,
    connectionType,
    cachedData,
    cacheStats,
    refreshCache,
    clearCache,
    isDataAvailable,
  };

  return (
    <OfflineContext.Provider value={value}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};