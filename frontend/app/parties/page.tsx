'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  Plus, 
  Clock, 
  Shield, 
  Search,
  Filter,
  RefreshCw,
  Gamepad2,
  Lock,
  Globe,
  Bell,
  Mic,
  ChevronDown,
  Info,
  X
} from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { useTheme } from 'next-themes';
import { usePartySocket } from '@/lib/usePartySocket';
import DiscordIntegration from '@/components/ui/DiscordIntegration';

interface Party {
  _id: string;
  name: string;
  description: string;
  gameMode: string;
  maxPlayers: number; // Backend returns maxPlayers
  status: string;
  isPrivate: boolean;
  creator?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    lolAccount?: {
      gameName: string;
      tagLine: string;
      profileIconId?: number;
      rankedData?: Array<{
        queueType: string;
        tier: string;
        rank: string;
      }>;
    };
  };
  creatorUsername?: string; // Fallback if creator not populated
  members: any[];
  joinRequests: any[];
  preferences?: {
    minRank?: string;
    voiceChat?: boolean;
    language?: string;
  };
  createdAt: string;
  scheduledFor?: string;
  discordVoiceChannel?: {
    channelId: string;
    channelName: string;
    inviteUrl: string;
    createdAt: string;
  };
}

const gameModeLabels: Record<string, string> = {
  'ranked_solo_duo': 'Ranked Solo/Duo',
  'ranked_flex': 'Ranked Flex',
  'aram': 'ARAM',
  'draft_pick': 'Draft Pick'
};

const gameModeColors: Record<string, string> = {
  'ranked_solo_duo': 'from-yellow-500 to-orange-500',
  'ranked_flex': 'from-blue-500 to-purple-500',
  'aram': 'from-green-500 to-teal-500',
  'draft_pick': 'from-purple-500 to-pink-500'
};

