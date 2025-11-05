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
  ChevronDown,
  Check
} from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useTheme } from 'next-themes';
import { getCDNUrl } from '@/lib/constants';

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
      <NavigationDrawer>
        <div className="min-h-screen bg-[#050a15] flex items-center justify-center relative overflow-hidden">
          {/* Futuristic Background Layers */}
          <div className="fixed inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,black,transparent)]"></div>
          <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-[#5383E8]/10 rounded-full blur-[120px] animate-pulse"></div>
          <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.02)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
          
          <div className="text-cyan-400 text-2xl font-mono font-bold tracking-wider uppercase relative z-10">LOADING...</div>
        </div>
      </NavigationDrawer>
    );
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
              <div className="mr-16">
                <button
                  onClick={() => router.push('/parties')}
                  className="relative group px-6 py-2.5 bg-gradient-to-r from-[#0a1628]/80 to-[#0f1f3a]/80 border border-cyan-400/30 font-mono text-xs tracking-wider uppercase text-cyan-400 hover:border-cyan-400/60 transition-all duration-300 overflow-hidden"
                  style={{
                    clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    BACK TO PARTIES
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            </div>
          </header>

          {/* Form */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 backdrop-blur-xl border border-cyan-400/20 p-8"
              style={{
                clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'
              }}
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400"></div>
              
              <div className="mb-8">
                <h1 className="text-3xl font-bold font-mono uppercase tracking-wider bg-gradient-to-r from-cyan-400 to-[#5383E8] bg-clip-text text-transparent mb-2">
                  EDIT PARTY
                </h1>
                <p className="text-cyan-400/60 font-mono text-sm uppercase tracking-wide">
                  UPDATE YOUR PARTY DETAILS AND PREFERENCES
                </p>
              </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Party Name */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        PARTY NAME *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 px-4 py-3 text-white placeholder-cyan-400/30 font-mono text-sm focus:outline-none focus:border-cyan-400/60 transition-all duration-300"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                          placeholder="Enter party name"
                          required
                        />
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        DESCRIPTION
                      </label>
                      <div className="relative">
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 px-4 py-3 text-white placeholder-cyan-400/30 font-mono text-sm focus:outline-none focus:border-cyan-400/60 transition-all duration-300 resize-none"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                          placeholder="Describe your party..."
                          rows={3}
                        />
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Game Mode - Disabled (cannot change) */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        GAME MODE *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {gameModes.map((mode) => (
                          <div
                            key={mode.id}
                            className="relative cursor-not-allowed opacity-50"
                          >
                            <div 
                              className={`p-4 bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border ${
                                formData.gameMode === mode.id
                                  ? 'border-cyan-400/60'
                                  : 'border-cyan-400/20'
                              } transition-all duration-300`}
                              style={{
                                clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                              }}
                            >
                              {/* Corner brackets */}
                              {formData.gameMode === mode.id && (
                                <>
                                  <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                                  <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                                  <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                                  <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                                </>
                              )}
                              
                              <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${mode.gradient} flex items-center justify-center flex-shrink-0`}
                                  style={{
                                    clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'
                                  }}
                                >
                                  <Users className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-mono font-semibold text-sm uppercase tracking-wide text-white">
                                    {mode.label}
                                  </h3>
                                  <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                    {mode.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-cyan-400/50 font-mono mt-2 uppercase tracking-wide">
                        GAME MODE CANNOT BE CHANGED AFTER PARTY CREATION
                      </p>
                    </div>

                    {/* Privacy */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        PRIVACY
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPrivate: false })}
                          className="relative group"
                        >
                          <div 
                            className={`p-4 border transition-all duration-300 ${
                              !formData.isPrivate
                                ? 'bg-gradient-to-br from-green-400/10 to-green-400/5 border-green-400/60 shadow-lg shadow-green-400/20'
                                : 'bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border-cyan-400/20 hover:border-cyan-400/40'
                            }`}
                            style={{
                              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                            }}
                          >
                            {!formData.isPrivate && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-green-400"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-green-400"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-green-400"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-green-400"></div>
                                {/* Checkmark indicator */}
                                <div className="absolute top-2 right-2 w-5 h-5 bg-green-400 flex items-center justify-center"
                                  style={{
                                    clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                                  }}
                                >
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              </>
                            )}
                            <div className="flex items-start gap-3">
                              <Globe className={`w-6 h-6 ${!formData.isPrivate ? 'text-green-400' : 'text-green-400/50'}`} />
                              <div className="text-left">
                                <h3 className={`font-mono font-semibold text-sm uppercase tracking-wide ${!formData.isPrivate ? 'text-green-400' : 'text-white'}`}>
                                  PUBLIC
                                </h3>
                                <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                  ANYONE CAN FIND AND REQUEST TO JOIN
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, isPrivate: true })}
                          className="relative group"
                        >
                          <div 
                            className={`p-4 border transition-all duration-300 ${
                              formData.isPrivate
                                ? 'bg-gradient-to-br from-yellow-400/10 to-yellow-400/5 border-yellow-400/60 shadow-lg shadow-yellow-400/20'
                                : 'bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border-cyan-400/20 hover:border-cyan-400/40'
                            }`}
                            style={{
                              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                            }}
                          >
                            {formData.isPrivate && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-yellow-400"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-yellow-400"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-yellow-400"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-yellow-400"></div>
                                {/* Checkmark indicator */}
                                <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-400 flex items-center justify-center"
                                  style={{
                                    clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                                  }}
                                >
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              </>
                            )}
                            <div className="flex items-start gap-3">
                              <Lock className={`w-6 h-6 ${formData.isPrivate ? 'text-yellow-400' : 'text-yellow-400/50'}`} />
                              <div className="text-left">
                                <h3 className={`font-mono font-semibold text-sm uppercase tracking-wide ${formData.isPrivate ? 'text-yellow-400' : 'text-white'}`}>
                                  PRIVATE
                                </h3>
                                <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                  INVITE ONLY WITH CODE
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Party Status */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        PARTY STATUS
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setPartyStatus('open')}
                          className="relative group"
                        >
                          <div 
                            className={`p-4 border transition-all duration-300 ${
                              partyStatus === 'open'
                                ? 'bg-gradient-to-br from-green-400/10 to-green-400/5 border-green-400/60 shadow-lg shadow-green-400/20'
                                : 'bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border-cyan-400/20 hover:border-cyan-400/40'
                            }`}
                            style={{
                              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                            }}
                          >
                            {partyStatus === 'open' && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-green-400"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-green-400"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-green-400"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-green-400"></div>
                                {/* Checkmark indicator */}
                                <div className="absolute top-2 right-2 w-5 h-5 bg-green-400 flex items-center justify-center"
                                  style={{
                                    clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                                  }}
                                >
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              </>
                            )}
                            <div className="flex items-start gap-3">
                              <CheckCircle className={`w-6 h-6 ${partyStatus === 'open' ? 'text-green-400' : 'text-green-400/50'}`} />
                              <div className="text-left">
                                <h3 className={`font-mono font-semibold text-sm uppercase tracking-wide ${partyStatus === 'open' ? 'text-green-400' : 'text-white'}`}>
                                  OPEN
                                </h3>
                                <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                  ACCEPTING NEW MEMBERS
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPartyStatus('closed')}
                          className="relative group"
                        >
                          <div 
                            className={`p-4 border transition-all duration-300 ${
                              partyStatus === 'closed'
                                ? 'bg-gradient-to-br from-red-400/10 to-red-400/5 border-red-400/60 shadow-lg shadow-red-400/20'
                                : 'bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border-cyan-400/20 hover:border-cyan-400/40'
                            }`}
                            style={{
                              clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                            }}
                          >
                            {partyStatus === 'closed' && (
                              <>
                                <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-400"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-400"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-400"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-400"></div>
                                {/* Checkmark indicator */}
                                <div className="absolute top-2 right-2 w-5 h-5 bg-red-400 flex items-center justify-center"
                                  style={{
                                    clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                                  }}
                                >
                                  <Check className="w-3 h-3 text-black" />
                                </div>
                              </>
                            )}
                            <div className="flex items-start gap-3">
                              <XCircle className={`w-6 h-6 ${partyStatus === 'closed' ? 'text-red-400' : 'text-red-400/50'}`} />
                              <div className="text-left">
                                <h3 className={`font-mono font-semibold text-sm uppercase tracking-wide ${partyStatus === 'closed' ? 'text-red-400' : 'text-white'}`}>
                                  CLOSED
                                </h3>
                                <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                  NOT ACCEPTING NEW MEMBERS
                                </p>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3">
                        PREFERENCES
                      </label>
                      <div className="space-y-4">
                        {/* Minimum Rank */}
                        <div>
                          <label className="block text-xs font-mono text-cyan-400/80 mb-2 uppercase tracking-wide">
                            MINIMUM RANK
                          </label>
                          <div className="relative">
                            <select
                              value={formData.preferences.minRank || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                preferences: { ...formData.preferences, minRank: e.target.value }
                              })}
                              className="w-full bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-400/60 transition-all duration-300 appearance-none pr-10"
                              style={{
                                clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                              }}
                            >
                              <option value="" className="bg-[#0a1628] text-white">No requirement</option>
                              {ranks.map((rank) => (
                                <option key={rank} value={rank} className="bg-[#0a1628] text-white">{rank}</option>
                              ))}
                            </select>
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                            {/* Custom chevron */}
                            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400 pointer-events-none" />
                          </div>
                        </div>

                        {/* Voice Chat */}
                        <div className="relative flex items-center justify-between p-4 bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                        >
                          {/* Corner brackets */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                          
                          <div className="flex items-center gap-3">
                            <Mic className="w-5 h-5 text-cyan-400" />
                            <div>
                              <p className="font-mono font-semibold text-sm uppercase tracking-wide text-white">
                                VOICE CHAT REQUIRED
                              </p>
                              <p className="text-xs text-cyan-400/60 font-mono mt-1">
                                MEMBERS MUST JOIN VOICE CHAT
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              preferences: { ...formData.preferences, voiceChat: !formData.preferences.voiceChat }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center transition-colors ${
                              formData.preferences.voiceChat ? 'bg-cyan-400/80' : 'bg-cyan-400/20'
                            }`}
                            style={{
                              clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'
                            }}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform bg-white transition-transform ${
                                formData.preferences.voiceChat ? 'translate-x-6' : 'translate-x-1'
                              }`}
                              style={{
                                clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                              }}
                            />
                          </button>
                        </div>

                        {/* Language */}
                        <div>
                          <label className="block text-xs font-mono text-cyan-400/80 mb-2 uppercase tracking-wide">
                            PREFERRED LANGUAGE
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              value={formData.preferences.language || ''}
                              onChange={(e) => setFormData({
                                ...formData,
                                preferences: { ...formData.preferences, language: e.target.value }
                              })}
                              className="w-full bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 px-4 py-3 text-white placeholder-cyan-400/30 font-mono text-sm focus:outline-none focus:border-cyan-400/60 transition-all duration-300"
                              style={{
                                clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                              }}
                              placeholder="e.g., English, Spanish, French"
                            />
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Scheduled Time */}
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        SCHEDULE PARTY (OPTIONAL)
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          value={formData.scheduledFor || ''}
                          onChange={(e) => setFormData({ ...formData, scheduledFor: e.target.value })}
                          className="w-full bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-cyan-400/60 transition-all duration-300"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                        />
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400 pointer-events-none"></div>
                      </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="relative flex-1 group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div 
                          className="px-8 py-3 bg-gradient-to-r from-cyan-400/20 to-[#5383E8]/20 border border-cyan-400/40 hover:border-cyan-400/60 transition-all duration-300"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                        >
                          {/* Corner brackets */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400"></div>
                          
                          <span className="relative z-10 flex items-center justify-center gap-2 font-mono text-sm uppercase tracking-wider text-cyan-400">
                            {isSubmitting ? (
                              <>SAVING...</>
                            ) : (
                              <>
                                <Save className="w-5 h-5" />
                                SAVE CHANGES
                              </>
                            )}
                          </span>
                          
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => router.push('/parties')}
                        className="relative group overflow-hidden"
                      >
                        <div 
                          className="px-8 py-3 bg-gradient-to-r from-[#0a1628]/80 to-[#0f1f3a]/80 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300"
                          style={{
                            clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                          }}
                        >
                          {/* Corner brackets */}
                          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50"></div>
                          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/50"></div>
                          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50"></div>
                          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50"></div>
                          
                          <span className="relative z-10 font-mono text-sm uppercase tracking-wider text-cyan-400/70 group-hover:text-cyan-400">
                            CANCEL
                          </span>
                        </div>
                      </button>
                    </div>
                  </form>

                  {/* Party Members Section */}
                  <div className="mt-8 pt-8 border-t border-cyan-400/20">
                    <h2 className="text-xl font-mono uppercase tracking-wider text-cyan-400 mb-4 flex items-center gap-2">
                      <Users className="w-6 h-6" />
                      PARTY MEMBERS ({partyMembers.length})
                    </h2>
                    
                    {partyMembers.length === 0 ? (
                      <p className="text-center py-8 text-cyan-400/50 font-mono text-sm uppercase tracking-wide">
                        NO MEMBERS IN THIS PARTY YET
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {partyMembers.map((member) => {
                          const isOwner = member.userId === creatorId;
                          
                          return (
                            <div
                              key={member.userId}
                              className="relative flex items-center justify-between p-4 bg-gradient-to-br from-[#0a1628]/60 to-[#0f1f3a]/40 border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300"
                              style={{
                                clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                              }}
                            >
                              {/* Corner brackets */}
                              <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-cyan-400/50"></div>
                              <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-cyan-400/50"></div>
                              <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-cyan-400/50"></div>
                              <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-cyan-400/50"></div>
                              
                              <div className="flex items-center gap-4">
                                {/* Profile Picture - Use LoL Icon if available */}
                                <div 
                                  className="relative w-12 h-12 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 flex items-center justify-center flex-shrink-0 overflow-hidden border border-cyan-400/30"
                                  style={{
                                    clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'
                                  }}
                                >
                                  {member.lolAccount?.profileIconId ? (
                                    <img
                                      src={getCDNUrl(`img/profileicon/${member.lolAccount.profileIconId}.png`)}
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
                                    <Users className="w-6 h-6 text-cyan-400" />
                                  )}
                                </div>
                                
                                {/* Member Info */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    {member.lolAccount ? (
                                      <h3 className="font-mono font-semibold text-sm text-white">
                                        {member.lolAccount.gameName}#{member.lolAccount.tagLine}
                                      </h3>
                                    ) : (
                                      <h3 className="font-mono font-semibold text-sm text-white">
                                        {member.username}
                                      </h3>
                                    )}
                                    {isOwner && (
                                      <span 
                                        className="relative px-2 py-0.5 bg-yellow-400/20 text-yellow-400 text-xs font-mono font-semibold border border-yellow-400/30"
                                        style={{
                                          clipPath: 'polygon(1px 0, 100% 0, 100% calc(100% - 1px), calc(100% - 1px) 100%, 0 100%, 0 1px)'
                                        }}
                                      >
                                        OWNER
                                      </span>
                                    )}
                                  </div>
                                  {member.lolAccount?.rankedData && member.lolAccount.rankedData.length > 0 ? (
                                    <div className="flex items-center gap-2 text-xs flex-wrap">
                                      {member.lolAccount.rankedData.map((rank: any, ridx: number) => (
                                        <span key={ridx} className="text-cyan-400/60 font-mono">
                                          {rank.queueType.includes('SOLO') ? 'Solo:' : 'Flex:'} {rank.tier} {rank.rank}
                                        </span>
                                      ))}
                                    </div>
                                  ) : member.lolAccount ? (
                                    <p className="text-xs text-cyan-400/50 font-mono">
                                      UNRANKED
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                              
                              {/* Kick Button (only for non-owners) */}
                              {!isOwner && (
                                <button
                                  onClick={() => handleKickMember(member.userId, member.username)}
                                  className="relative group overflow-hidden"
                                >
                                  <div 
                                    className="px-4 py-2 bg-red-400/10 border border-red-400/30 hover:border-red-400/50 transition-all duration-300"
                                    style={{
                                      clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                                    }}
                                  >
                                    {/* Corner brackets */}
                                    <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-400/50"></div>
                                    <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-400/50"></div>
                                    <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-400/50"></div>
                                    <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-400/50"></div>
                                    
                                    <span className="relative z-10 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-red-400">
                                      <XCircle className="w-4 h-4" />
                                      KICK
                                    </span>
                                  </div>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Delete Section */}
                  <div className="mt-8 pt-8 border-t border-red-400/20">
                    <div className="mb-4">
                      <h3 className="text-lg font-mono uppercase tracking-wider text-red-400 mb-2">
                        DANGER ZONE
                      </h3>
                      <p className="text-sm text-red-400/60 font-mono uppercase tracking-wide">
                        ONCE YOU DELETE A PARTY, THERE IS NO GOING BACK. PLEASE BE CERTAIN.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isSubmitting}
                      className={`relative group overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <div 
                        className={`px-6 py-3 ${
                          showDeleteConfirm
                            ? 'bg-red-600/40 border-red-400/80'
                            : 'bg-red-400/10 border-red-400/40'
                        } border hover:border-red-400/60 transition-all duration-300`}
                        style={{
                          clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'
                        }}
                      >
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-red-400"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-red-400"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-red-400"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-red-400"></div>
                        
                        <span className="relative z-10 flex items-center gap-2 font-mono text-sm uppercase tracking-wider text-red-400">
                          <Trash2 className="w-4 h-4" />
                          {showDeleteConfirm ? 'CLICK AGAIN TO CONFIRM DELETE' : 'DELETE PARTY'}
                        </span>
                      </div>
                    </button>
                  </div>
            </motion.div>
          </div>
        </div>
      </div>
    </NavigationDrawer>
  );
}
