'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: number | null;
  connectionType: string | null;
}

export function useOfflineMode(): OfflineState {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<number | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  const updateOnlineStatus = useCallback(() => {
    const online = navigator.onLine;

    // Get connection type if available
    let connType = null;
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connType = connection?.effectiveType || connection?.type || null;
    }

    setIsOnline(online);
    setConnectionType(connType);

    if (online && !isOnline) {
      // Just came back online
      setLastOnlineTime(Date.now());
      setWasOffline(true);
    } else if (!online && isOnline) {
      // Just went offline
      setWasOffline(true);
    }
  }, [isOnline]);

  const checkConnection = useCallback(async () => {
    try {
      // Try to fetch a small resource to verify actual connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    // Initial check
    updateOnlineStatus();

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Periodic connectivity check every 30 seconds
    const interval = setInterval(async () => {
      const isActuallyOnline = await checkConnection();
      if (isActuallyOnline !== isOnline) {
        updateOnlineStatus();
      }
    }, 30000);

    // Check connection type changes if supported
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', updateOnlineStatus);
      }
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);

      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', updateOnlineStatus);
        }
      }

      clearInterval(interval);
    };
  }, [updateOnlineStatus, checkConnection, isOnline]);

  return {
    isOnline,
    wasOffline,
    lastOnlineTime,
    connectionType
  };
}