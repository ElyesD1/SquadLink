'use client';

import { useOffline } from '@/lib/useOffline';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';

export function OfflineIndicator() {
  const isOffline = useOffline();

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 shadow-lg"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span className="font-semibold">Mode Hors Ligne</span>
            <span className="text-sm opacity-90">
              • Les données affichées sont mises en cache
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function OfflineBadge() {
  const isOffline = useOffline();

  return (
    <div className={`flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg ${
      isOffline ? 'animate-pulse' : ''
    }`}>
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-orange-500">Hors Ligne</span>
        </>
      ) : (
        <>
          <Wifi className="w-4 h-4 text-green-500" />
          <span className="text-xs font-medium text-green-500">En Ligne</span>
        </>
      )}
    </div>
  );
}
