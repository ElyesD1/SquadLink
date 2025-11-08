'use client';

import { useEffect, useState } from 'react';

export function PWADiagnostics() {
  const [diagnostics, setDiagnostics] = useState<any>({});

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPWA = async () => {
      const diag: any = {
        isInstalled: window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone,
        hasServiceWorker: 'serviceWorker' in navigator,
        isHTTPS: location.protocol === 'https:' || location.hostname === 'localhost',
        manifestExists: false,
        serviceWorkerRegistered: false,
      };

      // Check if manifest exists
      try {
        const manifestResponse = await fetch('/manifest.json');
        diag.manifestExists = manifestResponse.ok;
        if (manifestResponse.ok) {
          const manifest = await manifestResponse.json();
          diag.manifestData = manifest;
        }
      } catch (e) {
        console.error('Manifest check failed:', e);
      }

      // Check service worker
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          diag.serviceWorkerRegistered = !!registration;
          diag.serviceWorkerState = registration?.active?.state;
        } catch (e) {
          console.error('Service worker check failed:', e);
        }
      }

      // Check install prompt
      let deferredPrompt: any;
      window.addEventListener('beforeinstallprompt', (e) => {
        deferredPrompt = e;
        diag.installPromptAvailable = true;
        setDiagnostics({ ...diag });
      });

      diag.installPromptAvailable = !!deferredPrompt;

      setDiagnostics(diag);
    };

    checkPWA();
  }, []);

  // Only show in development or if there are issues
  if (process.env.NODE_ENV === 'production' && diagnostics.isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">PWA Diagnostics</div>
      <div className="space-y-1">
        <div>Installed: {diagnostics.isInstalled ? '✅' : '❌'}</div>
        <div>HTTPS: {diagnostics.isHTTPS ? '✅' : '❌'}</div>
        <div>Manifest: {diagnostics.manifestExists ? '✅' : '❌'}</div>
        <div>Service Worker: {diagnostics.serviceWorkerRegistered ? '✅' : '❌'}</div>
        <div>Install Prompt: {diagnostics.installPromptAvailable ? '✅' : '❌'}</div>
      </div>
    </div>
  );
}