export default function PartiesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameMode, setSelectedGameMode] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasLolAccount, setHasLolAccount] = useState<boolean>(false);
  const [hasDiscordAccount, setHasDiscordAccount] = useState<boolean>(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedPartyMembers, setSelectedPartyMembers] = useState<Party | null>(null);
  const currentTheme = theme || 'dark';
  
  // WebSocket connection
  const { 
    isConnected, 
    notifications,
    setNotifications,
    clearNotifications,
    onPartiesUpdate 
  } = usePartySocket(session?.user?.email || undefined);

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

    // Check for Discord OAuth success/error
    const urlParams = new URLSearchParams(window.location.search);
    const discordStatus = urlParams.get('discord');
    
    if (discordStatus === 'success') {
      // Show success message
      alert('✅ Successfully connected to Discord!\n\n🎤 Now click the "Join Voice Channel Now" button to connect to your party voice chat.');
      // Remove query param from URL
      window.history.replaceState({}, '', '/parties');
    } else if (discordStatus === 'error') {
      // Show error message
      alert('❌ Failed to connect to Discord. Please try again.');
      // Remove query param from URL
      window.history.replaceState({}, '', '/parties');
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      const initializeData = async () => {
        await fetchCurrentUser();
        fetchParties();
      };
      initializeData();
    }
  }, [status, router]);

  const fetchCurrentUser = async () => {
    if (!session?.user?.email) return;
    
    try {
      const response = await fetch('http://localhost:3001/users/profile/full', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: session.user.email }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data._id);
        setHasLolAccount(!!data.lolAccount);
        setHasDiscordAccount(!!data.discordId); // Check if user has Discord linked
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  // Listen for real-time party updates
  useEffect(() => {
    if (!isConnected) return;

    const unsubscribe = onPartiesUpdate((data: any) => {
      console.log('Parties update received:', data);
      // Refresh the party list when any party is created/updated/deleted
      fetchParties();
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected, selectedGameMode]); // Added selectedGameMode to dependencies

  // Debug: Log currentUserId changes
  useEffect(() => {
    console.log('Current User ID updated:', currentUserId);
  }, [currentUserId]);

  // Fetch parties when game mode filter changes
  useEffect(() => {
    if (status === 'authenticated') {
      fetchParties();
    }
  }, [selectedGameMode]);

  const fetchParties = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (selectedGameMode) {
        queryParams.append('gameMode', selectedGameMode);
      }
      
      const response = await fetch(`http://localhost:3001/party?${queryParams}`);

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched parties response:', data);
        const partiesData = data.data || data;
        console.log('Parties data:', partiesData);
        setParties(Array.isArray(partiesData) ? partiesData : []);
        
        // Convert join requests from owned parties into notifications
        if (Array.isArray(partiesData) && currentUserId) {
          const ownedParties = partiesData.filter((party: Party) => 
            party.creator?.email === session?.user?.email || 
            (party as any).creatorId === session?.user?.email
          );
          
          const joinRequestNotifications = ownedParties.flatMap((party: Party) => 
            (party.joinRequests || []).map((request: any) => ({
              type: 'party_join_request' as const,
              title: 'New Party Join Request',
              message: `${request.username} wants to join your party "${party.name}"`,
              data: {
                partyId: party._id,
                requesterId: request.userId,
                requesterName: request.username,
                message: request.message,
                requester: {
                  profilePicture: request.profilePicture,
                  lolAccount: request.lolAccount,
                },
              },
            }))
          );
          
          // Always update notifications - clear if no requests, show if there are
          setNotifications(joinRequestNotifications);
        }
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRequest = async (partyId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/request-join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'I would like to join your party!',
          userEmail: session?.user?.email
        }),
      });

      if (response.ok) {
        // Show success notification
        alert('Join request sent!');
        fetchParties();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      alert('Failed to send join request');
    }
  };

  const handleAcceptRequest = async (partyId: string, userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/handle-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accept: true,
          userEmail: session?.user?.email
        }),
      });

      if (response.ok) {
        // Remove notification from list
        fetchParties();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept request');
    }
  };

  const handleLeaveParty = async (partyId: string) => {
    if (!confirm('Are you sure you want to leave this party?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/leave`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: session?.user?.email
        }),
      });

      if (response.ok) {
        alert('You have left the party');
        fetchParties();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to leave party');
      }
    } catch (error) {
      console.error('Error leaving party:', error);
      alert('Failed to leave party');
    }
  };

  const handleRejectRequest = async (partyId: string, userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/party/${partyId}/handle-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          accept: false,
          userEmail: session?.user?.email
        }),
      });

      if (response.ok) {
        // Remove notification from list
        fetchParties();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject request');
    }
  };

  // Helper function to check if user is in a party (as creator or member)
  const isUserInParty = (party: Party): boolean => {
    // Check if user is the creator (by email - always available)
    const isCreator = party.creator?.email === session?.user?.email || 
                      (party as any).creatorId === session?.user?.email;
    
    // Check if user is a member (by userId - requires currentUserId to be loaded)
    const isMember = currentUserId && party.members?.some(member => 
      member.userId === currentUserId
    );
    
    return isCreator || !!isMember;
  };

  // Separate user's parties from other parties
  // Apply search filter to both sections
  const myParties = parties.filter(party => {
    const isMyParty = isUserInParty(party);
    const matchesSearch = party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         party.description.toLowerCase().includes(searchQuery.toLowerCase());
    return isMyParty && matchesSearch;
  });

  const otherParties = parties.filter(party => {
    const isMyParty = isUserInParty(party);
    const matchesSearch = party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         party.description.toLowerCase().includes(searchQuery.toLowerCase());
    // Show open parties to non-members (including full parties)
    // Hide closed parties from non-members (members see them in "My Parties")
    return !isMyParty && matchesSearch && party.status === 'open';
  });

  // Get max members based on game mode
  const getMaxMembers = (gameMode: string): number => {
    return gameMode === 'ranked_solo_duo' ? 2 : 5;
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
              <div className="flex items-center gap-3 mr-16">
                {/* Notification Bell */}
                <div className="relative">
                  <Button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="bg-white/5 hover:bg-white/10 border border-white/10 p-2.5 relative"
                  >
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                  
                  {/* Notifications Dropdown */}
                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-bold ${getTextClass(currentTheme)}`}>
                              Notifications
                            </h3>
                            <Button
                              onClick={clearNotifications}
                              className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10"
                            >
                              Clear All
                            </Button>
                          </div>
                          {notifications.length === 0 ? (
                            <p className={`text-sm ${getSecondaryTextClass(currentTheme)} text-center py-4`}>
                              No new notifications
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {notifications.map((notif, idx) => {
                                const notifData = (notif as any).data;
                                const requester = notifData?.requester;
                                
                                return (
                                  <div
                                    key={idx}
                                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                  >
                                    {/* Title */}
                                    {(notif as any).title && (
                                      <h4 className={`text-sm font-semibold ${getTextClass(currentTheme)} mb-3`}>
                                        {(notif as any).title}
                                      </h4>
                                    )}
                                    
                                    {/* Join Request with Profile */}
                                    {notif.type === 'party_join_request' && requester && (
                                      <div className="flex items-start gap-3 mb-3">
                                        {/* Square Profile Picture - Use LoL Icon if available */}
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {requester.lolAccount?.profileIconId ? (
                                            <img
                                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${requester.lolAccount.profileIconId}.png`}
                                              alt="LoL Icon"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : requester.profilePicture ? (
                                            <img
                                              src={requester.profilePicture}
                                              alt="Requester"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <Users className="w-6 h-6 text-white" />
                                          )}
                                        </div>
                                        
                                        {/* Requester Info */}
                                        <div className="flex-1 min-w-0">
                                          {requester.lolAccount ? (
                                            <>
                                              <p className={`text-sm font-semibold ${getTextClass(currentTheme)} truncate`}>
                                                {requester.lolAccount.gameName}#{requester.lolAccount.tagLine}
                                              </p>
                                              <div className="flex items-center gap-2 text-xs flex-wrap mt-1">
                                                {requester.lolAccount.rankedData?.map((rank: any, ridx: number) => (
                                                  <span key={ridx} className={`${getSecondaryTextClass(currentTheme)}`}>
                                                    {rank.queueType.includes('SOLO') ? 'Solo:' : 'Flex:'} {rank.tier} {rank.rank}
                                                  </span>
                                                ))}
                                                {(!requester.lolAccount.rankedData || requester.lolAccount.rankedData.length === 0) && (
                                                  <span className={`${getSecondaryTextClass(currentTheme)}`}>Unranked</span>
                                                )}
                                              </div>
                                            </>
                                          ) : (
                                            <p className={`text-sm ${getTextClass(currentTheme)}`}>
                                              {notifData.requesterName}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}

                                    {/* Member Left with Profile */}
                                    {notif.type === 'member_left' && notifData?.member && (
                                      <div className="flex items-start gap-3 mb-3">
                                        {/* Square Profile Picture - Use LoL Icon if available */}
                                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                                          {notifData.member.lolAccount?.profileIconId ? (
                                            <img
                                              src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${notifData.member.lolAccount.profileIconId}.png`}
                                              alt="LoL Icon"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : notifData.member.profilePicture ? (
                                            <img
                                              src={notifData.member.profilePicture}
                                              alt="Member"
                                              className="w-full h-full object-cover"
                                            />
                                          ) : (
                                            <Users className="w-6 h-6 text-white" />
                                          )}
                                        </div>
                                        
                                        {/* Member Info */}
                                        <div className="flex-1 min-w-0">
                                          {notifData.member.lolAccount ? (
                                            <>
                                              <p className={`text-sm font-semibold ${getTextClass(currentTheme)} truncate`}>
                                                {notifData.member.lolAccount.gameName}#{notifData.member.lolAccount.tagLine}
                                              </p>
                                              <div className="flex items-center gap-2 text-xs flex-wrap mt-1">
                                                {notifData.member.lolAccount.rankedData?.map((rank: any, ridx: number) => (
                                                  <span key={ridx} className={`${getSecondaryTextClass(currentTheme)}`}>
                                                    {rank.queueType.includes('SOLO') ? 'Solo:' : 'Flex:'} {rank.tier} {rank.rank}
                                                  </span>
                                                ))}
                                                {(!notifData.member.lolAccount.rankedData || notifData.member.lolAccount.rankedData.length === 0) && (
                                                  <span className={`${getSecondaryTextClass(currentTheme)}`}>Unranked</span>
                                                )}
                                              </div>
                                            </>
                                          ) : (
                                            <p className={`text-sm ${getTextClass(currentTheme)}`}>
                                              {notifData.member.username}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Message for non-join-request and non-member-left notifications */}
                                    {notif.type !== 'party_join_request' && notif.type !== 'member_left' && (
                                      <p className={`text-sm ${getTextClass(currentTheme)} mb-2`}>
                                        {notif.message}
                                      </p>
                                    )}
                                    
                                    {/* Type Badge and Action Buttons */}
                                    <div className="flex items-center justify-between">
                                      <span className={`text-xs px-2 py-1 rounded-lg ${
                                        notif.type === 'party_join_request' 
                                          ? 'bg-blue-500/20 text-blue-400'
                                          : notif.type === 'request_accepted'
                                          ? 'bg-green-500/20 text-green-400'
                                          : notif.type === 'request_rejected'
                                          ? 'bg-red-500/20 text-red-400'
                                          : notif.type === 'member_left'
                                          ? 'bg-orange-500/20 text-orange-400'
                                          : 'bg-purple-500/20 text-purple-400'
                                      }`}>
                                        {notif.type.replace(/_/g, ' ').toUpperCase()}
                                      </span>
                                      
                                      {/* Action Buttons for Join Requests */}
                                      {notif.type === 'party_join_request' && notifData && (
                                        <div className="flex gap-2">
                                          <Button
                                            onClick={() => handleRejectRequest(notifData.partyId, notifData.requesterId)}
                                            className="text-xs px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/50 rounded-lg"
                                          >
                                            Reject
                                          </Button>
                                          <Button
                                            onClick={() => handleAcceptRequest(notifData.partyId, notifData.requesterId)}
                                            className="text-xs px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/50 rounded-lg"
                                          >
                                            Accept
                                          </Button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Connection Status Indicator */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                  <span className={`text-xs font-medium ${getTextClass(currentTheme)}`}>
                    {isConnected ? 'Live' : 'Connecting...'}
                  </span>
                </div>

                <Button
                  onClick={() => router.push('/parties/create')}
                  disabled={!hasLolAccount}
                  className={`px-5 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 ${
                    hasLolAccount
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-purple-500/30'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Party
                </Button>
              </div>
            </div>
          </header>

          <div className="max-w-7xl mx-auto">
            {/* Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className={`text-4xl md:text-5xl font-black ${getTextClass(currentTheme)} mb-2`}>
                Find Your Squad
              </h1>
              <p className={`text-xl ${getSecondaryTextClass(currentTheme)}`}>
                Join parties and team up for League of Legends
              </p>
            </motion.div>

            {/* Warning Message for No LoL Account */}
            {!hasLolAccount && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-6"
              >
                <Card className="border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20 backdrop-blur-sm bg-yellow-500/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-yellow-500 font-semibold mb-1">
                          League of Legends Account Required
                        </h3>
                        <p className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                          You need to link your League of Legends account to create or join parties. 
                          <button
                            onClick={() => router.push('/profile')}
                            className="ml-1 text-yellow-500 hover:text-yellow-400 underline font-medium"
                          >
                            Link your account now
                          </button>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                      <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSecondaryTextClass(currentTheme)}`} />
                      <input
                        type="text"
                        placeholder="Search parties..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl ${getTextClass(currentTheme)} placeholder:${getSecondaryTextClass(currentTheme)} focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
                      />
                    </div>

                    {/* Game Mode Filter */}
                    <div className="relative">
                      <select
                        value={selectedGameMode}
                        onChange={(e) => setSelectedGameMode(e.target.value)}
                        className={`w-full border border-white/10 shadow-md shadow-purple-500/5 backdrop-blur-sm bg-white/5 hover:shadow-purple-500/10 hover:border-purple-500/20 rounded-xl p-4 ${getTextClass(currentTheme)} focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none pr-10`}
                      >
                        <option value="">All Game Modes</option>
                        <option value="ranked_solo_duo">Ranked Solo/Duo</option>
                        <option value="ranked_flex">Ranked Flex</option>
                        <option value="aram">ARAM</option>
                        <option value="draft_pick">Draft Pick</option>
                      </select>
                      <ChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${getSecondaryTextClass(currentTheme)} pointer-events-none`} />
                    </div>

                    {/* Refresh Button */}
                    <Button
                      onClick={fetchParties}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 px-4"
                    >
                      <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Parties Grid */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className={`${getTextClass(currentTheme)} text-xl`}>Loading parties...</div>
              </div>
            ) : (
              <>
                {/* My Parties Section */}
                {myParties.length > 0 && (
                  <div className="mb-12">
                    <h2 className={`text-2xl font-bold ${getTextClass(currentTheme)} mb-6 flex items-center gap-2`}>
                      <Users className="w-6 h-6" />
                      My Parties
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myParties.map((party, index) => (
                        <motion.div
                          key={party._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.05 }}
                        >
                          <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95 hover:shadow-purple-500/20 transition-all duration-300">
                            <CardContent className="p-6">
                              {/* Header with Owner/Member Badge */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className={`text-lg font-bold ${getTextClass(currentTheme)}`}>
                                      {party.name}
                                    </h3>
                                    {party.isPrivate && (
                                      <Lock className="w-4 h-4 text-yellow-500" />
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-xs px-2 py-1 rounded-md ${
                                      gameModeColors[party.gameMode] ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {gameModeLabels[party.gameMode]}
                                    </span>
                                    {(party.creator?.email === session?.user?.email || (party as any).creatorId === session?.user?.email) ? (
                                      <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-md">
                                        OWNER
                                      </span>
                                    ) : (
                                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md">
                                        MEMBER
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Description */}
                              <p className={`${getSecondaryTextClass(currentTheme)} text-sm mb-4 line-clamp-2`}>
                                {party.description}
                              </p>

                              {/* Party Info */}
                              <div className="space-y-2 mb-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className={getSecondaryTextClass(currentTheme)}>
                                    Status
                                  </span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                    party.status === 'open' 
                                      ? 'bg-green-500/20 text-green-400' 
                                      : party.status === 'closed'
                                      ? 'bg-red-500/20 text-red-400'
                                      : 'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {party.status?.toUpperCase()}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className={getSecondaryTextClass(currentTheme)}>
                                    Members
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={getTextClass(currentTheme)}>
                                      {party.members.length}/{getMaxMembers(party.gameMode)}
                                    </span>
                                    <button
                                      onClick={() => {
                                        setSelectedPartyMembers(party);
                                        setShowMembersModal(true);
                                      }}
                                      className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                      title="View members"
                                    >
                                      <Info className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                                    </button>
                                  </div>
                                </div>
                                
                                {party.joinRequests && party.joinRequests.length > 0 && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className={getSecondaryTextClass(currentTheme)}>
                                      Pending Requests
                                    </span>
                                    <span className="text-yellow-500">
                                      {party.joinRequests.length}
                                    </span>
                                  </div>
                                )}

                                {/* Preferences */}
                                {party.preferences?.minRank && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className={getSecondaryTextClass(currentTheme)}>
                                      Min Rank
                                    </span>
                                    <span className="text-yellow-500">
                                      {party.preferences.minRank}
                                    </span>
                                  </div>
                                )}

                                {party.preferences?.voiceChat && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Mic className="w-4 h-4 text-purple-400" />
                                    <span className={getSecondaryTextClass(currentTheme)}>
                                      Voice Chat Required
                                    </span>
                                  </div>
                                )}

                                {party.preferences?.language && (
                                  <div className="flex items-center justify-between text-sm">
                                    <span className={getSecondaryTextClass(currentTheme)}>
                                      Language
                                    </span>
                                    <span className={getTextClass(currentTheme)}>
                                      {party.preferences.language}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Discord Integration - Show for all parties you're a member of */}
                              <div className="mb-4">
                                <DiscordIntegration
                                  partyId={party._id}
                                  partyName={party.name}
                                  isOwner={party.creator?.email === session?.user?.email || (party as any).creatorId === session?.user?.email}
                                  existingChannelUrl={(party as any).discordVoiceChannel?.inviteUrl}
                                  hasDiscordAccount={hasDiscordAccount}
                                />
                              </div>

                              {/* Action Button - Owner gets Manage, Members get Leave */}
                              {(party.creator?.email === session?.user?.email || (party as any).creatorId === session?.user?.email) ? (
                                <Button
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                  onClick={() => router.push(`/parties/${party._id}/edit`)}
                                >
                                  Manage Party
                                </Button>
                              ) : (
                                <Button
                                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                                  onClick={() => handleLeaveParty(party._id)}
                                >
                                  Leave Party
                                </Button>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Available Parties Section */}
                <div>
                  <h2 className={`text-2xl font-bold ${getTextClass(currentTheme)} mb-6 flex items-center gap-2`}>
                    <Gamepad2 className="w-6 h-6" />
                    Available Parties
                  </h2>
                  
                  {otherParties.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-20"
                    >
                      <Gamepad2 className={`w-16 h-16 ${getSecondaryTextClass(currentTheme)} mx-auto mb-4`} />
                      <h3 className={`text-2xl font-bold ${getTextClass(currentTheme)} mb-2`}>
                        No parties found
                      </h3>
                      <p className={`${getSecondaryTextClass(currentTheme)} mb-6`}>
                        {myParties.length > 0 
                          ? 'No other parties match your filters.'
                          : 'Be the first to create a party!'}
                      </p>
                      {myParties.length === 0 && (
                        <Button
                          onClick={() => router.push('/parties/create')}
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Create Party
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {otherParties.map((party, index) => (
                  <motion.div
                    key={party._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95 hover:shadow-purple-500/20 transition-all duration-300">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className={`text-lg font-bold ${getTextClass(currentTheme)}`}>
                                {party.name}
                              </h3>
                              {party.isPrivate && (
                                <Lock className="w-4 h-4 text-yellow-500" />
                              )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-md ${
                              gameModeColors[party.gameMode] ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {gameModeLabels[party.gameMode]}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`${getSecondaryTextClass(currentTheme)} text-sm mb-4 line-clamp-2`}>
                          {party.description}
                        </p>

                        {/* Creator */}
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {party.creator?.lolAccount?.profileIconId ? (
                              <img
                                src={`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/profileicon/${party.creator.lolAccount.profileIconId}.png`}
                                alt="LoL Icon"
                                className="w-full h-full object-cover"
                              />
                            ) : party.creator?.profilePicture ? (
                              <img
                                src={party.creator.profilePicture}
                                alt="Creator"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            {party.creator?.lolAccount ? (
                              <>
                                <p className={`text-sm ${getTextClass(currentTheme)} font-semibold truncate`}>
                                  {party.creator.lolAccount.gameName}#{party.creator.lolAccount.tagLine}
                                </p>
                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                  {party.creator.lolAccount.rankedData?.map((rank, idx) => (
                                    <span key={idx} className={`${getSecondaryTextClass(currentTheme)}`}>
                                      {rank.queueType.includes('SOLO') ? 'Solo:' : 'Flex:'} {rank.tier} {rank.rank}
                                    </span>
                                  ))}
                                  {(!party.creator.lolAccount.rankedData || party.creator.lolAccount.rankedData.length === 0) && (
                                    <span className={`${getSecondaryTextClass(currentTheme)}`}>Unranked</span>
                                  )}
                                </div>
                              </>
                            ) : (
                              <>
                                <p className={`text-sm ${getTextClass(currentTheme)} font-medium truncate`}>
                                  {party.creator?.firstName && party.creator?.lastName 
                                    ? `${party.creator.firstName} ${party.creator.lastName}`
                                    : (party as any).creatorUsername || 'Unknown'}
                                </p>
                                <p className={`text-xs ${getSecondaryTextClass(currentTheme)}`}>
                                  No LoL Account Linked
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Party Info */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className={getSecondaryTextClass(currentTheme)}>
                              Members
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={getTextClass(currentTheme)}>
                                {party.members.length}/{getMaxMembers(party.gameMode)}
                              </span>
                              <button
                                onClick={() => {
                                  setSelectedPartyMembers(party);
                                  setShowMembersModal(true);
                                }}
                                className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                title="View members"
                              >
                                <Info className="w-4 h-4 text-purple-400 hover:text-purple-300" />
                              </button>
                            </div>
                          </div>
                          
                          {party.preferences?.minRank && (
                            <div className="flex items-center justify-between text-sm">
                              <span className={getSecondaryTextClass(currentTheme)}>
                                Min Rank
                              </span>
                              <span className="text-yellow-500">
                                {party.preferences.minRank}
                              </span>
                            </div>
                          )}

                          {party.preferences?.voiceChat && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mic className="w-4 h-4 text-purple-400" />
                              <span className={getSecondaryTextClass(currentTheme)}>
                                Voice Chat Required
                              </span>
                            </div>
                          )}

                          {party.preferences?.language && (
                            <div className="flex items-center justify-between">
                              <span className={`text-sm ${getSecondaryTextClass(currentTheme)}`}>
                                Language
                              </span>
                              <span className={`text-sm font-medium ${getTextClass(currentTheme)}`}>
                                {party.preferences.language}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => handleJoinRequest(party._id)}
                          disabled={!hasLolAccount || party.members.length >= getMaxMembers(party.gameMode)}
                          className={`w-full ${
                            !hasLolAccount || party.members.length >= getMaxMembers(party.gameMode)
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : 'bg-purple-600 hover:bg-purple-700 text-white'
                          }`}
                        >
                          {!hasLolAccount 
                            ? 'Link LoL Account to Join' 
                            : party.members.length >= getMaxMembers(party.gameMode) 
                            ? 'Party Full' 
                            : 'Request to Join'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members Modal */}
      <AnimatePresence>
        {showMembersModal && selectedPartyMembers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowMembersModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <Card className="border-2 border-border shadow-2xl shadow-purple-500/20 backdrop-blur-sm bg-card/95">
                <CardContent className="p-6">
                  {/* Modal Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className={`text-2xl font-bold ${getTextClass(currentTheme)} flex items-center gap-2`}>
                        <Users className="w-6 h-6" />
                        Party Members
                      </h2>
                      <p className={`text-sm ${getSecondaryTextClass(currentTheme)} mt-1`}>
                        {selectedPartyMembers.name}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMembersModal(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className={`w-5 h-5 ${getTextClass(currentTheme)}`} />
                    </button>
                  </div>

                  {/* Members List */}
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedPartyMembers.members.length === 0 ? (
                      <p className={`text-center py-8 ${getSecondaryTextClass(currentTheme)}`}>
                        No members in this party yet
                      </p>
                    ) : (
                      selectedPartyMembers.members.map((member, idx) => {
                        const isOwner = member.userId === (selectedPartyMembers.creator?._id || (selectedPartyMembers as any).creatorId);
                        
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                          >
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
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {member.lolAccount ? (
                                  <h3 className={`text-sm font-semibold ${getTextClass(currentTheme)} truncate`}>
                                    {member.lolAccount.gameName}#{member.lolAccount.tagLine}
                                  </h3>
                                ) : (
                                  <h3 className={`text-sm font-semibold ${getTextClass(currentTheme)} truncate`}>
                                    {member.username}
                                  </h3>
                                )}
                                {isOwner && (
                                  <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-md flex-shrink-0">
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
                              ) : (
                                <p className={`text-xs ${getSecondaryTextClass(currentTheme)}`}>
                                  No LoL Account
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Close Button */}
                  <div className="mt-6">
                    <Button
                      onClick={() => setShowMembersModal(false)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      Close
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </NavigationDrawer>
  );
}
