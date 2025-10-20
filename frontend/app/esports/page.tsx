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
      const response = await fetch('http://localhost:3001/users/profile/full', {
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
    return (
      <NavigationDrawer>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <AnimatedLogo size="lg" />
            <div className={`${getTextClass(currentTheme)} text-2xl`}>
              {status === 'loading' ? 'Authenticating...' : 'Loading eSports data...'}
            </div>
          </div>
        </div>
      </NavigationDrawer>
    );
  }

  if (!userProfile) {
    return (
      <NavigationDrawer>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <AnimatedLogo size="lg" />
            <div className={`${getTextClass(currentTheme)} text-2xl`}>Setting up your profile...</div>
            <Button 
              onClick={() => router.push('/profile')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Go to Profile
            </Button>
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
        <div className="min-h-screen bg-background relative overflow-hidden">
          {/* Animated Background */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 dark:from-purple-900/20 dark:to-blue-900/20" />
          </div>

          <div className="relative z-10 min-h-screen p-6 flex items-center justify-center">
            <Card className="border-2 border-border shadow-2xl shadow-purple-500/10 backdrop-blur-sm bg-card/95 max-w-md">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <GamepadIcon className="w-16 h-16 text-purple-500" />
                </div>
                <CardTitle className={getTextClass(currentTheme)}>eSports News Unavailable</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className={getSecondaryTextClass(currentTheme)}>
                  You need to have League of Legends in your game preferences to access eSports news.
                </p>
                <Button 
                  onClick={() => router.push('/profile')}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  Update Game Preferences
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </NavigationDrawer>
    );
  }

  return (
    <NavigationDrawer>
      <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
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
        <header className="max-w-7xl mx-auto flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            <AnimatedLogo size="md" />
            <div>
              <h1 className={`${getTextClass(currentTheme)} text-2xl font-bold`}>eSports Central</h1>
              <p className={`${getSecondaryTextClass(currentTheme)} text-sm`}>League of Legends Hub</p>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex space-x-1 bg-card/50 backdrop-blur-sm rounded-xl p-1 border border-border/50">
            {[
              { key: 'matches', label: 'Matches', icon: Play },
              { key: 'tournaments', label: 'Tournaments', icon: Trophy },
              { key: 'standings', label: 'Standings', icon: Crown },
              { key: 'teams', label: 'Teams', icon: Users }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === key
                    ? 'bg-purple-600 text-white shadow-lg'
                    : `${getTextClass(currentTheme)} hover:bg-white/10`
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* League Selector */}
          {leagues.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {leagues.map((league) => (
                <button
                  key={league.id}
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
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    selectedLeague === league.id
                      ? 'bg-purple-600 text-white'
                      : `${getSecondaryTextClass(currentTheme)} bg-card/30 hover:bg-card/50`
                  }`}
                >
                  {league.name}
                </button>
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
          <h2 className={`${getTextClass(currentTheme)} text-2xl font-bold mb-6 flex items-center gap-2`}>
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Live Matches
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
          <h2 className={`${getTextClass(currentTheme)} text-2xl font-bold mb-6 flex items-center gap-2`}>
            <Clock className="w-5 h-5" />
            Upcoming Matches
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
          <h2 className={`${getTextClass(currentTheme)} text-2xl font-bold mb-6 flex items-center gap-2`}>
            <TrendingUp className="w-5 h-5" />
            Tournament Results
          </h2>
          {Object.entries(groupedMatches).map(([split, splitMatches]) => (
            <div key={split} className="mb-8">
              <h3 className={`${getTextClass(currentTheme)} text-xl font-semibold mb-4`}>
                {split} ({splitMatches.length} matches)
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
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
          <h3 className={`${getTextClass(currentTheme)} text-xl font-semibold mb-2`}>
            Loading matches...
          </h3>
          <p className={`${getSecondaryTextClass(currentTheme)}`}>
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
        return <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 text-white">FINISHED</Badge>;
      default:
        return <Badge className="bg-blue-500 text-white">SCHEDULED</Badge>;
    }
  };

  return (
    <Card className="border border-border/50 shadow-lg shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          {getMatchStatus(match)}
          <span className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
            {new Date(match.startTime || match.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>

        <div className="mb-4">
          <h3 className={`${getTextClass(currentTheme)} font-bold mb-2`}>
            {match.league?.name || 'Unknown League'}
          </h3>
          {match.blockName && (
            <p className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
              {match.blockName}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          {match.teams.slice(0, 2).map((team: any, index: number) => (
            <div key={team.id} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/90 rounded-lg flex items-center justify-center border border-gray-200/60 overflow-hidden shadow-sm">
                <Image
                  src={getTeamLogoUrl(team.id || team.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''), team.code)}
                  alt={`${team.name} logo`}
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback to team code if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="${getTextClass(currentTheme)} text-sm font-bold">${team.code}</span>`;
                    }
                  }}
                />
              </div>
              <div>
                <span className={`${getTextClass(currentTheme)} font-medium`}>
                  {team.name}
                </span>
                {team.record && (
                  <p className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
                    {team.record.wins}W - {team.record.losses}L
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {match.teams[0]?.result && match.teams[1]?.result && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <span className={`${getTextClass(currentTheme)} text-2xl font-bold`}>
                  {match.teams[0].result.gameWins}
                </span>
                <p className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
                  {match.teams[0].result.outcome === 'win' ? 'WIN' : 'LOSS'}
                </p>
              </div>
              <span className={`${getSecondaryTextClass(currentTheme)} text-lg`}>-</span>
              <div className="text-center">
                <span className={`${getTextClass(currentTheme)} text-2xl font-bold`}>
                  {match.teams[1].result.gameWins}
                </span>
                <p className={`${getSecondaryTextClass(currentTheme)} text-xs`}>
                  {match.teams[1].result.outcome === 'win' ? 'WIN' : 'LOSS'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
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
            <Card key={tournament.id} className="border border-border/50 shadow-lg shadow-purple-500/5 backdrop-blur-sm bg-card/80 hover:shadow-purple-500/10 transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <Badge variant="outline" className="text-xs">
                    {tournament.leagueId.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className={`${getTextClass(currentTheme)} line-clamp-2`}>
                  {tournament.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
                      {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  {tournament.description && (
                    <p className={`${getSecondaryTextClass(currentTheme)} text-sm line-clamp-2`}>
                      {tournament.description}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
          <h3 className={`${getTextClass(currentTheme)} text-xl font-semibold mb-2`}>
            Loading tournaments...
          </h3>
          <p className={`${getSecondaryTextClass(currentTheme)}`}>
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
        <h3 className={`${getTextClass(currentTheme)} text-2xl font-bold mb-6 flex items-center gap-2`}>
          🏆 {year} {currentLeague?.name} Season Standings
        </h3>
        
        <div className="space-y-8">
          {Object.entries(yearData).map(([split, splitData], index) => (
            <div key={split}>
              <Card className={`border-2 border-border shadow-xl shadow-purple-500/10 backdrop-blur-sm ${getCardClass(currentTheme)}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <h4 className={`${getTextClass(currentTheme)} text-lg font-bold`}>
                      {getSplitDisplayName(selectedLeague, split)} ({getSplitDates(selectedLeague, year, split)})
                    </h4>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Special handling for LCK Round 3-5 */}
                  {selectedLeague === 'lol-champions-korea' && split === 'round3-5' && (splitData as any).legend ? (
                    renderLCKSpecialFormat(splitData)
                  ) : (
                    <div className="space-y-2 mb-4">
                      {Array.isArray(splitData) && splitData.map((standing: any, index: number) => (
                        <div key={`${standing.team}-${standing.position}-${index}`} className="flex items-center gap-3">
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
                            {standing.position}
                            {standing.position === 1 ? 'st' : standing.position === 2 ? 'nd' : standing.position === 3 ? 'rd' : 'th'}: {standing.team}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`${getSecondaryTextClass(currentTheme)} italic mt-4 p-3 rounded-lg bg-card/50 border border-border/30`}>
                    {getChampionText(selectedLeague, year, split)}
                  </div>
                </CardContent>
              </Card>
              
              {/* Divider between splits */}
              {index < Object.entries(yearData).length - 1 && (
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent"></div>
                  <div className={`${getSecondaryTextClass(currentTheme)} px-4 text-sm`}>⸻</div>
                  <div className="flex-1 h-px bg-gradient-to-r from-border via-transparent to-transparent"></div>
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
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className={`${getTextClass(currentTheme)} ml-2`}>Loading standings...</span>
        </div>
      ) : allStandings ? (
        <div className="space-y-8">
          {/* Render 2025 first, then 2024 */}
          {allStandings['2025'] && renderSplitStandings('2025', allStandings['2025'])}
          {allStandings['2024'] && renderSplitStandings('2024', allStandings['2024'])}
        </div>
      ) : (
        <div className={`${getSecondaryTextClass(currentTheme)} text-center py-8`}>
          No standings available for this league.
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
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className={`${getTextClass(currentTheme)} ml-2`}>Loading teams...</span>
        </div>
      ) : leagueTeams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {leagueTeams.map((team) => (
            <Card key={team.id} className={`border-2 border-border shadow-xl shadow-purple-500/10 backdrop-blur-sm ${getCardClass(currentTheme)} transition-all duration-300 h-fit`}>
              <CardHeader 
                className="cursor-pointer hover:bg-purple-500/5 transition-colors duration-200"
                onClick={() => toggleTeamExpansion(team.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/90 rounded-lg flex items-center justify-center border border-gray-200/60 overflow-hidden shadow-sm">
                      <Image
                        src={getTeamLogoUrl(team.id, team.code)}
                        alt={`${team.name} logo`}
                        width={48}
                        height={48}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          // Fallback to team code if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.innerHTML = `<span class="${getTextClass(currentTheme)} font-bold text-lg">${team.code}</span>`;
                          }
                        }}
                      />
                    </div>
                    <div>
                      <CardTitle className={`${getTextClass(currentTheme)} text-lg`}>
                        {team.name}
                      </CardTitle>
                      <p className={`${getSecondaryTextClass(currentTheme)} text-sm`}>
                        {team.code} • Click to {expandedTeams.has(team.id) ? 'collapse' : 'expand'} roster
                      </p>
                    </div>
                  </div>
                  <div className={`${getTextClass(currentTheme)} transition-transform duration-200 ${expandedTeams.has(team.id) ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              
              {expandedTeams.has(team.id) && team.roster && (
                <CardContent className="pt-0">
                  <div className="border-t border-border/30 pt-4">
                    <div className="space-y-4">
                      {/* Starting Lineup */}
                      <div>
                        <h4 className={`${getTextClass(currentTheme)} font-semibold mb-3 flex items-center gap-2`}>
                          <Users className="w-4 h-4" />
                          Starting Lineup
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {[
                            { role: 'top', player: team.roster.top },
                            { role: 'jungle', player: team.roster.jungle },
                            { role: 'mid', player: team.roster.mid },
                            { role: 'adc', player: team.roster.adc },
                            { role: 'support', player: team.roster.support }
                          ].map((position) => (
                            <div key={position.role} className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/30">
                              <span className="text-lg">{getRoleIcon(position.role)}</span>
                              <div className="flex-1">
                                <span className={`${getTextClass(currentTheme)} font-medium capitalize`}>
                                  {position.role}:
                                </span>
                                <span className={`${getTextClass(currentTheme)} ml-2`}>
                                  {position.player}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coaching Staff */}
                      {(team.roster.headCoach || team.roster.assistantCoach || team.roster.strategicCoach) && (
                        <div>
                          <h4 className={`${getTextClass(currentTheme)} font-semibold mb-3 flex items-center gap-2`}>
                            <Crown className="w-4 h-4" />
                            Coaching Staff
                          </h4>
                          <div className="space-y-2">
                            {team.roster.headCoach && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/30">
                                <span className="text-lg">🎯</span>
                                <div>
                                  <span className={`${getTextClass(currentTheme)} font-medium`}>
                                    Head Coach:
                                  </span>
                                  <span className={`${getTextClass(currentTheme)} ml-2`}>
                                    {team.roster.headCoach}
                                  </span>
                                </div>
                              </div>
                            )}
                            {team.roster.assistantCoach && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/30">
                                <span className="text-lg">📋</span>
                                <div>
                                  <span className={`${getTextClass(currentTheme)} font-medium`}>
                                    Assistant Coach:
                                  </span>
                                  <span className={`${getTextClass(currentTheme)} ml-2`}>
                                    {team.roster.assistantCoach}
                                  </span>
                                </div>
                              </div>
                            )}
                            {team.roster.strategicCoach && (
                              <div className="flex items-center gap-3 p-2 rounded-lg bg-card/50 border border-border/30">
                                <span className="text-lg">🧠</span>
                                <div>
                                  <span className={`${getTextClass(currentTheme)} font-medium`}>
                                    Strategic Coach:
                                  </span>
                                  <span className={`${getTextClass(currentTheme)} ml-2`}>
                                    {team.roster.strategicCoach}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className={`${getSecondaryTextClass(currentTheme)} text-center py-8`}>
          No teams available for this league.
        </div>
      )}
    </div>
  );
}