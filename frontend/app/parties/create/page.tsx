'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft,
  Users,
  Calendar,
  Lock,
  Globe,
  Mic,
  Shield
} from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import LoadingScreen from '@/components/ui/LoadingScreen';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useTheme } from 'next-themes';
import RoleSelector, { Position } from '@/components/ui/RoleSelector';
import { API_URL } from '@/lib/constants';

interface PartyFormData {
  name: string;
  description: string;
  gameMode: string;
  isPrivate: boolean;
  scheduledFor?: string;
  creatorPosition?: Position;
  preferences: {
    minRank?: string;
    voiceChat?: boolean;
    language?: string;
  };
}

const gameModes = [
  { 
    id: 'ranked_solo_duo', 
    label: 'Ranked Solo/Duo', 
    description: 'Duo queue only (2 players)',
    maxPlayers: 2,
    gradient: 'from-yellow-500 to-orange-500'
  },
  { 
    id: 'ranked_flex', 
    label: 'Ranked Flex', 
    description: 'Flexible ranked queue (5 players)',
    maxPlayers: 5,
    gradient: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'aram', 
    label: 'ARAM', 
    description: 'All Random All Mid (5 players)',
    maxPlayers: 5,
    gradient: 'from-green-500 to-teal-500'
  },
  { 
    id: 'draft_pick', 
    label: 'Draft Pick', 
    description: 'Normal draft mode (5 players)',
    maxPlayers: 5,
    gradient: 'from-purple-500 to-pink-500'
  }
];

const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

