'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiLogOut, FiEdit, FiPlus, FiTrash2, FiX, FiChevronDown, FiLink } from 'react-icons/fi';
import { Zap, Sun, Moon } from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import LolAccountLinking from '@/components/ui/LolAccountLinking';
import LolProfileDisplay from '@/components/ui/LolProfileDisplay';
import { useTheme } from 'next-themes';
import { lolService, type LolAccount } from '@/lib/lol-service';
import { useOffline } from '@/lib/useOffline';
import { OfflineBanner, OfflineDataMessage } from '@/components/ui/OfflineComponents';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  themePreference: string;
  gamePreferences: string[];
  lolAccount?: LolAccount;
}

interface Game {
  id: string;
  name: string;
  icon: string;
}

const availableGames: Game[] = [
  { id: 'league-of-legends', name: 'League of Legends', icon: '/league.png' },
  { id: 'valorant', name: 'Valorant', icon: '/valorant.png' },
  { id: 'fortnite', name: 'Fortnite', icon: '/fortnite.png' }
];

const avatars = [
  '/a1.png', '/a2.png', '/a3.png', '/a4.png',
  '/a5.png', '/a6.png', '/a7.png', '/a8.png'
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('👤');
  const [showGameSelector, setShowGameSelector] = useState(false);
  const [selectedGames, setSelectedGames] = useState<string[]>([]);
  const [showLolLinking, setShowLolLinking] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use the current theme from next-themes
  const currentTheme = theme || 'dark';

  // Theme helper functions
  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      fetchUserProfile();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
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
        const profile = await response.json();
        setUserProfile(profile);
        // Set the theme from user profile if it exists
        if (profile.themePreference && profile.themePreference !== theme) {
          setTheme(profile.themePreference);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfilePicture = async (avatar: string) => {
    try {
      const response = await fetch('http://localhost:3001/users/profile-picture', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          profilePicture: avatar,
          email: session?.user?.email 
        }),
      });

      if (response.ok) {
        setUserProfile(prev => prev ? { ...prev, profilePicture: avatar } : null);
        setShowAvatarSelector(false);
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
    }
  };

  const addGamePreference = async (gameId: string) => {
    try {
      const response = await fetch('http://localhost:3001/users/game-preferences/add', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          game: gameId,
          email: session?.user?.email 
        }),
      });

      if (response.ok) {
        setUserProfile(prev => prev ? {
          ...prev,
          gamePreferences: [...prev.gamePreferences, gameId]
        } : null);
        setShowGameSelector(false);
      }
    } catch (error) {
      console.error('Error adding game preference:', error);
    }
  };

  const removeGamePreference = async (gameId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/users/game-preferences/${gameId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email
        }),
      });

      if (response.ok) {
        setUserProfile(prev => prev ? {
          ...prev,
          gamePreferences: prev.gamePreferences.filter(game => game !== gameId)
        } : null);
      }
    } catch (error) {
      console.error('Error removing game preference:', error);
    }
  };

  const handleLogout = () => {
    storage.clearAutoLogin();
    signOut({ callbackUrl: '/' });
  };

  const handleLolAccountSuccess = (accountData: any) => {
    // Refresh the user profile to get the updated LoL account data
    fetchUserProfile();
    setShowLolLinking(false);
  };

  const handleLolAccountRefresh = (accountData: LolAccount) => {
    setUserProfile(prev => prev ? {
      ...prev,
      lolAccount: accountData
    } : null);
  };

  const handleLolAccountUnlink = () => {
    setUserProfile(prev => prev ? {
      ...prev,
      lolAccount: undefined
    } : null);
  };

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118] flex items-center justify-center">
        <div className={`${getTextClass(currentTheme)} text-2xl`}>Loading profile...</div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118] flex items-center justify-center">
        <div className={`${getTextClass(currentTheme)} text-2xl`}>Profile not found</div>
      </div>
    );
  }

  const getGameById = (id: string) => availableGames.find(game => game.id === id);
  const availableGamesToAdd = availableGames.filter(game => 
    !userProfile.gamePreferences.includes(game.id)
  );

  // Show LoL Account Linking if requested
  if (showLolLinking) {
    return (
      <LolAccountLinking
        userEmail={userProfile.email}
        currentTheme={currentTheme}
        onBack={() => setShowLolLinking(false)}
        onSuccess={handleLolAccountSuccess}
      />
    );
  }

  return (
    <NavigationDrawer>
      <OfflineBanner />
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20" />
        
        {/* Floating Orbs */}
        <motion.div 
          className="absolute top-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        <motion.div 
          className="absolute bottom-20 -right-20 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
            y: [0, -50, 0],
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
        <header className="max-w-7xl mx-auto flex items-center justify-center mb-12">
          <AnimatedLogo size="md" />
        </header>

        <OfflineDataMessage dataType="profile" className="max-w-6xl mx-auto mb-6" />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className={`${getTextClass(currentTheme)} text-center`}>Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center border-4 border-white/20">
                      {userProfile.profilePicture ? (
                        <Image
                          src={userProfile.profilePicture}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`${getTextClass(currentTheme)} text-4xl font-bold`}>
                          {userProfile.firstName[0]}{userProfile.lastName[0]}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowAvatarSelector(true)}
                      className="absolute -bottom-2 -right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition-colors"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-2">
                  <h2 className={`${getTextClass(currentTheme)} text-xl font-bold`}>
                    {userProfile.firstName} {userProfile.lastName}
                  </h2>
                  <p className={`${getSecondaryTextClass(currentTheme)}`}>{userProfile.email}</p>
                </div>

                {/* Theme Preference */}
                <div className="space-y-3">
                  <span className={`${getTextClass(currentTheme)} font-medium`}>Theme</span>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full border border-border/50 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 hover:border-purple-500/20 transition-all duration-300 flex items-center justify-center gap-3 p-4"
                    >
                      <motion.div
                        initial={false}
                        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                        transition={{ duration: 0.5 }}
                      >
                        {theme === 'dark' ? 
                          <Sun className="w-5 h-5 text-yellow-400" /> : 
                          <Moon className="w-5 h-5 text-purple-400" />
                        }
                      </motion.div>
                      <span className={`${getTextClass(currentTheme)} font-medium`}>
                        {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Preferences */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`${getTextClass(currentTheme)}`}>Game Preferences</CardTitle>
                  <Button
                    onClick={() => setShowGameSelector(true)}
                    disabled={availableGamesToAdd.length === 0}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Game
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {userProfile.gamePreferences.length === 0 ? (
                  <div className="text-center py-12">
                    <div className={`${getSecondaryTextClass(currentTheme)} text-lg mb-4`}>No games selected yet</div>
                    <Button
                      onClick={() => setShowGameSelector(true)}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <FiPlus className="w-4 h-4 mr-2" />
                      Add Your First Game
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.gamePreferences.map((gameId) => {
                      const game = getGameById(gameId);
                      if (!game) return null;

                      return (
                        <motion.div
                          key={gameId}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border border-border/50 shadow-lg shadow-purple-500/5 backdrop-blur-sm bg-card/80 rounded-xl p-4 flex items-center justify-between group hover:shadow-purple-500/10 hover:border-purple-500/20 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${currentTheme === 'light' ? 'bg-purple-100' : 'bg-purple-500/20'} rounded-lg flex items-center justify-center`}>
                              <Image
                                src={game.icon}
                                alt={game.name}
                                width={32}
                                height={32}
                                className="w-8 h-8"
                              />
                            </div>
                            <span className={`${getTextClass(currentTheme)} font-medium`}>{game.name}</span>
                          </div>
                          <button
                            onClick={() => removeGamePreference(gameId)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/20 p-2 rounded-lg transition-all"
                            title="Remove game"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* League of Legends Account Section */}
                {userProfile.gamePreferences.includes('league-of-legends') && (
                  <div className="mt-6 pt-6 border-t border-border/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`${getTextClass(currentTheme)} text-lg font-semibold flex items-center gap-2`}>
                        <Image
                          src="/logo.png"
                          alt="League of Legends"
                          width={24}
                          height={24}
                          className="w-6 h-6"
                        />
                        League of Legends Account
                      </h3>
                    </div>

                    {userProfile.lolAccount ? (
                      <LolProfileDisplay
                        lolAccount={userProfile.lolAccount}
                        userEmail={userProfile.email}
                        currentTheme={currentTheme}
                        onRefresh={handleLolAccountRefresh}
                        onUnlink={handleLolAccountUnlink}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className={`${getSecondaryTextClass(currentTheme)} text-sm mb-4`}>
                          Link your League of Legends account to show your rank and stats
                        </div>
                        <Button
                          onClick={() => setShowLolLinking(true)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <FiLink className="w-4 h-4 mr-2" />
                          Link LoL Account
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="max-w-6xl mx-auto mt-8">
          <Card className="border-2 border-red-500/20 shadow-2xl shadow-red-500/10 backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle className={`${getTextClass(currentTheme)} text-center flex items-center justify-center gap-2`}>
                <FiLogOut className="w-5 h-5 text-red-500" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className={`${getSecondaryTextClass(currentTheme)} mb-4`}>
                  Ready to take a break? You can sign out of your account here.
                </p>
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30"
                >
                  <FiLogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className={`fixed inset-0 ${currentTheme === 'light' ? 'bg-black/30' : 'bg-black/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-xl bg-card/95 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${getTextClass(currentTheme)} text-xl font-bold`}>Choose Avatar</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className={`${getSecondaryTextClass(currentTheme)} hover:${getTextClass(currentTheme)}`}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {avatars.map((avatar, index) => (
                <button
                  key={index}
                  onClick={() => updateProfilePicture(avatar)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 ${currentTheme === 'light' ? 'border-gray-300 hover:border-purple-500' : 'border-white/20 hover:border-purple-500'} transition-colors`}
                >
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* Game Selector Modal */}
      {showGameSelector && (
        <div className={`fixed inset-0 ${currentTheme === 'light' ? 'bg-black/30' : 'bg-black/50'} backdrop-blur-sm z-50 flex items-center justify-center p-4`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-xl bg-card/95 rounded-2xl p-6 max-w-md w-full"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${getTextClass(currentTheme)} text-xl font-bold`}>Add Game</h3>
              <button
                onClick={() => setShowGameSelector(false)}
                className={`${getSecondaryTextClass(currentTheme)} hover:${getTextClass(currentTheme)}`}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {availableGamesToAdd.length === 0 ? (
                <div className={`${getSecondaryTextClass(currentTheme)} text-center py-4`}>
                  All available games have been added!
                </div>
              ) : (
                availableGamesToAdd.map((game) => (
                  <button
                    key={game.id}
                    onClick={() => addGamePreference(game.id)}
                    className="w-full border border-border/50 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 flex items-center gap-3 transition-all duration-300"
                  >
                    <div className={`w-12 h-12 ${currentTheme === 'light' ? 'bg-purple-100' : 'bg-purple-500/20'} rounded-lg flex items-center justify-center`}>
                      <Image
                        src={game.icon}
                        alt={game.name}
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    </div>
                    <span className={`${getTextClass(currentTheme)} font-medium`}>{game.name}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* LoL Account Linking Modal */}
      {showLolLinking && (
        <LolAccountLinking
          userEmail={userProfile.email}
          onSuccess={handleLolAccountSuccess}
          onBack={() => setShowLolLinking(false)}
          currentTheme={currentTheme}
        />
      )}
    </div>
    </NavigationDrawer>
  );
}