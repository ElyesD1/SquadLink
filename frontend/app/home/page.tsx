'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiCheck, FiArrowRight, FiLogOut } from 'react-icons/fi';
import { Zap } from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import { useTheme } from 'next-themes';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  background: string;
  gradient: string;
  color: string;
}

const games: Game[] = [
  {
    id: 'league-of-legends',
    name: 'League of Legends',
    description: 'Strategic team battles in the Rift',
    icon: '/league.png',
    background: '/lol_bg.jpg',
    gradient: 'from-blue-600 to-gold-400',
    color: 'border-blue-500'
  },
  {
    id: 'valorant',
    name: 'Valorant',
    description: 'Tactical FPS with precise gunplay',
    icon: '/valorant.png',
    background: '/valorant_bg.jpg',
    gradient: 'from-red-500 to-orange-400',
    color: 'border-red-500'
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    description: 'Build, battle, and survive together',
    icon: '/fortnite.png',
    background: '/fortnite_bg.jpg',
    gradient: 'from-purple-500 to-pink-400',
    color: 'border-purple-500'
  }
];

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use the current theme from next-themes
  const currentTheme = theme || 'dark';
  const [checkingPreferences, setCheckingPreferences] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // Check if user already has game preferences
    if (status === 'authenticated' && session?.user?.email) {
      checkExistingPreferences();
    }
  }, [status, router, session]);

  const checkExistingPreferences = async () => {
    try {
      const response = await fetch('http://localhost:3001/users/profile/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email
        }),
      });

      if (response.ok) {
        const userProfile = await response.json();
        if (userProfile.gamePreferences && userProfile.gamePreferences.length > 0) {
          // User already has game preferences, redirect to profile
          router.push('/profile');
          return;
        }
        // No need to set theme here as next-themes handles it
      }
    } catch (error) {
      console.error('Error checking user preferences:', error);
    } finally {
      setCheckingPreferences(false);
    }
  };

  const handleGameToggle = (gameId: string) => {
    setSelectedGames(prev => 
      prev.includes(gameId) 
        ? prev.filter(id => id !== gameId)
        : [...prev, gameId]
    );
  };

  // Dynamic theme backgrounds
  const getBackgroundClass = (theme: string) => {
    return theme === 'light' 
      ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      : 'bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118]';
  };

  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  const getHoverBackgroundClass = (theme: string) => {
    return theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10';
  };

  const handleContinue = async () => {
    if (selectedGames.length === 0) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/users/game-preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamePreferences: selectedGames,
          email: session?.user?.email
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save game preferences');
      }

      // Redirect to profile page
      router.push('/profile');
    } catch (error) {
      console.error('Error saving game preferences:', error);
      // Still redirect to profile
      router.push('/profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    storage.clearAutoLogin();
    signOut({ callbackUrl: '/' });
  };

  if (!mounted || status === 'loading' || checkingPreferences) {
    return (
      <div className={`min-h-screen ${getBackgroundClass(currentTheme)} flex items-center justify-center`}>
        <div className={`${getTextClass(currentTheme)} text-2xl`}>
          {status === 'loading' ? 'Loading...' : 'Checking preferences...'}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${getBackgroundClass(currentTheme)}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[100px] -top-48 -left-48"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div 
          className="absolute w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] -bottom-48 -right-48"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-12">
          <AnimatedLogo size="md" />
          
          <div className="flex items-center gap-4">
            <div className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
              {session?.user?.email}
            </div>
            <button
              onClick={() => signOut()}
              className={`p-2 ${getSecondaryTextClass(currentTheme)} hover:${getTextClass(currentTheme)} ${getHoverBackgroundClass(currentTheme)} rounded-lg transition-colors`}
            >
              <FiLogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
                        <h2 className={`text-4xl md:text-5xl font-black ${getTextClass(currentTheme)} mb-4`}>
              Choose Your Gaming World
            </h2>
            <p className={`text-xl ${getSecondaryTextClass(currentTheme)} max-w-2xl mx-auto`}>
              Select the games you're passionate about to find your perfect gaming community
            </p>
          </motion.div>

          {/* Game Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card 
                  className={`group relative overflow-hidden cursor-pointer transition-all duration-300 ${
                    selectedGames.includes(game.id) 
                      ? `ring-2 ring-offset-2 ring-offset-transparent ${game.color} bg-white/10` 
                      : 'bg-white/5 hover:bg-white/10 border-white/20 hover:border-white/30'
                  }`}
                  onClick={() => handleGameToggle(game.id)}
                >
                  {/* Background Image */}
                  <div className="absolute inset-0">
                    <Image
                      src={game.background}
                      alt={game.name}
                      fill
                      className="object-cover opacity-80 transition-opacity duration-300"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${game.gradient} opacity-10`} />
                  </div>

                  <CardContent className="relative p-6 h-64 flex flex-col justify-between">
                    {/* Selection Indicator */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Image
                          src={game.icon}
                          alt={game.name}
                          width={32}
                          height={32}
                          className="w-8 h-8"
                        />
                      </div>
                      {selectedGames.includes(game.id) && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                        >
                          <FiCheck className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div>
                      <h3 className="text-white text-xl font-bold mb-2">{game.name}</h3>
                      <p className="text-white/80 text-sm">{game.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center"
          >
            <Button
              onClick={handleContinue}
              disabled={selectedGames.length === 0 || isLoading}
              className={`px-8 py-3 text-lg font-semibold ${
                selectedGames.length > 0 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              } transition-all duration-300`}
            >
              {isLoading ? (
                'Saving...'
              ) : (
                <>
                  Continue with {selectedGames.length} game{selectedGames.length !== 1 ? 's' : ''}
                  <FiArrowRight className="ml-2 w-5 h-5" />
                </>
              )}
            </Button>
            {selectedGames.length === 0 && (
              <p className={`${getSecondaryTextClass(currentTheme)} text-sm mt-2`}>
                Select at least one game to continue
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
