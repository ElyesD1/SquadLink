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
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useTheme } from 'next-themes';

interface PartyFormData {
  name: string;
  description: string;
  gameMode: string;
  isPrivate: boolean;
  scheduledFor?: string;
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

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:3001/party', {
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
    return (
      <div className={`min-h-screen ${getBackgroundClass(currentTheme)} flex items-center justify-center`}>
        <div className={`${getTextClass(currentTheme)} text-2xl`}>Loading...</div>
      </div>
    );
  }

  return (
    <NavigationDrawer>
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
          <header className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <AnimatedLogo size="md" />
              <Button
                onClick={() => router.push('/parties')}
                className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 mr-16"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Parties
              </Button>
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
              <h1 className={`text-4xl md:text-5xl font-black ${getTextClass(currentTheme)} mb-2`}>
                Create Your Party
              </h1>
              <p className={`text-xl ${getSecondaryTextClass(currentTheme)}`}>
                Set up your squad and find teammates
              </p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <form onSubmit={handleSubmit}>
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm mb-6">
                  <CardContent className="p-6 space-y-6">
                    {/* Party Name */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-2`}>
                        Party Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g., Gold+ Ranked Climb"
                        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} placeholder:${getSecondaryTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-2`}>
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Describe your party and what you're looking for..."
                        rows={4}
                        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} placeholder:${getSecondaryTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none`}
                      />
                    </div>

                    {/* Game Mode Selection */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Game Mode *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameModes.map((mode) => (
                          <motion.div
                            key={mode.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData({ ...formData, gameMode: mode.id })}
                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                              formData.gameMode === mode.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 bg-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className={`font-bold ${getTextClass(currentTheme)}`}>
                                  {mode.label}
                                </h3>
                                <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                  {mode.description}
                                </p>
                              </div>
                              {formData.gameMode === mode.id && (
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full" />
                                </div>
                              )}
                            </div>
                            <div className={`inline-block px-3 py-1 bg-gradient-to-r ${mode.gradient} rounded-lg text-white text-xs font-medium`}>
                              {mode.maxPlayers} Players Max
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Privacy Setting */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Privacy
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, isPrivate: false })}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            !formData.isPrivate
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <Globe className="w-6 h-6 text-green-500 mb-2" />
                          <h3 className={`font-bold ${getTextClass(currentTheme)} mb-1`}>Public</h3>
                          <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                            Anyone can see and request to join
                          </p>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setFormData({ ...formData, isPrivate: true })}
                          className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 ${
                            formData.isPrivate
                              ? 'border-yellow-500 bg-yellow-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <Lock className="w-6 h-6 text-yellow-500 mb-2" />
                          <h3 className={`font-bold ${getTextClass(currentTheme)} mb-1`}>Private</h3>
                          <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                            Only people with invite code can join
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Preferences (Optional)
                      </label>
                      
                      {/* Minimum Rank */}
                      <div className="mb-4">
                        <label className={`block text-sm ${getSecondaryTextClass(currentTheme)} mb-2`}>
                          Minimum Rank
                        </label>
                        <select
                          value={formData.preferences.minRank || ''}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            preferences: { ...formData.preferences, minRank: e.target.value || undefined }
                          })}
                          className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        >
                          <option value="">No minimum rank</option>
                          {ranks.map(rank => (
                            <option key={rank} value={rank}>{rank}</option>
                          ))}
                        </select>
                      </div>

                      {/* Voice Chat */}
                      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                        <input
                          type="checkbox"
                          id="voiceChat"
                          checked={formData.preferences.voiceChat || false}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, voiceChat: e.target.checked }
                          })}
                          className="w-5 h-5 rounded border-white/20 text-purple-600 focus:ring-purple-500"
                        />
                        <label htmlFor="voiceChat" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Mic className="w-5 h-5 text-purple-500" />
                          <div>
                            <div className={`font-medium ${getTextClass(currentTheme)}`}>
                              Voice Chat Required
                            </div>
                            <div className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                              Members must be able to use voice communication
                            </div>
                          </div>
                        </label>
                      </div>

                      {/* Language */}
                      <div className="mt-4">
                        <label className={`block text-sm ${getSecondaryTextClass(currentTheme)} mb-2`}>
                          Preferred Language
                        </label>
                        <input
                          type="text"
                          value={formData.preferences.language || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, language: e.target.value || undefined }
                          })}
                          placeholder="e.g., English, Spanish, French"
                          className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} placeholder:${getSecondaryTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                        />
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-2`}>
                        Schedule for Later (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledFor || ''}
                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value || undefined })}
                        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    onClick={() => router.push('/parties')}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-4 text-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formData.name || !formData.gameMode}
                    className={`flex-1 py-4 text-lg font-semibold ${
                      isSubmitting || !formData.name || !formData.gameMode
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/30'
                    } transition-all duration-300`}
                  >
                    {isSubmitting ? 'Creating...' : 'Create Party'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </NavigationDrawer>
  );
}