export default function CreatePartyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentTheme = theme || 'dark';

  const [formData, setFormData] = useState<PartyFormData>({
    name: '',
    description: '',
    gameMode: '',
    isPrivate: false,
    preferences: {
      voiceChat: false,
    }
  });

  const getTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-900' : 'text-white';
  };

  const getSecondaryTextClass = (theme: string) => {
    return theme === 'light' ? 'text-gray-600' : 'text-white/60';
  };

  const getBackgroundClass = (theme: string) => {
    return theme === 'light' 
      ? 'bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50'
      : 'bg-gradient-to-br from-[#0A0118] via-[#1A0B2E] to-[#0A0118]';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.gameMode) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate role selection for non-ARAM modes
    if (formData.gameMode !== 'aram' && !formData.creatorPosition) {
      alert('Please select your role');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/party`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          creatorEmail: session?.user?.email,
        }),
      });

      if (response.ok) {
        router.push('/parties');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create party');
      }
    } catch (error) {
      console.error('Error creating party:', error);
      alert('Failed to create party');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted || status === 'loading') {
    return <LoadingScreen variant="futuristic" />;
  }

  return (
    <NavigationDrawer>
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
          <header className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <AnimatedLogo size="md" variant="futuristic" />
              <button
                onClick={() => router.push('/parties')}
                className="bg-gradient-to-r from-[#5383E8]/20 to-cyan-400/20 hover:from-[#5383E8]/30 hover:to-cyan-400/30 border border-cyan-400/40 px-4 py-2 mr-16 transition-all duration-300 relative group"
              >
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400/60"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400/60"></div>
                <div className="flex items-center gap-2">
                  <ArrowLeft className="w-5 h-5 text-cyan-400" />
                  <span className="text-white font-mono uppercase text-sm tracking-wider">BACK TO PARTIES</span>
                </div>
              </button>
            </div>
          </header>

          <div className="max-w-4xl mx-auto">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.4)] uppercase">
                CREATE YOUR PARTY
              </h1>
              <p className="text-xl text-white/60 font-mono">
                Set up your squad and find teammates
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400/60 z-10"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400/60 z-10"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400/60 z-10"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400/60 z-10"></div>
              
              <form onSubmit={handleSubmit}>
                <div className="bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 border border-cyan-400/30 backdrop-blur-sm mb-6 p-6 space-y-6">
                  {/* Party Name */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                      PARTY NAME *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Gold+ Ranked Climb"
                      className="w-full px-4 py-3 bg-[#0a1628]/50 border border-cyan-400/30 text-white placeholder:text-white/40 placeholder:font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 font-mono"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                      DESCRIPTION
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your party and what you're looking for..."
                      rows={4}
                      className="w-full px-4 py-3 bg-[#0a1628]/50 border border-cyan-400/30 text-white placeholder:text-white/40 placeholder:font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 resize-none font-mono"
                    />
                  </div>

                  {/* Game Mode Selection */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-3 font-mono uppercase tracking-wider">
                      GAME MODE *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {gameModes.map((mode) => (
                        <motion.div
                          key={mode.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, gameMode: mode.id })}
                          className={`cursor-pointer p-4 border-2 transition-all duration-300 relative ${
                            formData.gameMode === mode.id
                              ? 'border-cyan-400 bg-cyan-400/10'
                              : 'border-cyan-400/20 bg-[#0a1628]/30 hover:border-cyan-400/40'
                          }`}
                        >
                          {formData.gameMode === mode.id && (
                            <>
                              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                            </>
                          )}
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-bold text-white font-mono">
                                {mode.label}
                              </h3>
                              <p className="text-sm text-white/60 font-mono">
                                {mode.description}
                              </p>
                            </div>
                            {formData.gameMode === mode.id && (
                              <div className="w-6 h-6 bg-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,255,255,0.6)]">
                                <div className="w-2 h-2 bg-white" />
                              </div>
                            )}
                          </div>
                          <div className={`inline-block px-3 py-1 bg-gradient-to-r ${mode.gradient} text-white text-xs font-bold font-mono uppercase tracking-wider`}>
                            {mode.maxPlayers} PLAYERS MAX
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Role Selection - Only for non-ARAM modes */}
                  {formData.gameMode && formData.gameMode !== 'aram' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-6 bg-gradient-to-br from-[#0a1628]/30 to-[#0f1f3a]/30 border border-cyan-400/20 relative"
                    >
                      {/* Corner Brackets */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400/40"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400/40"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400/40"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400/40"></div>
                      
                      <RoleSelector
                        selectedRole={formData.creatorPosition || null}
                        onRoleSelect={(role) => setFormData({ ...formData, creatorPosition: role })}
                        theme={currentTheme}
                      />
                    </motion.div>
                  )}

                  {/* Privacy Setting */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-3 font-mono uppercase tracking-wider">
                      PRIVACY
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isPrivate: false })}
                        className={`cursor-pointer p-4 border-2 transition-all duration-300 relative ${
                          !formData.isPrivate
                            ? 'border-green-400 bg-green-400/10'
                            : 'border-cyan-400/20 bg-[#0a1628]/30 hover:border-cyan-400/40'
                        }`}
                      >
                        {!formData.isPrivate && (
                          <>
                            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-green-400"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-green-400"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-green-400"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-green-400"></div>
                          </>
                        )}
                        <Globe className="w-6 h-6 text-green-400 mb-2" />
                        <h3 className="font-bold text-white mb-1 font-mono uppercase">PUBLIC</h3>
                        <p className="text-sm text-white/60 font-mono">
                          Anyone can see and request to join
                        </p>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setFormData({ ...formData, isPrivate: true })}
                        className={`cursor-pointer p-4 border-2 transition-all duration-300 relative ${
                          formData.isPrivate
                            ? 'border-yellow-400 bg-yellow-400/10'
                            : 'border-cyan-400/20 bg-[#0a1628]/30 hover:border-cyan-400/40'
                        }`}
                      >
                        {formData.isPrivate && (
                          <>
                            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-yellow-400"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-yellow-400"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-yellow-400"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-yellow-400"></div>
                          </>
                        )}
                        <Lock className="w-6 h-6 text-yellow-400 mb-2" />
                        <h3 className="font-bold text-white mb-1 font-mono uppercase">PRIVATE</h3>
                        <p className="text-sm text-white/60 font-mono">
                          Only people with invite code can join
                        </p>
                      </motion.div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-3 font-mono uppercase tracking-wider">
                      PREFERENCES (OPTIONAL)
                    </label>
                      
                    {/* Minimum Rank */}
                    <div className="mb-4 relative">
                      <label className="block text-sm text-white/60 mb-2 font-mono uppercase text-xs tracking-wider">
                        MINIMUM RANK
                      </label>
                      <div className="relative">
                        {/* Corner Brackets for Dropdown */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/40 pointer-events-none z-10"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/40 pointer-events-none z-10"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/40 pointer-events-none z-10"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/40 pointer-events-none z-10"></div>
                        
                        <select
                          value={formData.preferences.minRank || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            preferences: { ...formData.preferences, minRank: e.target.value || undefined }
                          })}
                          className="w-full px-4 py-3 bg-gradient-to-r from-[#0a1628]/80 to-[#0f1f3a]/80 border border-cyan-400/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 font-mono appearance-none cursor-pointer hover:border-cyan-400/50 transition-all duration-300 uppercase tracking-wider text-sm shadow-[inset_0_1px_2px_rgba(0,255,255,0.1)]"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9L1 4h10z' fill='%2300ffff' fill-opacity='0.6'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 12px center',
                            backgroundSize: '12px 12px',
                            paddingRight: '40px'
                          }}
                        >
                          <option value="" className="bg-[#0a1628] text-white py-2">NO MINIMUM RANK</option>
                          {ranks.map(rank => (
                            <option key={rank} value={rank} className="bg-[#0a1628] text-white py-2">{rank.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Voice Chat */}
                    <div className="flex items-center gap-3 p-4 bg-[#0a1628]/30 border border-cyan-400/20 mb-4">
                      <input
                        type="checkbox"
                        id="voiceChat"
                        checked={formData.preferences.voiceChat || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, voiceChat: e.target.checked }
                        })}
                        className="w-5 h-5 border-cyan-400/30 text-cyan-400 focus:ring-cyan-400/50 bg-[#0a1628]/50"
                      />
                      <label htmlFor="voiceChat" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Mic className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="font-medium text-white font-mono uppercase text-sm tracking-wider">
                            VOICE CHAT REQUIRED
                          </div>
                          <div className="text-sm text-white/60 font-mono">
                            Members must be able to use voice communication
                          </div>
                        </div>
                      </label>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-sm text-white/60 mb-2 font-mono uppercase text-xs tracking-wider">
                        PREFERRED LANGUAGE
                      </label>
                      <input
                        type="text"
                        value={formData.preferences.language || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: { ...formData.preferences, language: e.target.value || undefined }
                        })}
                        placeholder="e.g., English, Spanish, French"
                        className="w-full px-4 py-3 bg-[#0a1628]/50 border border-cyan-400/30 text-white placeholder:text-white/40 placeholder:font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 font-mono"
                      />
                    </div>
                  </div>

                  {/* Scheduled Time */}
                  <div>
                    <label className="block text-sm font-bold text-cyan-400 mb-2 font-mono uppercase tracking-wider">
                      SCHEDULE FOR LATER (OPTIONAL)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledFor || ''}
                      onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value || undefined })}
                      className="w-full px-4 py-3 bg-[#0a1628]/50 border border-cyan-400/30 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 font-mono"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/parties')}
                    className="flex-1 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 border border-red-500/40 py-4 text-lg font-mono uppercase tracking-wider transition-all duration-300 relative group"
                  >
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-red-400/60"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-red-400/60"></div>
                    <span className="text-white">CANCEL</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.gameMode}
                    className={`flex-1 py-4 text-lg font-bold font-mono uppercase tracking-wider transition-all duration-300 relative group ${
                      isSubmitting || !formData.name || !formData.gameMode
                        ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed border border-gray-600/50'
                        : 'bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] border border-cyan-400/50'
                    }`}
                  >
                    {!(isSubmitting || !formData.name || !formData.gameMode) && (
                      <>
                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                      </>
                    )}
                    {isSubmitting ? 'CREATING...' : 'CREATE PARTY'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </NavigationDrawer>
  );
}
