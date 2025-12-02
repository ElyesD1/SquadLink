'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { OfflineProvider } from '../lib/useOffline';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider 
      refetchInterval={0} 
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {/* Force app theme to a consistent value regardless of system theme */}
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <OfflineProvider>
          {children}
        </OfflineProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
