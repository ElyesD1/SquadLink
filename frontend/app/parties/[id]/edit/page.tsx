'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
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
  Shield,
  Save,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown
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

export default function EditPartyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const partyId = params?.id as string;
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const [partyStatus, setPartyStatus] = useState<string>('open');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [partyMembers, setPartyMembers] = useState<any[]>([]);
  const [creatorId, setCreatorId] = useState<string>('');

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

  useEffect(() => {
    const fetchParty = async () => {
      if (!partyId) return;
      
      try {
        const response = await fetch(`http://localhost:3001/party/${partyId}`);
        if (response.ok) {
          const result = await response.json();
          const party = result.data || result;
          
          setFormData({
            name: party.name || '',
            description: party.description || '',
            gameMode: party.gameMode || '',
            isPrivate: party.isPrivate || false,
            scheduledFor: party.scheduledFor || '',
            preferences: {
              minRank: party.preferences?.minRank || '',
              voiceChat: party.preferences?.voiceChat || false,
              language: party.preferences?.language || '',
            }
          });
          setPartyStatus(party.status || 'open');
          setPartyMembers(party.members || []);
          setCreatorId(party.creator?._id || party.creatorId);
        } else {
          alert('Failed to load party');
          router.push('/parties');
        }
      } catch (error) {
        console.error('Error loading party:', error);
        alert('Failed to load party');
        router.push('/parties');
      } finally {
        setIsLoading(false);
      }
    };

    if (mounted && session) {
      fetchParty();
    }
  }, [partyId, mounted, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.gameMode) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/by-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: partyStatus,
          userEmail: session?.user?.email,
        }),
      });

      if (response.ok) {
        router.push('/parties');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update party');
      }
    } catch (error) {
      console.error('Error updating party:', error);
      alert('Failed to update party');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKickMember = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to kick ${username} from the party?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/kick`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userEmail: session?.user?.email,
        }),
      });

      if (response.ok) {
        // Remove member from local state
        setPartyMembers(partyMembers.filter(member => member.userId !== userId));
        alert(`${username} has been kicked from the party`);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to kick member');
      }
    } catch (error) {
      console.error('Error kicking member:', error);
      alert('Failed to kick member');
    }
  };

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/by-email`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: session?.user?.email,
        }),
      });

      if (response.ok) {
        router.push('/parties');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete party');
      }
    } catch (error) {
      console.error('Error deleting party:', error);
      alert('Failed to delete party');
    } finally {
      setIsSubmitting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (!mounted || status === 'loading' || isLoading) {
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
              <div className="mr-16">
                <Button
                  onClick={() => router.push('/parties')}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Parties
                </Button>
              </div>
            </div>
          </header>

          {/* Form */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="mb-8">
                    <h1 className={`text-3xl font-bold ${getTextClass(currentTheme)} mb-2`}>
                      Edit Party
                    </h1>
                    <p className={`${getSecondaryTextClass(currentTheme)}`}>
                      Update your party details and preferences
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Party Name */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-2`}>
                        Party Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                        placeholder="Enter party name"
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
                        className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none`}
                        placeholder="Describe your party..."
                        rows={3}
                      />
                    </div>

                    {/* Game Mode - Disabled (cannot change) */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Game Mode *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameModes.map((mode) => (
                          <div
                            key={mode.id}
                            className={`relative p-4 rounded-xl border-2 cursor-not-allowed opacity-50 ${
                              formData.gameMode === mode.id
                                ? 'border-purple-500 bg-purple-500/10'
                                : 'border-white/10 bg-white/5'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${mode.gradient} flex items-center justify-center flex-shrink-0`}>
                                <Users className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                  {mode.label}
                                </h3>
                                <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                  {mode.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className={`text-xs ${getSecondaryTextClass(currentTheme)} mt-2`}>
                        Game mode cannot be changed after party creation
                      </p>
                    </div>

                    {/* Privacy */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Privacy
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPrivate: false })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            !formData.isPrivate
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Globe className="w-6 h-6 text-green-500" />
                            <div className="text-left">
                              <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                Public
                              </h3>
                              <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Anyone can find and request to join
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPrivate: true })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            formData.isPrivate
                              ? 'border-purple-500 bg-purple-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Lock className="w-6 h-6 text-yellow-500" />
                            <div className="text-left">
                              <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                Private
                              </h3>
                              <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Invite only with code
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Party Status */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Party Status
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPartyStatus('open')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            partyStatus === 'open'
                              ? 'border-green-500 bg-green-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-500" />
                            <div className="text-left">
                              <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                Open
                              </h3>
                              <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Accepting new members
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPartyStatus('closed')}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            partyStatus === 'closed'
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <div className="text-left">
                              <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                Closed
                              </h3>
                              <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Not accepting new members
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-3`}>
                        Preferences
                      </label>
                      <div className="space-y-4">
                        {/* Minimum Rank */}
                        <div>
                          <label className={`block text-sm ${getTextClass(currentTheme)} font-medium mb-2`}>
                            Minimum Rank
                          </label>
                          <div className="relative">
                            <select
                              value={formData.preferences.minRank || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                preferences: { ...formData.preferences, minRank: e.target.value }
                              })}
                              className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none pr-10`}
                            >
                              <option value="">No requirement</option>
                              {ranks.map((rank) => (
                                <option key={rank} value={rank}>{rank}</option>
                              ))}
                            </select>
                            <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSecondaryTextClass(currentTheme)} pointer-events-none`} />
                          </div>
                        </div>

                        {/* Voice Chat */}
                        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className={`font-medium ${getTextClass(currentTheme)}`}>
                                Voice Chat Required
                              </p>
                              <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Members must join voice chat
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              preferences: { ...formData.preferences, voiceChat: !formData.preferences.voiceChat }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              formData.preferences.voiceChat ? 'bg-purple-600' : 'bg-white/20'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData.preferences.voiceChat ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>

                        {/* Language */}
                        <div>
                          <label className={`block text-sm ${getTextClass(currentTheme)} font-medium mb-2`}>
                            Preferred Language
                          </label>
                          <input
                            type="text"
                            value={formData.preferences.language || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: { ...formData.preferences, language: e.target.value }
                            })}
                            className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                            placeholder="e.g., English, Spanish, French"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div>
                      <label className={`block text-sm font-medium ${getTextClass(currentTheme)} mb-2`}>
                        <Calendar className="w-4 h-4 inline mr-2" />
                        Schedule Party (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.scheduledFor || ''}
                        onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                        className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300`}
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>Saving...</>
                        ) : (
                          <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => router.push('/parties')}
                        className="px-8 bg-white/5 hover:bg-white/10 border border-white/10"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>

                  {/* Party Members Section */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <h2 className={`text-2xl font-bold ${getTextClass(currentTheme)} mb-4 flex items-center gap-2`}>
                      <Users className="w-6 h-6" />
                      Party Members ({partyMembers.length})
                    </h2>
                    
                    {partyMembers.length === 0 ? (
                      <p className={`text-center py-8 ${getSecondaryTextClass(currentTheme)}`}>
                        No members in this party yet
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {partyMembers.map((member) => {
                          const isOwner = member.userId === creatorId;
                          
                          return (
                            <div
                              key={member.userId}
                              className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                {/* Profile Picture - Use LoL Icon if available */}
                                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                  {member.lolAccount?.profileIconId ? (
                                    <img
                                      src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${member.lolAccount.profileIconId}.png`}
                                      alt="LoL Icon"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : member.profilePicture ? (
                                    <img
                                      src={member.profilePicture}
                                      alt={member.username || 'Member'}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Users className="w-6 h-6 text-white" />
                                  )}
                                </div>
                                
                                {/* Member Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {member.lolAccount ? (
                                      <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                        {member.lolAccount.gameName}#{member.lolAccount.tagLine}
                                      </h3>
                                    ) : (
                                      <h3 className={`font-semibold ${getTextClass(currentTheme)}`}>
                                        {member.username}
                                      </h3>
                                    )}
                                    {isOwner && (
                                      <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">
                                        OWNER
                                      </span>
                                    )}
                                  </div>
                                  {member.lolAccount?.rankedData && member.lolAccount.rankedData.length > 0 ? (
                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                      {member.lolAccount.rankedData.map((rank: any, ridx: number) => (
                                        <span key={ridx} className={`${getSecondaryTextClass(currentTheme)}`}>
                                          {rank.queueType.includes('SOLO') ? 'Solo:' : 'Flex:'} {rank.tier} {rank.rank}
                                        </span>
                                      ))}
                                    </div>
                                  ) : member.lolAccount ? (
                                    <p className={`text-xs ${getSecondaryTextClass(currentTheme)}`}>
                                      Unranked
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              
                              {/* Kick Button (only for non-owners) */}
                              {!isOwner && (
                                <Button
                                  onClick={() => handleKickMember(member.userId, member.username)}
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Kick
                                </Button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Delete Section */}
                  <div className="mt-8 pt-8 border-t border-white/10">
                    <div className="mb-4">
                      <h3 className={`text-lg font-semibold ${getTextClass(currentTheme)} mb-2`}>
                        Danger Zone
                      </h3>
                      <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                        Once you delete a party, there is no going back. Please be certain.
                      </p>
                    </div>
                    <Button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className={`${
                        showDeleteConfirm
                          ? 'bg-red-600 hover:bg-red-700'
                          : 'bg-red-600/20 hover:bg-red-600/30 border border-red-500/50'
                      } text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {showDeleteConfirm ? 'Click Again to Confirm Delete' : 'Delete Party'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </NavigationDrawer>
  );
}
