'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { OfflineProvider } from '../lib/useOffline';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <OfflineProvider>
          {children}
        </OfflineProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
