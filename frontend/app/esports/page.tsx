'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import LoadingScreen from '@/components/ui/LoadingScreen';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { 
  Calendar, 
  Trophy, 
  Users, 
  TrendingUp, 
  Play, 
  Clock,
  Star,
  ChevronRight,
  ChevronDown,
  Newspaper,
  GamepadIcon,
  Crown,
  Target,
  Loader2
} from 'lucide-react';
import { 
  riotEsportsService, 
  League, 
  Tournament, 
  Match, 
  Standing, 
  Team,
  getTeamLogoUrl,
  getTeamCodeFromName
} from '@/lib/lol-esports-service';
import { useOffline } from '@/lib/useOffline';
import { OfflineBanner, OfflineDataMessage } from '@/components/ui/OfflineComponents';
import { API_URL } from '@/lib/constants';

interface UserProfile {
  gamePreferences: string[];
}

export default function EsportsNewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // User data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // eSports data
  const [leagues, setLeagues] = useState<League[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'matches' | 'tournaments' | 'standings' | 'teams'>('matches');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);

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
    console.log('useEffect triggered, status:', status);
    if (status === 'unauthenticated') {
      console.log('User not authenticated, redirecting to login');
      router.push('/auth/login');
      return;
    }

    if (status === 'authenticated') {
      console.log('User authenticated, fetching profile and loading esports data');
      fetchUserProfile();
      loadEsportsData();
    }
  }, [status, router]);

  const fetchUserProfile = async () => {
    try {
      if (!session?.user?.email) {
        console.log('No user email in session');
        return;
      }

      console.log('Fetching profile for:', session.user.email);
      const response = await fetch(`${API_URL}/users/profile/full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session?.user?.email
        }),
      });

      console.log('Profile response status:', response.status);
      if (response.ok) {
        const profile = await response.json();
        console.log('Profile data:', profile);
        setUserProfile(profile);
      } else {
        console.error('Profile request failed:', response.status, response.statusText);
        // Create a default profile if none exists
        setUserProfile({ gamePreferences: [] });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Create a default profile if there's an error
      setUserProfile({ gamePreferences: [] });
    }
  };

  const loadEsportsData = async () => {
    console.log('loadEsportsData called');
    setIsLoading(true);
    try {
      console.log('Loading eSports data...');
      
      // First get all leagues
      console.log('Fetching leagues...');
      const leaguesData = await riotEsportsService.getLeagues();
      console.log('Leagues response:', leaguesData);
      setLeagues(leaguesData);

      if (leaguesData.length > 0) {
        // Set first league as selected
        const firstLeague = leaguesData[0];
        console.log('Selected league:', firstLeague);
        setSelectedLeague(firstLeague.id);
        
        // Load data for the first league
        console.log('Fetching tournaments, schedule, and teams...');
        const [tournamentsData, scheduleData, teamsData] = await Promise.allSettled([
          riotEsportsService.getTournamentsForLeague(firstLeague.id),
          riotEsportsService.getSchedule(firstLeague.id),
          riotEsportsService.getTeams()
        ]);
        
        if (tournamentsData.status === 'fulfilled') {
          console.log('Tournaments loaded:', tournamentsData.value);
          setTournaments(tournamentsData.value);
        } else {
          console.error('Failed to load tournaments:', tournamentsData.reason);
          setTournaments([]);
        }
        
        if (scheduleData.status === 'fulfilled') {
          console.log('Schedule loaded:', scheduleData.value);
          setAllMatches(scheduleData.value);
        } else {
          console.error('Failed to load schedule:', scheduleData.reason);
          setAllMatches([]);
        }
        
        if (teamsData.status === 'fulfilled') {
          console.log('Teams loaded:', teamsData.value);
          setTeams(teamsData.value);
        } else {
          console.error('Failed to load teams:', teamsData.reason);
          setTeams([]);
        }

        // Load standings for the first tournament if available
        if (tournamentsData.status === 'fulfilled' && tournamentsData.value.length > 0) {
          console.log('Fetching standings...');
          try {
            const standingsData = await riotEsportsService.getStandings(tournamentsData.value[0].id);
            console.log('Standings loaded:', standingsData);
            setStandings(standingsData);
          } catch (error) {
            console.error('Failed to load standings:', error);
            setStandings([]);
          }
        }
      } else {
        console.warn('No leagues found');
      }
    } catch (error) {
      console.error('Error loading esports data:', error);
    } finally {
      console.log('loadEsportsData finished');
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchStatus = (match: Match) => {
    switch (match.state) {
      case 'inProgress':
        return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">FINISHED</Badge>;
      case 'upcoming':
      case 'unstarted':
        return <Badge className="bg-blue-500 text-white">SCHEDULED</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">SCHEDULED</Badge>;
    }
  };

  if (!mounted || status === 'loading' || isLoading) {
    return <LoadingScreen variant="futuristic" />;
  }

  if (!userProfile) {
    return (
      <NavigationDrawer>
        <div className="min-h-screen bg-[#050a15] relative overflow-hidden flex items-center justify-center">
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
          
          <div className="text-center space-y-4 relative z-10">
            <AnimatedLogo size="lg" variant="futuristic" />
            <div className="text-cyan-400 text-2xl font-mono font-bold tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
              SETTING UP YOUR PROFILE...
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white px-6 py-3 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all duration-300 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
              <span className="text-sm font-bold font-mono tracking-wider uppercase relative z-10">GO TO PROFILE</span>
            </motion.button>
          </div>
        </div>
      </NavigationDrawer>
    );
  }

  // Check if user has League of Legends in their preferences
  const hasLoLPreference = userProfile?.gamePreferences?.includes('league-of-legends') || 
                          userProfile?.gamePreferences?.includes('League of Legends') ||
                          userProfile?.gamePreferences?.length === 0; // Allow access if no preferences set yet

  if (!hasLoLPreference && userProfile?.gamePreferences?.length > 0) {
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

          <div className="relative z-10 min-h-screen p-6 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-8 border-2 border-cyan-400/30 shadow-[0_0_40px_rgba(0,255,255,0.3)] max-w-md w-full relative overflow-hidden"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/50"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/50"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50"></div>
              
              <div className="text-center space-y-6 relative z-10">
                <div className="mx-auto mb-4">
                  <GamepadIcon className="w-16 h-16 text-cyan-400 mx-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
                </div>
                <h2 className="text-cyan-400 text-xl font-bold font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                  ESPORTS NEWS UNAVAILABLE
                </h2>
                <p className="text-gray-400 font-mono text-sm">
                  You need to have League of Legends in your game preferences to access eSports news.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/profile')}
                  className="bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white px-6 py-3 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all duration-300 relative overflow-hidden group w-full"
                >
                  <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                  <span className="text-sm font-bold font-mono tracking-wider uppercase relative z-10">UPDATE GAME PREFERENCES</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </NavigationDrawer>
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
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <AnimatedLogo size="md" variant="futuristic" />
            <div>
              <h1 className="text-cyan-400 text-2xl font-bold font-mono tracking-wider uppercase drop-shadow-[0_0_15px_rgba(0,255,255,0.4)]">ESPORTS CENTRAL</h1>
              <p className="text-gray-400 text-sm font-mono tracking-wide">LEAGUE OF LEGENDS HUB</p>
            </div>
          </div>
        </header>

        <OfflineDataMessage dataType="esports" className="max-w-7xl mx-auto mb-6" />

        {/* Main Content */}
        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex space-x-2 bg-gradient-to-r from-[#0a1628]/60 to-[#0f1f3a]/60 backdrop-blur-sm p-2 border border-cyan-400/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/40"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/40"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-cyan-400/40"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-cyan-400/40"></div>
            
            {[
              { key: 'matches', label: 'Matches', icon: Play },
              { key: 'tournaments', label: 'Tournaments', icon: Trophy },
              { key: 'standings', label: 'Standings', icon: Crown },
              { key: 'teams', label: 'Teams', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 transition-all duration-200 relative overflow-hidden flex-1 ${
                  activeTab === key
                    ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                    : 'text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10'
                }`}
              >
                {activeTab === key && (
                  <>
                    <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                  </>
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="font-mono font-bold tracking-wider uppercase text-sm relative z-10">{label}</span>
              </motion.button>
            ))}
          </div>

          {/* League Selector */}
          {leagues.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {leagues.map((league) => (
                <motion.button
                  key={league.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    setSelectedLeague(league.id);
                    setIsLoading(true);
                    try {
                      const [tournamentsData, scheduleData] = await Promise.all([
                        riotEsportsService.getTournamentsForLeague(league.id),
                        riotEsportsService.getSchedule(league.id)
                      ]);
                      setTournaments(tournamentsData);
                      setAllMatches(scheduleData);
                      
                      if (tournamentsData.length > 0) {
                        const standingsData = await riotEsportsService.getStandings(tournamentsData[0].id);
                        setStandings(standingsData);
                      }
                    } catch (error) {
                      console.error('Error loading league data:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className={`px-4 py-2 text-sm font-mono font-semibold tracking-wide transition-all duration-200 relative overflow-hidden ${
                    selectedLeague === league.id
                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)] border border-cyan-400/50'
                      : 'text-gray-400 bg-[#0f1f3a]/40 border border-cyan-400/20 hover:border-cyan-400/40 hover:text-cyan-400'
                  }`}
                >
                  {selectedLeague === league.id && (
                    <>
                      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/50"></div>
                      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/50"></div>
                    </>
                  )}
                  <span className="relative z-10">{league.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Content Sections */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'matches' && (
              <motion.div
                key="matches"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <MatchesSection 
                  matches={allMatches} 
                  currentTheme={currentTheme} 
                />
              </motion.div>
            )}

            {activeTab === 'tournaments' && (
              <motion.div
                key="tournaments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TournamentsSection tournaments={tournaments} currentTheme={currentTheme} />
              </motion.div>
            )}

            {activeTab === 'standings' && (
              <motion.div
                key="standings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <StandingsSection standings={standings} currentTheme={currentTheme} selectedLeague={selectedLeague || 'lol-emea-championship'} />
              </motion.div>
            )}

            {activeTab === 'teams' && (
              <motion.div
                key="teams"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <TeamsSection teams={teams} currentTheme={currentTheme} selectedLeague={selectedLeague || 'lol-emea-championship'} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </NavigationDrawer>
  );
}

// Matches Section Component
function MatchesSection({ matches, currentTheme }: { matches: Match[], currentTheme: string }) {
  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';

  const liveMatches = matches.filter(match => match.state === 'inProgress');
  const upcomingMatches = matches.filter(match => match.state === 'upcoming').slice(0, 10);
  const completedMatches = matches.filter(match => match.state === 'completed');

  // Group completed matches by split for better organization
  const groupedMatches = completedMatches.reduce((groups: {[key: string]: Match[]}, match) => {
    const split = match.split || match.type || 'Other';
    if (!groups[split]) {
      groups[split] = [];
    }
    groups[split].push(match);
    return groups;
  }, {});

  return (
    <div className="space-y-8">
      {/* Live Matches */}
      {liveMatches.length > 0 && (
        <div>
          <h2 className="text-cyan-400 text-2xl font-bold mb-6 flex items-center gap-3 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
            LIVE MATCHES
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentTheme={currentTheme} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <div>
          <h2 className="text-cyan-400 text-2xl font-bold mb-6 flex items-center gap-3 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
            <Clock className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            UPCOMING MATCHES
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {upcomingMatches.map((match) => (
              <MatchCard key={match.id} match={match} currentTheme={currentTheme} />
            ))}
          </div>
        </div>
      )}

      {/* All Matches by Split */}
      {Object.keys(groupedMatches).length > 0 && (
        <div>
          <h2 className="text-cyan-400 text-2xl font-bold mb-6 flex items-center gap-3 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
            <TrendingUp className="w-5 h-5 drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
            TOURNAMENT RESULTS
          </h2>
          {Object.entries(groupedMatches).map(([split, splitMatches]) => (
            <div key={split} className="mb-8">
              <h3 className="text-white text-xl font-semibold mb-4 font-mono tracking-wide">
                {split} <span className="text-cyan-400">({splitMatches.length} matches)</span>
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {splitMatches.map((match) => (
                  <MatchCard key={match.id} match={match} currentTheme={currentTheme} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No matches message */}
      {matches.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
          <h3 className="text-white text-xl font-semibold mb-2 font-mono tracking-wide">
            LOADING MATCHES...
          </h3>
          <p className="text-gray-400 font-mono text-sm">
            Fetching the latest match data from Riot API
          </p>
        </div>
      )}
    </div>
  );
}

// Match Card Component
function MatchCard({ match, currentTheme }: { match: Match, currentTheme: string }) {
  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';

  const getMatchStatus = (match: Match) => {
    switch (match.state) {
      case 'inProgress':
        return <div className="bg-gradient-to-r from-red-500 to-red-400 text-white px-3 py-1 text-xs font-bold font-mono tracking-wider uppercase animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)] border border-red-300/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/50"></div>
          <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/50"></div>
          LIVE
        </div>;
      case 'completed':
        return <div className="bg-gradient-to-r from-green-500 to-green-400 text-white px-3 py-1 text-xs font-bold font-mono tracking-wider uppercase shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-green-300/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/50"></div>
          <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/50"></div>
          FINISHED
        </div>;
      default:
        return <div className="bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white px-3 py-1 text-xs font-bold font-mono tracking-wider uppercase shadow-[0_0_15px_rgba(0,255,255,0.4)] border border-cyan-300/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white/50"></div>
          <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/50"></div>
          SCHEDULED
        </div>;
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-300 relative overflow-hidden"
    >
      {/* Corner brackets */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/40"></div>
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/40"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          {getMatchStatus(match)}
          <span className="text-gray-400 text-sm font-mono">
            {new Date(match.startTime || match.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="mb-4">
          <h3 className="text-white font-bold mb-2 font-mono tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
            {match.league?.name || 'Unknown League'}
          </h3>
          {match.blockName && (
            <p className="text-cyan-400 text-sm font-mono">
              {match.blockName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {match.teams.slice(0, 2).map((team: any, index: number) => (
            <div key={team.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 border border-cyan-400/40 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)] relative">
                <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-400/50"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-400/50"></div>
                <Image
                  src={getTeamLogoUrl(team.id || team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), team.code)}
                  alt={`${team.name} logo`}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain relative z-10"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-cyan-400 text-sm font-bold font-mono">${team.code}</span>`;
                    }
                  }}
                />
              </div>
              <div>
                <span className="text-white font-medium font-mono tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                  {team.name}
                </span>
                {team.record && (
                  <p className="text-gray-400 text-xs font-mono">
                    {team.record.wins}W - {team.record.losses}L
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {match.teams[0]?.result && match.teams[1]?.result && (
          <div className="mt-4 pt-4 border-t border-cyan-400/20">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className="text-cyan-400 text-2xl font-bold font-mono drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                  {match.teams[0].result.gameWins}
                </span>
                <p className={`text-xs font-mono font-semibold tracking-wider ${match.teams[0].result.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {match.teams[0].result.outcome === 'win' ? 'WIN' : 'LOSS'}
                </p>
              </div>
              <span className="text-gray-500 text-lg font-mono">-</span>
              <div className="text-center">
                <span className="text-cyan-400 text-2xl font-bold font-mono drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
                  {match.teams[1].result.gameWins}
                </span>
                <p className={`text-xs font-mono font-semibold tracking-wider ${match.teams[1].result.outcome === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                  {match.teams[1].result.outcome === 'win' ? 'WIN' : 'LOSS'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Tournaments Section Component
function TournamentsSection({ tournaments, currentTheme }: { tournaments: Tournament[], currentTheme: string }) {
  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';

  return (
    <div className="space-y-6">
      {tournaments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <motion.div
              key={tournament.id}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] hover:border-cyan-400/40 hover:shadow-[0_0_40px_rgba(0,255,255,0.3)] transition-all duration-300 relative overflow-hidden"
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400/40"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/40"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                  <div className="bg-gradient-to-r from-[#5383E8]/20 to-cyan-400/20 border border-cyan-400/30 px-2 py-0.5 text-cyan-400 font-mono text-xs font-semibold tracking-wider">
                    {tournament.leagueId.toUpperCase()}
                  </div>
                </div>
                <h3 className="text-white font-bold mb-4 line-clamp-2 font-mono tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                  {tournament.title}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <span className="text-gray-400 text-sm font-mono">
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {tournament.description && (
                    <p className="text-gray-400 text-sm line-clamp-2 font-mono">
                      {tournament.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
          <h3 className="text-white text-xl font-semibold mb-2 font-mono tracking-wide">
            LOADING TOURNAMENTS...
          </h3>
          <p className="text-gray-400 font-mono text-sm">
            Fetching tournament data from Riot API
          </p>
        </div>
      )}
    </div>
  );
}

// Standings Section Component
function StandingsSection({ standings, currentTheme, selectedLeague }: { standings: Standing[], currentTheme: string, selectedLeague: string }) {
  const [allStandings, setAllStandings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';
  const getCardClass = (theme: string) => theme === 'light' ? 'bg-white/90' : 'bg-card/90';

  const leagues = [
    { id: 'lol-emea-championship', name: 'LEC', fullName: 'LoL EMEA Championship', region: 'Europe' },
    { id: 'tencent-lol-pro-league', name: 'LPL', fullName: 'Tencent LoL Pro League', region: 'China' },
    { id: 'lol-champions-korea', name: 'LCK', fullName: 'LoL Champions Korea', region: 'Korea' },
    { id: 'league-of-legends-championship-of-the-americas', name: 'LTA', fullName: 'League of Legends Championship of The Americas', region: 'Americas' }
  ];

  const fetchAllStandings = async () => {
    setLoading(true);
    try {
      const data = await riotEsportsService.getRegularSeasonStandings(selectedLeague);
      setAllStandings(data);
    } catch (error) {
      console.error('Error fetching standings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllStandings();
  }, [selectedLeague]);

  const getChampionText = (leagueId: string, year: string, split: string) => {
    const texts: any = {
      'lol-emea-championship': {
        '2024': {
          'winter': 'G2 Esports secured the Winter Split title 🏆',
          'spring': 'Fnatic topped the Spring Split standings 🏆',
          'summer': 'SK Gaming and Team BDS led the Summer Split standings 🏆',
          'finals': 'G2 Esports clinched the Season Finals title 🏆'
        },
        '2025': {
          'winter': 'Fnatic led the Winter Split standings 🏆',
          'spring': 'Fnatic topped the Spring Split standings 🏆',
          'summer': 'Movistar KOI emerged as the Summer Split leaders 🏆'
        }
      },
      'league-of-legends-championship-of-the-americas': {
        '2024': {
          'spring': 'FlyQuest secured the Spring Split title 🏆',
          'summer': 'FlyQuest clinched the Summer Split title 🏆'
        },
        '2025': {
          'spring': 'Team Liquid secured the Spring Split title 🏆',
          'summer': 'Cloud9 clinched the Summer Split title 🏆'
        }
      },
      'lol-champions-korea': {
        '2024': {
          'spring': 'Gen.G dominated the Spring Split with a 17–1 record, securing the top seed in the playoffs 🏆',
          'summer': 'Hanwha Life Esports clinched the Summer Split title, with Gen.G finishing as runners-up 🏆'
        },
        '2025': {
          'round1-2': 'The first two rounds of the 2025 season featured a double round-robin format, with all matches played as best-of-three 🏆',
          'round3-5': 'The final rounds introduced a triple round-robin format, with records from earlier rounds carried over 🏆'
        }
      },
      'tencent-lol-pro-league': {
        '2024': {
          'spring': 'Bilibili Gaming clinched the Spring Split title, defeating Top Esports 3–1 in the Grand Finals 🏆',
          'summer': 'Bilibili Gaming secured the Summer Split title with a 3–0 victory over Weibo Gaming in the Grand Finals 🏆'
        },
        '2025': {
          'split1': 'Bilibili Gaming topped the standings in Split 1 🏆',
          'split2': 'Anyone\'s Legend led the standings in Split 2 🏆',
          'split3': 'Top Esports finished at the top of the standings in Split 3 🏆'
        }
      }
    };
    return texts[leagueId]?.[year]?.[split] || '';
  };

  const getSplitDisplayName = (leagueId: string, split: string) => {
    const names: any = {
      'lol-emea-championship': {
        'winter': 'Winter Split',
        'spring': 'Spring Split', 
        'summer': 'Summer Split',
        'finals': 'Season Finals'
      },
      'league-of-legends-championship-of-the-americas': {
        'spring': 'Spring Split',
        'summer': 'Summer Split'
      },
      'lol-champions-korea': {
        'spring': 'Spring Split',
        'summer': 'Summer Split',
        'round1-2': 'Round 1 & 2',
        'round3-5': 'Round 3–5'
      },
      'tencent-lol-pro-league': {
        'spring': 'Spring Split',
        'summer': 'Summer Split',
        'split1': 'Split 1',
        'split2': 'Split 2', 
        'split3': 'Split 3'
      }
    };
    return names[leagueId]?.[split] || split;
  };

  const getSplitDates = (leagueId: string, year: string, split: string) => {
    const dates: any = {
      'lol-emea-championship': {
        '2024': {
          'winter': 'Jan 13 – Feb 18, 2024',
          'spring': 'Mar 9 – Apr 14, 2024',
          'summer': 'Jun 8 – Jul 28, 2024',
          'finals': 'Aug 10 – Sep 1, 2024'
        },
        '2025': {
          'winter': 'Jan 13 – Feb 18, 2025',
          'spring': 'Mar 9 – Apr 14, 2025',
          'summer': 'Aug 2 – Sep 28, 2025'
        }
      },
      'league-of-legends-championship-of-the-americas': {
        '2024': {
          'spring': 'Jan 20 – Mar 31, 2024',
          'summer': 'Jun 15 – Sep 7, 2024'
        },
        '2025': {
          'spring': 'Jan 20 – Mar 31, 2025',
          'summer': 'Jun 15 – Sep 7, 2025'
        }
      },
      'lol-champions-korea': {
        '2024': {
          'spring': 'Jan 17 – Apr 14, 2024',
          'summer': 'Jun 12 – Sep 8, 2024'
        },
        '2025': {
          'round1-2': 'Apr 2 – Jun 1, 2025',
          'round3-5': 'Jul 23 – Aug 31, 2025'
        }
      },
      'tencent-lol-pro-league': {
        '2024': {
          'spring': 'Jan 22 – Apr 20, 2024',
          'summer': 'Jun 1 – Aug 30, 2024'
        },
        '2025': {
          'split1': 'Jan – Mar 2025',
          'split2': 'Apr – Jun 2025',
          'split3': 'Jul – Sep 2025'
        }
      }
    };
    return dates[leagueId]?.[year]?.[split] || '';
  };

  const renderLCKSpecialFormat = (standingsData: any) => {
    if (!standingsData.legend || !standingsData.rise) return null;
    
    return (
      <div className="space-y-4">
        <div>
          <h5 className={`${getTextClass(currentTheme)} font-semibold mb-2`}>• Legend Group:</h5>
          <div className="ml-4 space-y-1">
            {standingsData.legend.map((standing: any, index: number) => (
              <div key={`legend-${standing.team}-${index}`} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center border border-gray-200/60 overflow-hidden shadow-sm flex-shrink-0">
                  <Image
                    src={getTeamLogoUrl('', standing.team)}
                    alt={`${standing.team} logo`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to team code if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="${getTextClass(currentTheme)} font-bold text-xs">${standing.team.substring(0, 3).toUpperCase()}</span>`;
                      }
                    }}
                  />
                </div>
                <span className={`${getTextClass(currentTheme)}`}>
                  {standing.team}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h5 className={`${getTextClass(currentTheme)} font-semibold mb-2`}>• Rise Group:</h5>
          <div className="ml-4 space-y-1">
            {standingsData.rise.map((standing: any, index: number) => (
              <div key={`rise-${standing.team}-${index}`} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center border border-gray-200/60 overflow-hidden shadow-sm flex-shrink-0">
                  <Image
                    src={getTeamLogoUrl('', standing.team)}
                    alt={`${standing.team} logo`}
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to team code if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="${getTextClass(currentTheme)} font-bold text-xs">${standing.team.substring(0, 3).toUpperCase()}</span>`;
                      }
                    }}
                  />
                </div>
                <span className={`${getTextClass(currentTheme)}`}>
                  {standing.team}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSplitStandings = (year: string, yearData: any) => {
    const currentLeague = leagues.find(l => l.id === selectedLeague);
    
    return (
      <div key={year} className="mb-8">
        <h3 className="text-cyan-400 text-2xl font-bold mb-6 flex items-center gap-3 font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
          🏆 {year} {currentLeague?.name} SEASON STANDINGS
        </h3>
        
        <div className="space-y-8">
          {Object.entries(yearData).map(([split, splitData], index) => (
            <div key={split}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-6 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] relative overflow-hidden"
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,255,255,0.8)]"></div>
                    <h4 className="text-white text-lg font-bold font-mono tracking-wide drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                      {getSplitDisplayName(selectedLeague, split)} ({getSplitDates(selectedLeague, year, split)})
                    </h4>
                  </div>
                
                  {/* Special handling for LCK Round 3-5 */}
                  {selectedLeague === 'lol-champions-korea' && split === 'round3-5' && (splitData as any).legend ? (
                    renderLCKSpecialFormat(splitData)
                  ) : (
                    <div className="space-y-2 mb-4">
                      {Array.isArray(splitData) && splitData.map((standing: any, index: number) => (
                        <div key={`${standing.team}-${standing.position}-${index}`} className="flex items-center gap-3 p-2 bg-gradient-to-r from-[#0f1f3a]/40 to-transparent hover:from-[#0f1f3a]/60 transition-colors border-l-2 border-cyan-400/30">
                          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 border border-cyan-400/40 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(0,255,255,0.2)] flex-shrink-0 relative">
                            <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-400/50"></div>
                            <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-400/50"></div>
                            <Image
                              src={getTeamLogoUrl('', standing.team)}
                              alt={`${standing.team} logo`}
                              width={32}
                              height={32}
                              className="w-full h-full object-contain relative z-10"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const parent = target.parentElement;
                                if (parent) {
                                  parent.innerHTML = `<span class="text-cyan-400 font-bold text-xs font-mono">${standing.team.substring(0, 3).toUpperCase()}</span>`;
                                }
                              }}
                            />
                          </div>
                          <span className="text-white font-mono font-medium">
                            <span className="text-cyan-400">{standing.position}{standing.position === 1 ? 'st' : standing.position === 2 ? 'nd' : standing.position === 3 ? 'rd' : 'th'}:</span> {standing.team}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-cyan-400/80 italic mt-4 p-3 bg-[#0f1f3a]/40 border border-cyan-400/20 font-mono text-sm">
                    {getChampionText(selectedLeague, year, split)}
                  </div>
                </div>
              </motion.div>
              
              {/* Divider between splits */}
              {index < Object.entries(yearData).length - 1 && (
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                  <div className="text-cyan-400/50 px-4 text-sm font-mono">⸻</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-cyan-400/30 via-transparent to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Standings Display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-2 text-cyan-400 font-mono">LOADING STANDINGS...</span>
        </div>
      ) : allStandings ? (
        <div className="space-y-8">
          {/* Render 2025 first, then 2024 */}
          {allStandings['2025'] && renderSplitStandings('2025', allStandings['2025'])}
          {allStandings['2024'] && renderSplitStandings('2024', allStandings['2024'])}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/40 font-mono uppercase tracking-wider text-sm">
            NO STANDINGS AVAILABLE
          </p>
        </div>
      )}
    </div>
  );
}

// Teams Section Component
function TeamsSection({ teams, currentTheme, selectedLeague }: { teams: Team[], currentTheme: string, selectedLeague: string }) {
  const [leagueTeams, setLeagueTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());

  const getTextClass = (theme: string) => theme === 'light' ? 'text-gray-900' : 'text-white';
  const getSecondaryTextClass = (theme: string) => theme === 'light' ? 'text-gray-600' : 'text-white/60';
  const getCardClass = (theme: string) => theme === 'light' ? 'bg-white/90' : 'bg-card/90';

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const data = await riotEsportsService.getTeams(selectedLeague);
      setLeagueTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [selectedLeague]);

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getRoleIcon = (role: string) => {
    const icons: any = {
      top: '🛡️',
      jungle: '🌲',
      mid: '⚡',
      adc: '🏹',
      support: '💙'
    };
    return icons[role] || '👤';
  };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          <span className="ml-2 text-cyan-400 font-mono">LOADING TEAMS...</span>
        </div>
      ) : leagueTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {leagueTeams.map((team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative group"
            >
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-cyan-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-cyan-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-cyan-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-cyan-400"></div>

              {/* Team Card */}
              <div className="border border-cyan-400/30 bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 backdrop-blur-sm">
                {/* Team Header */}
                <div 
                  className="cursor-pointer hover:bg-cyan-400/5 transition-all duration-300 p-6 border-b border-cyan-400/20"
                  onClick={() => toggleTeamExpansion(team.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Team Logo */}
                      <div className="relative w-12 h-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 blur-md"></div>
                        <div className="relative w-full h-full bg-[#0f1f3a] border border-cyan-400/40 flex items-center justify-center overflow-hidden">
                          <Image
                            src={getTeamLogoUrl(team.id, team.code)}
                            alt={`${team.name} logo`}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-cyan-400 font-bold text-lg font-mono">${team.code}</span>`;
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Team Info */}
                      <div>
                        <h3 className="text-white font-bold text-lg tracking-wide">
                          {team.name}
                        </h3>
                        <p className="text-white/60 text-sm font-mono uppercase tracking-wider">
                          {team.code} • {expandedTeams.has(team.id) ? 'COLLAPSE' : 'EXPAND'} ROSTER
                        </p>
                      </div>
                    </div>
                    
                    {/* Expand Icon */}
                    <div className={`text-cyan-400 transition-transform duration-300 ${expandedTeams.has(team.id) ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                
                {/* Roster Details */}
                {expandedTeams.has(team.id) && team.roster && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 space-y-6">
                      {/* Starting Lineup */}
                      <div>
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                          <Users className="w-4 h-4 text-cyan-400" />
                          <span className="text-cyan-400">STARTING LINEUP</span>
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { role: 'top', player: team.roster.top },
                            { role: 'jungle', player: team.roster.jungle },
                            { role: 'mid', player: team.roster.mid },
                            { role: 'adc', player: team.roster.adc },
                            { role: 'support', player: team.roster.support }
                          ].map((position) => (
                            <div key={position.role} className="relative group/player">
                              {/* Player Card */}
                              <div className="flex items-center gap-3 p-3 bg-[#0a1628]/50 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300">
                                <span className="text-lg">{getRoleIcon(position.role)}</span>
                                <div className="flex-1">
                                  <span className="text-cyan-400 font-medium capitalize font-mono text-sm tracking-wider">
                                    {position.role}:
                                  </span>
                                  <span className="text-white ml-2 font-bold">
                                    {position.player}
                                  </span>
                                </div>
                                {/* Accent Line */}
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coaching Staff */}
                      {(team.roster.headCoach || team.roster.assistantCoach || team.roster.strategicCoach) && (
                        <div>
                          <h4 className="text-white font-bold mb-4 flex items-center gap-2 font-mono uppercase tracking-wider text-sm">
                            <Crown className="w-4 h-4 text-cyan-400" />
                            <span className="text-cyan-400">COACHING STAFF</span>
                          </h4>
                          <div className="space-y-2">
                            {team.roster.headCoach && (
                              <div className="flex items-center gap-3 p-3 bg-[#0a1628]/50 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300">
                                <span className="text-lg">🎯</span>
                                <div className="flex-1">
                                  <span className="text-cyan-400 font-medium font-mono text-sm tracking-wider">
                                    HEAD COACH:
                                  </span>
                                  <span className="text-white ml-2 font-bold">
                                    {team.roster.headCoach}
                                  </span>
                                </div>
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0"></div>
                              </div>
                            )}
                            {team.roster.assistantCoach && (
                              <div className="flex items-center gap-3 p-3 bg-[#0a1628]/50 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300">
                                <span className="text-lg">📋</span>
                                <div className="flex-1">
                                  <span className="text-cyan-400 font-medium font-mono text-sm tracking-wider">
                                    ASSISTANT COACH:
                                  </span>
                                  <span className="text-white ml-2 font-bold">
                                    {team.roster.assistantCoach}
                                  </span>
                                </div>
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0"></div>
                              </div>
                            )}
                            {team.roster.strategicCoach && (
                              <div className="flex items-center gap-3 p-3 bg-[#0a1628]/50 border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300">
                                <span className="text-lg">🧠</span>
                                <div className="flex-1">
                                  <span className="text-cyan-400 font-medium font-mono text-sm tracking-wider">
                                    STRATEGIC COACH:
                                  </span>
                                  <span className="text-white ml-2 font-bold">
                                    {team.roster.strategicCoach}
                                  </span>
                                </div>
                                <div className="w-1 h-6 bg-gradient-to-b from-cyan-400/0 via-cyan-400/60 to-cyan-400/0"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-white/40 font-mono uppercase tracking-wider text-sm">
            NO TEAMS AVAILABLE
          </p>
        </div>
      )}
    </div>
  );
}