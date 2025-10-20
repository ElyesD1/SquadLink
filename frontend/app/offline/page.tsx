'use client';

import { motion } from 'framer-motion';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function OfflinePage() {
  const router = useRouter();

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/parties');
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <WifiOff className="w-24 h-24 text-orange-500 mx-auto" />
        </motion.div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Mode Hors Ligne
        </h1>

        <p className="text-white/60 mb-8 text-lg">
          Vous êtes actuellement hors ligne. Certaines fonctionnalités peuvent être limitées.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-white font-semibold mb-3">Fonctionnalités disponibles :</h2>
          <ul className="text-white/70 text-left space-y-2">
            <li>✅ Consulter les parties mises en cache</li>
            <li>✅ Voir votre profil</li>
            <li>❌ Créer de nouvelles parties</li>
            <li>❌ Rejoindre des parties</li>
            <li>❌ Notifications en temps réel</li>
          </ul>
        </div>

        <Button
          onClick={handleRetry}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Réessayer
        </Button>
      </motion.div>
    </div>
  );
}
