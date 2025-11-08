'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FiLogOut, FiEdit, FiX, FiChevronDown, FiLink } from 'react-icons/fi';
import { Zap, Sun, Moon } from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import LolAccountLinking from '@/components/ui/LolAccountLinking';
import LolProfileDisplay from '@/components/ui/LolProfileDisplay';
import { useTheme } from 'next-themes';
import { lolService, type LolAccount } from '@/lib/lol-service';
import { useOffline } from '@/lib/useOffline';
import { OfflineBanner, OfflineDataMessage } from '@/components/ui/OfflineComponents';
import { API_URL } from '@/lib/constants';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  themePreference: string;
  gamePreferences: string[];
  lolAccount?: LolAccount;
}

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
      const response = await fetch(`${API_URL}/users/profile/full`, {
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
      const response = await fetch(`${API_URL}/users/profile-picture`, {
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
    // Update the user profile with the refreshed LoL account data
    console.log('[Profile] Updating profile with refreshed account data:', accountData);
    setUserProfile(prev => {
      const updated = prev ? {
        ...prev,
        lolAccount: accountData
      } : null;
      console.log('[Profile] Updated profile state:', updated);
      return updated;
    });
    
    // Show a success notification
    console.log('LoL account data refreshed successfully!', accountData);
  };

  const handleLolAccountUnlink = () => {
    setUserProfile(prev => prev ? {
      ...prev,
      lolAccount: undefined
    } : null);
  };

  if (!mounted || status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-[#050a15] relative overflow-hidden flex items-center justify-center">
        {/* Tech background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px]"></div>
        
        <div className="relative z-10 text-center">
          <AnimatedLogo size="lg" variant="futuristic" />
          <p className="text-cyan-400 mt-4 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">LOADING PROFILE...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-[#050a15] relative overflow-hidden flex items-center justify-center">
        {/* Tech background */}
        <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px]"></div>
        
        <div className="relative z-10 text-center">
          <p className="text-cyan-400 text-2xl font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">PROFILE NOT FOUND</p>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-[#050a15] relative overflow-hidden">
      {/* Futuristic Background Layers */}
      
      {/* Animated grid pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]"></div>
      
      {/* Large glowing orbs */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#5383E8]/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Scan lines effect */}
      <div className="fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
      
      {/* Diagonal tech lines */}
      <div className="fixed inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
        <div className="absolute top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#5383E8]/30 to-transparent"></div>
        <div className="absolute bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
      </div>
      
      {/* Circuit pattern overlay */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 border-l-2 border-t-2 border-cyan-400"></div>
        <div className="absolute top-10 right-10 w-20 h-20 border-r-2 border-t-2 border-cyan-400"></div>
        <div className="absolute bottom-10 left-10 w-20 h-20 border-l-2 border-b-2 border-cyan-400"></div>
        <div className="absolute bottom-10 right-10 w-20 h-20 border-r-2 border-b-2 border-cyan-400"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen p-6">
        {/* Header */}
        <header className="max-w-7xl mx-auto flex items-center justify-center mb-12">
          <AnimatedLogo size="md" variant="futuristic" />
        </header>

        <OfflineDataMessage dataType="profile" className="max-w-6xl mx-auto mb-6" />

        {/* Main Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] relative overflow-hidden"
            >
              {/* Top tech line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
              
              {/* Side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40"></div>

              <h3 className="text-sm font-bold text-cyan-400 font-mono tracking-wider uppercase mb-6 text-center drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                PROFILE
              </h3>

              <div className="space-y-6 relative z-10">
                {/* Profile Picture */}
                <div className="text-center">
                  <div className="relative inline-block group">
                    {/* Outer glow ring */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-[#5383E8] to-cyan-400 opacity-40 blur-lg rounded-full"></div>
                    
                    <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#1a2f4a] flex items-center justify-center border-2 border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.4)]">
                      {userProfile.profilePicture ? (
                        <Image
                          src={userProfile.profilePicture}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-cyan-400 text-4xl font-bold font-mono drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]">
                          {userProfile.firstName[0]}{userProfile.lastName[0]}
                        </div>
                      )}
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-transparent"></div>
                    </div>
                    
                    <button
                      onClick={() => setShowAvatarSelector(true)}
                      className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white p-2 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:shadow-[0_0_25px_rgba(0,255,255,0.6)] transition-all group"
                    >
                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                      <FiEdit className="w-4 h-4 relative z-10" />
                    </button>
                  </div>
                </div>

                {/* User Info */}
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black text-white font-mono tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    {userProfile.firstName} {userProfile.lastName}
                  </h2>
                  <p className="text-sm text-gray-400 font-mono">{userProfile.email}</p>
                </div>

                {/* Theme Preference */}
                <div className="space-y-3 pt-4 border-t border-cyan-400/20">
                  <span className="text-white font-mono font-bold text-sm tracking-wider uppercase">Theme</span>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className="w-full bg-gradient-to-r from-[#0a1628]/80 to-[#1a2f4a]/80 border border-cyan-400/30 shadow-[0_0_15px_rgba(83,131,232,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)] hover:border-cyan-400/50 transition-all duration-300 flex items-center justify-center gap-3 p-4 relative overflow-hidden group"
                    >
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/50"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/50"></div>
                      
                      <motion.div
                        initial={false}
                        animate={{ rotate: theme === 'dark' ? 0 : 180 }}
                        transition={{ duration: 0.5 }}
                        className="relative z-10"
                      >
                        {theme === 'dark' ? 
                          <Sun className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" /> : 
                          <Moon className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
                        }
                      </motion.div>
                      <span className="text-white font-mono font-bold text-sm relative z-10">
                        {theme === 'dark' ? 'LIGHT MODE' : 'DARK MODE'}
                      </span>
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Game Preferences */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] relative overflow-hidden"
            >
              {/* Top tech line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
              
              {/* Side accent */}
              <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
              
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40"></div>

              <div className="relative z-10">
                {/* League of Legends Account Section */}
                <div className="mt-6 pt-6 border-t border-cyan-400/20">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-mono font-bold tracking-wider uppercase text-sm flex items-center gap-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        <Image
                          src="/logo.png"
                          alt="League of Legends"
                          width={24}
                          height={24}
                          className="w-6 h-6 drop-shadow-[0_0_8px_rgba(0,255,255,0.4)]"
                        />
                        LEAGUE OF LEGENDS ACCOUNT
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
                        <div className="text-gray-400 font-mono text-sm mb-4">
                          Link your League of Legends account to show your rank and stats
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setShowLolLinking(true)}
                          className="bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white px-6 py-3 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all duration-300 relative overflow-hidden group"
                        >
                          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                          <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider uppercase relative z-10">
                            <FiLink className="w-4 h-4" />
                            LINK LOL ACCOUNT
                          </div>
                        </motion.button>
                      </div>
                    )}
                </div>
            </motion.div>
          </div>
        </div>
        
        {/* Logout Section */}
        <div className="max-w-6xl mx-auto mt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-red-400/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] relative overflow-hidden"
          >
            {/* Top tech line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"></div>
            
            {/* Side accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-red-500 to-transparent shadow-[0_0_10px_#ef4444]"></div>
            
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-red-400/40"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-red-400/40"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-red-400/40"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-red-400/40"></div>

            <div className="text-center space-y-4 relative z-10">
              <h3 className="text-sm font-bold text-red-400 font-mono tracking-wider uppercase flex items-center justify-center gap-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                <FiLogOut className="w-4 h-4" />
                ACCOUNT ACTIONS
              </h3>
              
              <p className="text-gray-400 font-mono text-sm">
                Ready to take a break? You can sign out of your account here.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white px-8 py-3 border border-red-400/50 shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider uppercase relative z-10">
                  <FiLogOut className="w-4 h-4" />
                  SIGN OUT
                </div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] max-w-md w-full relative overflow-hidden"
          >
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50"></div>
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="text-lg font-bold text-cyan-400 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">CHOOSE AVATAR</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-400 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-400/10 border border-transparent hover:border-cyan-400/30"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 relative z-10">
              {avatars.map((avatar, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => updateProfilePicture(avatar)}
                  className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400/30 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.5)] transition-all relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <Image
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover relative z-10"
                  />
                </motion.button>
              ))}
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