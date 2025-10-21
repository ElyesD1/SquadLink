'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useOffline } from './useOffline';
import { storage } from './storage';

interface AutoLoginState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: any;
  error: string | null;
}

export const useAutoLogin = (): AutoLoginState => {
  const { data: session, status } = useSession();
  const { isOnline, cachedData, isDataAvailable } = useOffline();
  const [autoLoginState, setAutoLoginState] = useState<AutoLoginState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    error: null,
  });

  useEffect(() => {
    const performAutoLogin = async () => {
      setAutoLoginState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // If we have an active session, use it
        if (status === 'authenticated' && session?.user) {
          setAutoLoginState({
            isLoading: false,
            isAuthenticated: true,
            user: session.user,
            error: null,
          });
          return;
        }

        // If online, let NextAuth handle authentication normally
        if (isOnline) {
          if (status === 'loading') {
            // Still loading, keep waiting
            return;
          }

          // Not authenticated and not loading means no session
          setAutoLoginState({
            isLoading: false,
            isAuthenticated: false,
            user: null,
            error: null,
          });
          return;
        }

        // Offline mode - try to use cached user data
        if (!isOnline) {
          const rememberMe = storage.getRememberMe();
          const cachedProfile = cachedData.userProfile;

          if (rememberMe && isDataAvailable('userProfile') && cachedProfile) {
            // Use cached profile for offline authentication
            setAutoLoginState({
              isLoading: false,
              isAuthenticated: true,
              user: {
                ...cachedProfile,
                offline: true, // Mark as offline session
              },
              error: null,
            });
          } else {
            // No cached data or remember me not enabled
            setAutoLoginState({
              isLoading: false,
              isAuthenticated: false,
              user: null,
              error: 'Offline mode requires cached login data. Please connect to the internet to log in.',
            });
          }
        }
      } catch (error) {
        console.error('Auto-login error:', error);
        setAutoLoginState({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          error: 'Failed to authenticate automatically',
        });
      }
    };

    performAutoLogin();
  }, [session, status, isOnline, cachedData.userProfile, isDataAvailable]);

  return autoLoginState;
};

// Hook for checking if user can perform certain actions offline
export const useOfflinePermissions = () => {
  const { isOnline, isDataAvailable } = useOffline();
  const { isAuthenticated } = useAutoLogin();

  return {
    canViewProfile: isAuthenticated && (isOnline || isDataAvailable('userProfile')),
    canViewEsports: isOnline || isDataAvailable('esportsLeagues'),
    canViewParties: isOnline || isDataAvailable('partiesList'),
    canCreateParty: isOnline, // Creating parties requires real-time connection
    canJoinParty: isOnline, // Joining parties requires WebSocket connection
    canEditProfile: isOnline, // Profile editing requires server sync
    canSendMessages: isOnline, // Real-time messaging requires connection
  };
};