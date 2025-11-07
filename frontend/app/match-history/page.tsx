'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedLogo } from '@/components/ui/AnimatedLogo';
import NavigationDrawer from '@/components/ui/NavigationDrawer';
import { ChevronDown, ChevronUp, Loader2, Trophy, Target, Shield, Skull, Users, UserX, Clock, AlertCircle, TrendingUp, TrendingDown, Swords, Search, Home, X, RefreshCw, Sparkles, Download, Share2, Lightbulb } from 'lucide-react';
import { lolService, type LolAccount } from '@/lib/lol-service';
import { LOL_VERSION, getCDNUrl, getProfileIconUrl } from '@/lib/constants';

interface UserProfile {
  lolAccount?: LolAccount;
}

interface MatchParticipant {
  puuid: string;
  participantId: number;
  championId: number;
  championName: string;
  teamId: number;
  teamPosition: string;
  individualPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: any;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  win: boolean;
  riotIdGameName: string;
  riotIdTagline: string;
  champLevel: number;
}

interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    queueId: number;
    participants: MatchParticipant[];
    teams: any[];
  };
}

// Comprehensive queue mapping based on official Riot API
const QUEUE_NAMES: { [key: number]: string } = {
  0: 'Custom',
  2: 'Normal 5v5 Blind',
  4: 'Ranked Solo (Old)',
  6: 'Ranked Premade (Old)',
  7: 'Co-op vs AI',
  8: 'Normal 3v3',
  9: 'Ranked 3v3',
  14: 'Normal 5v5 Draft',
  16: 'Dominion Blind',
  17: 'Dominion Draft',
  25: 'Dominion Co-op vs AI',
  31: 'Co-op vs AI Intro',
  32: 'Co-op vs AI Beginner',
  33: 'Co-op vs AI Intermediate',
  41: 'Ranked Team 3v3',
  42: 'Ranked Team 5v5',
  52: 'Co-op vs AI 3v3',
  61: 'Team Builder',
  65: 'ARAM',
  67: 'ARAM Co-op vs AI',
  70: 'One for All',
  72: '1v1 Snowdown',
  73: '2v2 Snowdown',
  75: 'Hexakill',
  76: 'URF',
  78: 'One For All Mirror',
  83: 'Co-op vs AI URF',
  91: 'Doom Bots Rank 1',
  92: 'Doom Bots Rank 2',
  93: 'Doom Bots Rank 5',
  96: 'Ascension',
  98: 'Hexakill 3v3',
  100: 'Butcher\'s Bridge ARAM',
  300: 'Legend of Poro King',
  310: 'Nemesis',
  313: 'Black Market Brawlers',
  315: 'Nexus Siege',
  317: 'Definitely Not Dominion',
  318: 'ARURF',
  325: 'All Random',
  400: 'Normal Draft',
  410: 'Ranked Dynamic (Deprecated)',
  420: 'Ranked Solo/Duo',
  430: 'Normal Blind',
  440: 'Ranked Flex',
  450: 'ARAM',
  460: 'Normal 3v3',
  470: 'Ranked 3v3 Flex',
  480: 'Swiftplay',
  490: 'Quickplay',
  600: 'Blood Hunt Assassin',
  610: 'Dark Star: Singularity',
  700: 'Clash',
  720: 'ARAM Clash',
  800: 'Co-op vs AI 3v3 Intermediate',
  810: 'Co-op vs AI 3v3 Intro',
  820: 'Co-op vs AI 3v3 Beginner',
  830: 'Co-op vs AI Intro',
  840: 'Co-op vs AI Beginner',
  850: 'Co-op vs AI Intermediate',
  900: 'ARURF',
  910: 'Ascension',
  920: 'Legend of Poro King',
  940: 'Nexus Siege',
  950: 'Doom Bots Voting',
  960: 'Doom Bots Standard',
  980: 'Star Guardian Invasion: Normal',
  990: 'Star Guardian Invasion: Onslaught',
  1000: 'PROJECT: Hunters',
  1010: 'Snow ARURF',
  1020: 'One for All',
  1030: 'Odyssey Extraction: Intro',
  1040: 'Odyssey Extraction: Cadet',
  1050: 'Odyssey Extraction: Crewmember',
  1060: 'Odyssey Extraction: Captain',
  1070: 'Odyssey Extraction: Onslaught',
  1090: 'Teamfight Tactics',
  1100: 'Ranked Teamfight Tactics',
  1110: 'Teamfight Tactics Tutorial',
  1111: 'Teamfight Tactics Test',
  1200: 'Nexus Blitz (Deprecated)',
  1300: 'Nexus Blitz',
  1400: 'Ultimate Spellbook',
  1700: 'Arena',
  1710: 'Arena (16 players)',
  1900: 'Pick URF',
  2000: 'Tutorial 1',
  2010: 'Tutorial 2',
  2020: 'Tutorial 3',
};

// Game mode categories for filtering
const GAME_MODE_CATEGORIES = [
  { id: 'all', label: 'All Modes', queueIds: [] as number[] },
  { id: 'ranked', label: 'Ranked', queueIds: [420, 440, 470, 4, 6, 9, 41, 42, 410, 1100] },
  { id: 'normal', label: 'Normal', queueIds: [400, 430, 490, 2, 14, 8, 460] },
  { id: 'aram', label: 'ARAM', queueIds: [450, 65, 100, 720] },
  { id: 'urf', label: 'URF', queueIds: [76, 318, 900, 1010, 1900, 83] },
  { id: 'arena', label: 'Arena', queueIds: [1700, 1710] },
  { id: 'clash', label: 'Clash', queueIds: [700, 720] },
  { id: 'rotating', label: 'Rotating', queueIds: [1020, 920, 910, 940, 1400, 1200, 1300, 70, 300, 96, 315] },
  { id: 'special', label: 'Special', queueIds: [600, 610, 980, 990, 1000, 1030, 1040, 1050, 1060, 1070, 950, 960, 91, 92, 93, 75, 98, 78, 72, 73, 310, 313, 317, 325] },
  { id: 'coop', label: 'Co-op vs AI', queueIds: [7, 31, 32, 33, 52, 67, 800, 810, 820, 830, 840, 850] },
  { id: 'tft', label: 'TFT', queueIds: [1090, 1100, 1110, 1111] },
  { id: 'tutorial', label: 'Tutorial', queueIds: [2000, 2010, 2020] },
  { id: 'custom', label: 'Custom', queueIds: [0] },
];

const POSITION_NAMES: { [key: string]: string } = {
  TOP: 'Top',
  JUNGLE: 'Jungle',
  MIDDLE: 'Mid',
  BOTTOM: 'ADC',
  UTILITY: 'Support',
};

export default function MatchHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<{ [matchId: string]: string }>({});
  const [timelineData, setTimelineData] = useState<{ [matchId: string]: any }>({});
  const [loadingTimeline, setLoadingTimeline] = useState<{ [matchId: string]: boolean }>({});
  const [selectedPlayers, setSelectedPlayers] = useState<{ [matchId: string]: Set<number> }>({});
  const [activeMetric, setActiveMetric] = useState<{ [matchId: string]: 'gold' | 'damage' | 'cs' | 'exp' }>({});
  const [teammateIcons, setTeammateIcons] = useState<{ [puuid: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });
  const [currentCount, setCurrentCount] = useState(20);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [loadMoreCooldown, setLoadMoreCooldown] = useState(0);
  
  // Player tags state
  const [playerTags, setPlayerTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  
  // Search summoner state
  const [searchedSummoner, setSearchedSummoner] = useState<LolAccount | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Single unified search input
  const [selectedRegion, setSelectedRegion] = useState('euw1');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);

  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<any[]>([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Insights state
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // AI Coaching state
  const [matchCoaching, setMatchCoaching] = useState<Record<string, any>>({});
  const [loadingCoaching, setLoadingCoaching] = useState<Record<string, boolean>>({});

  // Use ref to track next offset to prevent race conditions with rapid clicks
  const nextOffsetRef = useRef(0);
  
  // Use ref to track if matches have been loaded to prevent unnecessary reloads on tab switch
  const matchesLoadedRef = useRef(false);

  // Cooldown timer effect
  useEffect(() => {
    if (loadMoreCooldown > 0) {
      const timer = setTimeout(() => {
        setLoadMoreCooldown(loadMoreCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [loadMoreCooldown]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user?.email) return;

      try {
        const response = await fetch('http://localhost:3001/users/profile/full', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: session.user.email
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      }
    };

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, session]);

  useEffect(() => {
    // Only load matches once when puuid becomes available, unless explicitly refreshed
    if (profile?.lolAccount?.puuid && !matchesLoadedRef.current && matches.length === 0) {
      matchesLoadedRef.current = true;
      loadCachedMatches();
    } else if (!profile?.lolAccount?.puuid) {
      setLoading(false);
    }
  }, [profile?.lolAccount?.puuid]); // Only depend on puuid, not entire profile object

  // Fetch player tags when matches are loaded and account changes
  useEffect(() => {
    if (matches.length > 0) {
      const currentAccount = searchedSummoner || profile?.lolAccount;
      if (currentAccount) {
        console.log('[Player Tags] Fetching tags for account:', currentAccount.gameName);
        fetchPlayerTags(currentAccount);
      }
    }
  }, [matches.length, searchedSummoner?.puuid, profile?.lolAccount?.puuid]);

  // Fetch teammate profile icons when matches change
  useEffect(() => {
    if (matches.length > 0 && profile?.lolAccount?.puuid) {
      fetchTeammateIcons();
    }
  }, [matches, profile]);

  // Load cached teammate icons from localStorage on mount
  useEffect(() => {
    const cachedIcons = localStorage.getItem('teammateIcons');
    if (cachedIcons) {
      try {
        const parsed = JSON.parse(cachedIcons);
        const cacheTime = localStorage.getItem('teammateIconsTime');
        const now = Date.now();
        
        // Use cache if less than 24 hours old
        if (cacheTime && (now - parseInt(cacheTime)) < 24 * 60 * 60 * 1000) {
          console.log('[Teammate Icons] Loaded from localStorage cache');
          setTeammateIcons(parsed);
        } else {
          // Clear expired cache
          localStorage.removeItem('teammateIcons');
          localStorage.removeItem('teammateIconsTime');
        }
      } catch (error) {
        console.error('[Teammate Icons] Error loading cache:', error);
      }
    }
  }, []);

  const fetchTeammateIcons = async () => {
    if (!profile?.lolAccount?.puuid || matches.length === 0) return;

    const region = profile.lolAccount.region;
    const uniquePuuids = new Set<string>();
    
    // Collect all unique teammate PUUIDs
    matches.forEach(match => {
      const playerData = match.info.participants.find(p => p.puuid === profile.lolAccount?.puuid);
      if (!playerData) return;
      
      // Find teammates (same team, different player)
      match.info.participants
        .filter(p => p.teamId === playerData.teamId && p.puuid !== profile.lolAccount?.puuid)
        .forEach(teammate => {
          uniquePuuids.add(teammate.puuid);
        });
    });

    // Skip if already fetched all icons
    const alreadyFetched = Array.from(uniquePuuids).every(puuid => teammateIcons[puuid] !== undefined);
    if (alreadyFetched) {
      console.log('[Teammate Icons] All icons already fetched, skipping');
      return;
    }

    console.log(`[Teammate Icons] Fetching icons for ${uniquePuuids.size} teammates...`);

    try {
      // Use batch endpoint for efficient fetching with caching
      const response = await fetch(
        'http://localhost:3001/api/v1/riot/summoner/batch',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            summoners: Array.from(uniquePuuids).map(puuid => ({ puuid, region }))
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summoner batch');
      }

      const data = await response.json();
      console.log(`[Teammate Icons] Fetched ${data.fetched} new, ${data.cached} from cache`);

      // Build icon map from results
      const icons: { [puuid: string]: number } = { ...teammateIcons }; // Keep existing icons
      
      data.summoners.forEach((summoner: any) => {
        icons[summoner.puuid] = summoner.profileIconId;
      });

      setTeammateIcons(icons);
      
      // Save to localStorage for persistence across refreshes
      try {
        localStorage.setItem('teammateIcons', JSON.stringify(icons));
        localStorage.setItem('teammateIconsTime', Date.now().toString());
      } catch (error) {
        console.error('[Teammate Icons] Error saving to localStorage:', error);
      }
    } catch (error) {
      console.error('[Teammate Icons] Error fetching batch:', error);
      
      // Fallback: set default icons for any missing
      const icons: { [puuid: string]: number } = { ...teammateIcons };
      Array.from(uniquePuuids).forEach(puuid => {
        if (!icons[puuid]) {
          icons[puuid] = 29; // Default icon
        }
      });
      setTeammateIcons(icons);
    }
  };

  const fetchPlayerTags = async (account: LolAccount | null) => {
    if (!account?.puuid) return;

    setTagsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/player-tags/${account.puuid}?region=${account.region}`
      );

      if (response.ok) {
        const data = await response.json();
        setPlayerTags(data.tags || []);
        console.log('[Player Tags] Loaded tags:', data.tags);
      }
    } catch (error) {
      console.error('[Player Tags] Error fetching tags:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const refreshPlayerTags = async (account: LolAccount | null) => {
    if (!account?.puuid) return;

    setTagsLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/player-tags/${account.puuid}/refresh?region=${account.region}`,
        { method: 'POST' }
      );

      if (response.ok) {
        const data = await response.json();
        setPlayerTags(data.tags || []);
        console.log('[Player Tags] Refreshed tags:', data.tags);
      }
    } catch (error) {
      console.error('[Player Tags] Error refreshing tags:', error);
    } finally {
      setTagsLoading(false);
    }
  };

  const loadCachedMatches = async () => {
    if (!profile?.lolAccount?.puuid) return;

    setLoading(true);
    try {
      console.log('[Match History] Checking cache for:', {
        puuid: profile.lolAccount.puuid,
        region: profile.lolAccount.region,
      });

      // Try to load ALL cached matches from backend
      const cachedResponse = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${profile.lolAccount.puuid}/cached?region=${profile.lolAccount.region}&count=1000` // Get all cached matches
      );

      console.log('[Cache Check] Response status:', cachedResponse.status, 'OK:', cachedResponse.ok);

      if (cachedResponse.ok) {
        const cachedData = await cachedResponse.json();
        console.log('[Cache Check] Cache data:', {
          hasMatches: !!cachedData.matches,
          matchCount: cachedData.matches?.length || 0,
          fromCache: cachedData.fromCache
        });
        
        if (cachedData.matches && cachedData.matches.length > 0) {
          console.log('[Match History] ✅ LOADED FROM SERVER CACHE:', cachedData.matches.length, 'matches');
          // Sort matches by game creation date (latest first)
          const sortedMatches = [...cachedData.matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
          setMatches(sortedMatches);
          // Reset offset for Load More to continue from where cache ends
          nextOffsetRef.current = sortedMatches.length;
          console.log('[Match History] Set next offset to:', nextOffsetRef.current);

          // Fetch player tags after loading matches
          fetchPlayerTags(searchedSummoner || profile.lolAccount);
          
          // Add delay to allow images/assets to load before removing loading state
          await new Promise(resolve => setTimeout(resolve, 2000));
          setLoading(false);
          return;
        } else {
          console.log('[Cache Check] ⚠️ Cache empty or no matches, fetching from API');
        }
      } else {
        console.log('[Cache Check] ⚠️ Cache response not OK, fetching from API');
      }

      // No cache or cache empty, fetch and cache
      console.log('[Match History] No cache found, fetching fresh data...');
      await fetchAndCacheMatches(20);
    } catch (error) {
      console.error('[Match History] Error loading cached matches:', error);
      setLoading(false);
    }
  };

  const fetchAndCacheMatches = async (count: number = 20) => {
    if (!profile?.lolAccount?.puuid) return;

    try {
      console.log('[Match History] Fetching and caching matches:', count);

      const response = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${profile.lolAccount.puuid}/fetch-and-cache`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: profile.lolAccount.region,
            start: 0,
            count,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch and cache matches');
      }

      const data = await response.json();
      console.log('[Match History] Fetched:', data.newMatches, 'new matches');
      
      if (data.matches && data.matches.length > 0) {
        // Sort matches by game creation date (latest first)
        const sortedMatches = [...data.matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
        setMatches(sortedMatches);
        
        // Set hasMore based on response or assume true if we got matches
        console.log('[Match History] Set hasMore to:', data.hasMore !== undefined ? data.hasMore : true);
      }
      
      // Add delay to allow images/assets to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('[Match History] Error fetching and caching:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshMatches = async () => {
    const currentAccount = getCurrentAccount();
    if (!currentAccount?.puuid) return;

    setRefreshing(true);
    
    try {
      console.log('[FULL REFRESH] Starting complete data reload...');
      
      // Calculate how many matches to fetch (at least current count or 50, whichever is higher)
      const currentMatchCount = matches.length;
      const fetchCount = Math.max(currentMatchCount, 50);
      console.log('[FULL REFRESH] Will fetch', fetchCount, 'matches (current:', currentMatchCount, ')');
      
      // Step 1: Clear all local state
      console.log('[FULL REFRESH] Clearing all state...');
      setMatches([]);
      setTeammateIcons({});
      setExpandedMatch(null);
      setActiveTab({});
      setTimelineData({});
      setLoadingTimeline({});
      setAiInsights(null); // Clear AI insights cache
      matchesLoadedRef.current = false; // Reset the loaded flag to allow reload
      
      // Step 2: Clear localStorage cache
      console.log('[FULL REFRESH] Clearing localStorage cache...');
      try {
        localStorage.removeItem('teammateIcons');
        localStorage.removeItem('teammateIconsTime');
      } catch (e) {
        console.warn('[FULL REFRESH] Could not clear localStorage:', e);
      }
      
      // Step 3: Force backend to re-fetch from Riot API (bypass cache)
      console.log('[FULL REFRESH] Forcing fresh data from Riot API...');
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${currentAccount.puuid}/fetch-and-cache`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: currentAccount.region,
            start: 0,
            count: fetchCount, // Fetch enough to replace what we had
            forceRefresh: true, // Signal to backend to bypass cache
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to refresh matches');
      }

      const data = await response.json();
      console.log('[FULL REFRESH] Received fresh data:', {
        totalMatches: data.matches?.length || 0,
        newMatches: data.newMatches || 0
      });
      
      // Step 4: Sort and set matches
      if (data.matches && data.matches.length > 0) {
        const sortedMatches = [...data.matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
        setMatches(sortedMatches);
        console.log('[FULL REFRESH] Loaded', sortedMatches.length, 'matches');
      } else {
        console.warn('[FULL REFRESH] No matches returned');
      }
      
      // Step 5: Add delay for assets to load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success notification
      const message = data.newMatches > 0 
        ? `✅ Refresh complete! Found ${data.newMatches} new match${data.newMatches > 1 ? 'es' : ''}. Total: ${data.matches?.length || 0}`
        : `✅ Refresh complete! Reloaded ${data.matches?.length || 0} matches`;
      console.log('[FULL REFRESH]', message);
      alert(message);
      
    } catch (error) {
      console.error('[FULL REFRESH] Error during refresh:', error);
      alert('❌ Failed to refresh. Please try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const loadMoreMatches = async () => {
    const currentAccount = getCurrentAccount();
    if (!currentAccount?.puuid || loadingMore || loadMoreCooldown > 0) return;

    setLoadingMore(true);
    try {
      // Use ref to get current offset (updated immediately, not after state update)
      const offset = nextOffsetRef.current;
      console.log(`[Load More Frontend] Loading from offset ${offset}`);

      const response = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${currentAccount.puuid}/load-more`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: currentAccount.region,
            offset,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Load More Frontend] Error response:', response.status, errorText);
        throw new Error(`Failed to load more matches: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('[Load More Frontend] Got', data.matches?.length || 0, 'matches');

      if (data.matches && data.matches.length > 0) {
        // Filter duplicates and add new matches
        const existingIds = new Set(matches.map(m => m.metadata.matchId));
        const newMatches = data.matches.filter(
          (m: Match) => !existingIds.has(m.metadata.matchId)
        );
        
        if (newMatches.length > 0) {
          const allMatches = [...matches, ...newMatches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
          setMatches(allMatches);
          console.log('[Load More Frontend] ✅ Added', newMatches.length, 'matches. Total:', allMatches.length);
          
          // Invalidate AI insights cache since match count changed
          setAiInsights(null);
          console.log('[Load More Frontend] Invalidated AI insights cache - will refetch with new data');
          
          // Refresh player tags with updated match count
          const currentAccount = getCurrentAccount();
          if (currentAccount) {
            refreshPlayerTags(currentAccount);
          }
          
          // Update offset for next request
          nextOffsetRef.current = offset + data.matches.length;
          console.log('[Load More Frontend] Next offset will be:', nextOffsetRef.current);
        } else {
          // All matches were duplicates, still increment offset
          nextOffsetRef.current = offset + data.matches.length;
          console.log('[Load More Frontend] All duplicates, incrementing offset to:', nextOffsetRef.current);
        }
        
        // Start 10-second cooldown
        setLoadMoreCooldown(10);
      } else {
        // No more matches available
        alert('No more matches available for this season');
        console.log('[Load More Frontend] No more matches from Riot API');
      }
    } catch (error) {
      console.error('[Load More Frontend] Error:', error);
      alert('Failed to load more matches. Please try again.');
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMatches = async (count: number = 20) => {
    // Legacy function - redirect to cached version
    await loadCachedMatches();
  };

  const fetchTimeline = async (matchId: string, region?: string) => {
    if (timelineData[matchId] || loadingTimeline[matchId]) return;

    setLoadingTimeline({ ...loadingTimeline, [matchId]: true });
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${matchId}/timeline?region=${region || 'americas'}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setTimelineData({ ...timelineData, [matchId]: data });
    } catch (error) {
      console.error('[Timeline] Error fetching timeline:', error);
    } finally {
      setLoadingTimeline({ ...loadingTimeline, [matchId]: false });
    }
  };

  // Get currently displayed account (searched summoner or logged-in user)
  const getCurrentAccount = (): LolAccount | undefined => {
    return searchedSummoner || profile?.lolAccount;
  };

  // Fetch autocomplete suggestions
  const fetchAutocompleteSuggestions = async (query: string) => {
    // Extract just the gameName part (before #) for searching
    const searchTerm = query.split('#')[0].trim();
    
    if (searchTerm.length === 0) {
      setAutocompleteSuggestions([]);
      setShowAutocomplete(false);
      return;
    }

    setAutocompleteLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/summoner/autocomplete?q=${encodeURIComponent(searchTerm)}&region=${selectedRegion}&limit=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Autocomplete] Received suggestions:', data.suggestions?.length);
        setAutocompleteSuggestions(data.suggestions || []);
        setShowAutocomplete(data.suggestions?.length > 0);
      } else {
        console.error('[Autocomplete] Response not ok:', response.status);
      }
    } catch (error) {
      console.error('[Autocomplete] Error:', error);
    } finally {
      setAutocompleteLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchQueryChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear previous timeout
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    // Set new timeout for autocomplete
    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(value);
    }, 300); // 300ms debounce
  };

  // Handle selecting an autocomplete suggestion
  const handleSelectSuggestion = (suggestion: any) => {
    setSearchQuery(`${suggestion.gameName}#${suggestion.tagLine}`);
    setSelectedRegion(suggestion.region);
    setShowAutocomplete(false);
    setAutocompleteSuggestions([]);
    // Auto-trigger search
    setTimeout(() => handleSearchSummoner(suggestion.gameName, suggestion.tagLine, suggestion.region), 100);
  };

  // Navigate to any summoner (reusable function for clicking on summoners anywhere)
  const navigateToSummoner = async (gameName: string, tagLine: string, region?: string) => {
    // Update search query to show what we're searching for
    setSearchQuery(`${gameName}#${tagLine}`);
    if (region) {
      setSelectedRegion(region);
    }
    
    // Trigger search with the summoner's data
    await handleSearchSummoner(gameName, tagLine, region || selectedRegion);
    
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Fetch AI Insights for current summoner
  const fetchAIInsights = async () => {
    const currentAccount = getCurrentAccount();
    if (!currentAccount || matches.length === 0) {
      alert('No match data available for insights');
      return;
    }

    setLoadingInsights(true);
    try {
      const response = await fetch('http://localhost:3001/api/v1/riot/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid: currentAccount.puuid,
          gameName: currentAccount.gameName,
          tagLine: currentAccount.tagLine,
          region: currentAccount.region,
          matches: matches
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate insights');
      }

      const data = await response.json();
      setAiInsights(data);
    } catch (error) {
      console.error('[AI Insights] Error:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setLoadingInsights(false);
    }
  };

  // Download AI Insights as Image
  const downloadInsightsImage = async () => {
    const currentAccount = getCurrentAccount();
    if (!aiInsights || !currentAccount) {
      alert('No insights data available');
      return;
    }

    try {
      // Dynamically import dom-to-image-more (better modern CSS support)
      const domtoimage = await import('dom-to-image-more');
      
      // Get the insights content element
      const element = document.getElementById('ai-insights-content');
      if (!element) {
        console.error('Could not find insights content element');
        alert('Failed to find insights content. Please try again.');
        return;
      }

      console.log('Generating image from element...', element);
      console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);

      // Show loading state
      const originalCursor = document.body.style.cursor;
      document.body.style.cursor = 'wait';

      try {
        // Hide decorative corner elements that don't render well
        const decorativeElements = element.querySelectorAll('.absolute[class*="border-t"], .absolute[class*="border-b"]');
        const originalDisplays: { element: HTMLElement; display: string }[] = [];
        
        decorativeElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          // Only hide if it's a small decorative element (corner brackets)
          if (htmlEl.offsetWidth < 20 && htmlEl.offsetHeight < 20) {
            originalDisplays.push({ element: htmlEl, display: htmlEl.style.display });
            htmlEl.style.display = 'none';
          }
        });

        // Wait for DOM updates
        await new Promise(resolve => setTimeout(resolve, 50));

        // Use a scale factor for better quality  
        const scale = 2;
        
        // Generate PNG using dom-to-image-more with optimized settings
        const dataUrl = await domtoimage.toPng(element, {
          quality: 1.0,
          bgcolor: '#0a0f1a',
          cacheBust: true,
          width: element.offsetWidth * scale,
          height: element.offsetHeight * scale,
          style: {
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            width: element.offsetWidth + 'px',
            height: element.offsetHeight + 'px',
            margin: '0',
            padding: '24px',
            backgroundColor: '#0a0f1a',
          }
        });

        // Restore decorative elements
        originalDisplays.forEach(({ element: el, display }) => {
          el.style.display = display;
        });

        console.log('Image generated successfully, data URL length:', dataUrl.length);

        // Convert data URL to blob
        const base64 = dataUrl.split(',')[1];
        const binary = atob(base64);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          array[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([array], { type: 'image/png' });

        console.log('Blob created, size:', blob.size);

        // Download the blob
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `${currentAccount.gameName}-season-rewind.png`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up after a delay
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 100);

        console.log('Download completed');
      } finally {
        // Restore cursor
        document.body.style.cursor = originalCursor;
      }
    } catch (error) {
      console.error('Error generating image:', error);
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      alert(`Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Share AI Insights
  const shareInsights = async () => {
    const currentAccount = getCurrentAccount();
    if (!aiInsights || !currentAccount) {
      alert('No insights data available');
      return;
    }

    try {
      // Dynamically import dom-to-image-more
      const domtoimage = await import('dom-to-image-more');
      
      const element = document.getElementById('ai-insights-content');
      if (!element) {
        console.error('Could not find insights content element');
        alert('Failed to find insights content. Please try again.');
        return;
      }

      console.log('Generating image for sharing...');

      // Generate blob from element
      const blob = await domtoimage.toBlob(element, {
        quality: 1.0,
        bgcolor: '#0a0f1a',
        cacheBust: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left'
        }
      });

      console.log('Image generated for sharing');

      // Check if Web Share API is available
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `${currentAccount.gameName}-season-rewind.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: `${currentAccount.gameName}'s Season Rewind`,
              text: `Check out my League of Legends season stats!`,
              files: [file]
            });
            console.log('Shared successfully');
          } catch (err) {
            // User cancelled or share failed, fallback to download
            if ((err as Error).name !== 'AbortError') {
              await downloadInsightsImage();
            }
          }
        } else {
          // Files not supported, fallback to download
          await downloadInsightsImage();
        }
      } else {
        // Web Share API not available, fallback to download
        await downloadInsightsImage();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert(`Failed to share: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Fetch AI Coaching for a specific match
  const fetchAICoaching = async (matchId: string, match: any) => {
    const currentAccount = getCurrentAccount();
    if (!currentAccount) {
      alert('No account selected');
      return;
    }

    // Check if already loading or loaded
    if (loadingCoaching[matchId] || matchCoaching[matchId]) {
      return;
    }

    setLoadingCoaching({ ...loadingCoaching, [matchId]: true });

    try {
      const response = await fetch('http://localhost:3001/api/v1/riot/insights/coaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          puuid: currentAccount.puuid,
          match: match
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate coaching');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to generate coaching');
      }

      setMatchCoaching({ ...matchCoaching, [matchId]: data.coaching });
    } catch (error) {
      console.error('[AI Coaching] Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to generate coaching. Please try again.');
    } finally {
      setLoadingCoaching({ ...loadingCoaching, [matchId]: false });
    }
  };

  // Parse search query (GameName#TAG format)
  const parseSearchQuery = (query: string): { gameName: string; tagline: string } | null => {
    const trimmed = query.trim();
    if (!trimmed) return null;

    // Check if it contains #
    if (trimmed.includes('#')) {
      const [gameName, tagline] = trimmed.split('#').map(s => s.trim());
      if (gameName && tagline) {
        return { gameName, tagline };
      }
    }
    
    return null;
  };

  // Search for a summoner
  const handleSearchSummoner = async (forceName?: string, forceTag?: string, forceRegion?: string) => {
    let gameName: string;
    let tagline: string;
    let region = forceRegion || selectedRegion;

    // Use forced values if provided (from autocomplete)
    if (forceName && forceTag) {
      gameName = forceName;
      tagline = forceTag;
    } else {
      // Parse the search query
      const parsed = parseSearchQuery(searchQuery);
      if (!parsed) {
        setSearchError('Please enter summoner name in format: GameName#TAG');
        return;
      }
      gameName = parsed.gameName;
      tagline = parsed.tagline;
    }

    setIsSearching(true);
    setSearchError('');
    setLoading(true);
    setShowAutocomplete(false); // Hide autocomplete when searching
    
    // Reset tags when switching summoners
    setPlayerTags([]);
    
    // Clear AI insights cache when searching for new summoner
    setAiInsights(null);

    try {
      // Search for summoner
      const result = await lolService.searchSummoner({
        gameName: gameName.trim(),
        tagline: tagline.trim(),
        region: region
      });

      // Convert to LolAccount format
      const summonerAccount: LolAccount = {
        puuid: result.account.puuid,
        gameName: result.account.gameName,
        tagLine: result.account.tagLine,
        summonerLevel: result.summoner.summonerLevel,
        profileIconId: result.summoner.profileIconId,
        region: region,
        rankedData: result.rankedData,
        lastUpdated: new Date().toISOString()
      };

      setSearchedSummoner(summonerAccount);
      
      // Fetch matches for this summoner
      await fetchSummonerMatches(summonerAccount);
      
    } catch (err: any) {
      setSearchError(err.message || 'Failed to find summoner. Please check your details and try again.');
      setLoading(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch matches for a summoner (searched or logged-in user)
  const fetchSummonerMatches = async (account: LolAccount, count: number = 50) => {
    try {
      setLoading(true);
      // Reset matches to ensure clean slate
      setMatches([]);
      // Reset tags when loading new summoner
      setPlayerTags([]);
      matchesLoadedRef.current = false; // Reset the loaded flag when searching for new summoner
      console.log('[Match History] Fetching matches for summoner:', account.gameName, 'Count:', count);

      // Try cache first - get ALL cached matches
      const cachedResponse = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${account.puuid}/cached?region=${account.region}&count=1000` // Get all cached matches
      );

      console.log('[Cache Check] Response status:', cachedResponse.status, 'OK:', cachedResponse.ok);

      if (cachedResponse.ok) {
        const cachedData = await cachedResponse.json();
        console.log('[Cache Check] Cache data:', {
          hasMatches: !!cachedData.matches,
          matchCount: cachedData.matches?.length || 0,
          fromCache: cachedData.fromCache
        });
        
        if (cachedData.matches && cachedData.matches.length > 0) {
          console.log('[Match History] ✅ LOADED FROM CACHE:', cachedData.matches.length, 'matches');
          // Sort matches by game creation date (latest first)
          const sortedMatches = [...cachedData.matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
          setMatches(sortedMatches);
          // Reset offset for Load More to continue from where cache ends
          nextOffsetRef.current = sortedMatches.length;
          console.log('[Match History] Set next offset to:', nextOffsetRef.current);

          // Fetch player tags for this summoner
          fetchPlayerTags(account);
          
          // Add delay to allow images/assets to load before removing loading state
          await new Promise(resolve => setTimeout(resolve, 2000));
          setLoading(false);
          return;
        } else {
          console.log('[Cache Check] ⚠️ Cache empty or no matches, fetching from API');
        }
      } else {
        console.log('[Cache Check] ⚠️ Cache response not OK, fetching from API');
      }

      // Fetch and cache if no cache - fetch initial batch
      const response = await fetch(
        `http://localhost:3001/api/v1/riot/matches/${account.puuid}/fetch-and-cache`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            region: account.region,
            start: 0,
            count: 20, // Start with 20 matches for new summoners
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }

      const data = await response.json();
      console.log('[Match History] Fetched:', data.newMatches || data.matches?.length, 'matches from API');
      
      if (data.matches && data.matches.length > 0) {
        // Sort matches by game creation date (latest first)
        const sortedMatches = [...data.matches].sort((a, b) => b.info.gameCreation - a.info.gameCreation);
        setMatches(sortedMatches);
        console.log('[Match History] Total matches loaded:', sortedMatches.length);
        
        // Fetch player tags for this summoner
        fetchPlayerTags(account);
        
        // Set hasMore based on response or assume true if we got matches
        console.log('[Match History] Set hasMore to:', data.hasMore !== undefined ? data.hasMore : true);
      }
      
      // Add delay to allow images/assets to load
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('[Match History] Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  // Return to logged-in user's profile
  const handleReturnToMyProfile = () => {
    setSearchedSummoner(null);
    setSearchQuery('');
    setSelectedRegion('euw1');
    setSearchError('');
    setSelectedFilter('all');
    setMatches([]); // Clear matches before reloading
    setPlayerTags([]); // Clear tags when returning to own profile
    setAiInsights(null); // Clear AI insights cache
    matchesLoadedRef.current = false; // Reset the loaded flag when returning to own profile
    
    if (profile?.lolAccount) {
      loadCachedMatches(); // Use the original function that was working
    }
  };

  const getPlayerData = (match: Match): MatchParticipant | undefined => {
    const currentAccount = getCurrentAccount();
    return match.info.participants.find(
      (p) => p.puuid === currentAccount?.puuid
    );
  };

  const getKDA = (player: MatchParticipant): string => {
    if (player.deaths === 0) return 'Perfect';
    return (((player.kills + player.assists) / player.deaths)).toFixed(2);
  };

  const getCS = (player: MatchParticipant): number => {
    return player.totalMinionsKilled + player.neutralMinionsKilled;
  };

  const getCSPerMin = (player: MatchParticipant, duration: number): string => {
    const cs = getCS(player);
    const minutes = duration / 60;
    return (cs / minutes).toFixed(1);
  };

  const getChampionImageUrl = (championId: number): string => {
    // Use Community Dragon CDN which accepts champion IDs directly
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`;
  };

  const getItemImageUrl = (itemId: number): string => {
    if (itemId === 0) return '';
    return getCDNUrl(`img/item/${itemId}.png`);
  };

  const getSummonerSpellImageUrl = (spellId: number): string => {
    const spellMap: { [key: number]: string } = {
      1: 'SummonerBoost',
      3: 'SummonerExhaust',
      4: 'SummonerFlash',
      6: 'SummonerHaste',
      7: 'SummonerHeal',
      11: 'SummonerSmite',
      12: 'SummonerTeleport',
      13: 'SummonerMana',
      14: 'SummonerDot',
      21: 'SummonerBarrier',
      30: 'SummonerPoroRecall',
      31: 'SummonerPoroThrow',
      32: 'SummonerSnowball',
      39: 'SummonerSnowURFSwirl',
      54: 'Summoner_UltBookPlaceholder',
      55: 'Summoner_UltBookSmitePlaceholder',
    };
    const spellKey = spellMap[spellId] || 'SummonerFlash';
    return getCDNUrl(`img/spell/${spellKey}.png`);
  };

  // Extract keystone rune ID from perks object
  const getKeystoneRuneId = (perks: any): number => {
    return perks?.styles?.[0]?.selections?.[0]?.perk || 0;
  };

  // Extract secondary tree ID from perks object
  const getSecondaryTreeId = (perks: any): number => {
    return perks?.styles?.[1]?.style || 0;
  };

  // Get keystone rune image URL
  const getKeystoneRuneImageUrl = (keystoneId: number): string => {
    const keystoneMap: { [key: number]: string } = {
      // Domination
      8112: 'Domination/Electrocute/Electrocute',
      8128: 'Domination/DarkHarvest/DarkHarvest',
      9923: 'Domination/HailOfBlades/HailOfBlades',
      // Precision
      8005: 'Precision/PressTheAttack/PressTheAttack',
      8008: 'Precision/LethalTempo/LethalTempoTemp',
      8021: 'Precision/FleetFootwork/FleetFootwork',
      8010: 'Precision/Conqueror/Conqueror',
      // Sorcery
      8214: 'Sorcery/SummonAery/SummonAery',
      8229: 'Sorcery/ArcaneComet/ArcaneComet',
      8230: 'Sorcery/PhaseRush/PhaseRush',
      // Resolve
      8437: 'Resolve/GraspOfTheUndying/GraspOfTheUndying',
      8439: 'Resolve/VeteranAftershock/VeteranAftershock',
      8465: 'Resolve/Guardian/Guardian',
      // Inspiration
      8351: 'Inspiration/GlacialAugment/GlacialAugment',
      8360: 'Inspiration/UnsealedSpellbook/UnsealedSpellbook',
      8369: 'Inspiration/FirstStrike/FirstStrike',
    };

    const runePath = keystoneMap[keystoneId];
    if (!runePath) return '';
    
    return `https://ddragon.canisback.com/img/perk-images/Styles/${runePath}.png`;
  };

  // Get secondary tree icon URL
  const getSecondaryTreeImageUrl = (treeId: number): string => {
    const treeMap: { [key: number]: string } = {
      8000: '7201_Precision.png',    // Precision (gold)
      8100: '7200_Domination.png',   // Domination (red)
      8200: '7202_Sorcery.png',      // Sorcery (blue)
      8300: '7203_Whimsy.png',       // Inspiration (teal)
      8400: '7204_Resolve.png',      // Resolve (green)
    };

    const treeIcon = treeMap[treeId];
    if (!treeIcon) return '';
    
    return `https://ddragon.canisback.com/img/perk-images/Styles/${treeIcon}`;
  };

  const formatGameDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  // Get role icon URL
  const getRoleIconUrl = (position: string): string => {
    const roleMap: { [key: string]: string } = {
      'TOP': '/Position_Challenger-Top.png',
      'JUNGLE': '/Position_Challenger-Jungle.png',
      'MIDDLE': '/Position_Challenger-Mid.png',
      'BOTTOM': '/Position_Challenger-Bot.png',
      'UTILITY': '/Position_Challenger-Support.png',
    };
    return roleMap[position] || '';
  };

  // Get player position with proper fallback logic
  const getPlayerPosition = (participant: MatchParticipant): string => {
    // Primary source: teamPosition (most reliable for ranked games)
    if (participant.teamPosition && participant.teamPosition !== '' && participant.teamPosition !== 'NONE') {
      return participant.teamPosition;
    }
    // Fallback: individualPosition
    if (participant.individualPosition && participant.individualPosition !== '' && participant.individualPosition !== 'NONE') {
      return participant.individualPosition;
    }
    return '';
  };

  // Check if game mode has positions
  const hasPositions = (queueId: number): boolean => {
    // Queue IDs that have defined positions
    const positionQueues = [
      420, // Ranked Solo/Duo
      440, // Ranked Flex
      400, // Normal Draft
      430, // Normal Blind
      490, // Normal (Quickplay)
    ];
    return positionQueues.includes(queueId);
  };

  // Filter matches based on selected filter
  const getFilteredMatches = (): Match[] => {
    if (selectedFilter === 'all') return matches;
    
    const category = GAME_MODE_CATEGORIES.find(c => c.id === selectedFilter);
    if (!category) return matches;
    
    return matches.filter(match => category.queueIds.includes(match.info.queueId));
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#050a15] relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-[#5383E8]/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Scan lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.03)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AnimatedLogo size="lg" variant="futuristic" />
            <p className="text-cyan-400 mt-4 font-mono tracking-wider drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">LOADING MATCH HISTORY...</p>
            {loadingProgress.total > 0 && (
              <div className="mt-4">
                <div className="w-64 bg-[#0a1628] rounded-none h-2 mx-auto border border-cyan-400/30 overflow-hidden relative">
                  {/* Progress bar glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent"></div>
                  <div
                    className="bg-gradient-to-r from-[#5383E8] via-cyan-400 to-[#5383E8] h-full transition-all duration-300 relative shadow-[0_0_15px_rgba(0,255,255,0.8)]"
                    style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                  >
                    {/* Animated shimmer */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mt-2 font-mono">
                  <span className="text-cyan-400">{loadingProgress.current}</span> / {loadingProgress.total}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
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
      
      <div className="relative z-10">
        <NavigationDrawer>
          <div /></NavigationDrawer>

      {/* Header with Logo and Home Icon */}
      <header className="container mx-auto px-4 pt-8 pb-4 max-w-[1400px] flex items-center justify-between" style={{ marginTop: '-790px' }}>
        <div className="flex items-center space-x-4">
          {searchedSummoner && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleReturnToMyProfile}
              className="relative group/home bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] p-3 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)] transition-all"
              title="Return to My Profile"
            >
              <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-white/50"></div>
              <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-white/50"></div>
              <Home className="w-5 h-5 text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
            </motion.button>
          )}
        </div>
        <AnimatedLogo size="md" variant="futuristic" />
        <div className="w-16"></div> {/* Spacer for alignment */}
      </header>

      {/* Search Section */}
      <div className="container mx-auto px-4 pb-6 max-w-[1400px] relative z-50">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-5 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] overflow-visible mb-4"
        >
          {/* Tech lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
          
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] mb-4">
              Search Summoner
            </h3>
            
            <div className="flex items-end space-x-3">
              {/* Region Dropdown */}
              <div className="flex-shrink-0 w-32">
                <label className="block text-xs text-gray-400 font-mono uppercase tracking-wider mb-2">Region</label>
                <div className="relative">
                  <button
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                    className="w-full bg-[#0a1628] border border-cyan-400/30 px-3 py-2.5 text-left text-white font-mono text-sm hover:border-cyan-400/50 transition-colors relative group"
                  >
                    <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyan-400/40"></div>
                    <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyan-400/40"></div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 text-xs font-bold">
                        {selectedRegion.toUpperCase()}
                      </span>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </button>
                  
                  {showRegionDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 w-full mt-1 bg-[#0a1628] border-2 border-cyan-400/30 shadow-[0_0_30px_rgba(0,255,255,0.3)] max-h-64 overflow-y-auto"
                    >
                      {lolService.getAvailableRegions().map((region) => (
                        <button
                          key={region.value}
                          onClick={() => {
                            setSelectedRegion(region.value);
                            setShowRegionDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left font-mono text-sm transition-colors ${
                            selectedRegion === region.value
                              ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white'
                              : 'text-gray-400 hover:bg-cyan-400/10 hover:text-cyan-400'
                          }`}
                        >
                          {region.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              </div>
              
              {/* Unified Search Input (GameName#TAG) */}
              <div className="flex-1 relative">
                <label className="block text-xs text-gray-400 font-mono uppercase tracking-wider mb-2">
                  Summoner Name 
                  <span className="ml-2 text-gray-500 text-[10px]">(Format: GameName#TAG)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchQueryChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchSummoner();
                      } else if (e.key === 'Escape') {
                        setShowAutocomplete(false);
                      }
                    }}
                    onFocus={() => searchQuery.length > 0 && autocompleteSuggestions.length > 0 && setShowAutocomplete(true)}
                    onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)} // Delay to allow click
                    placeholder="e.g., Faker#KR1 or just type 's' to search..."
                    className="w-full bg-[#0a1628] border border-cyan-400/30 px-4 py-2.5 text-white font-mono text-sm placeholder-gray-600 focus:border-cyan-400/50 focus:outline-none transition-colors"
                    autoComplete="off"
                  />
                  <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-cyan-400/40"></div>
                  <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-cyan-400/40"></div>
                  
                  {/* Loading indicator */}
                  {autocompleteLoading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                    </div>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                <AnimatePresence>
                  {showAutocomplete && autocompleteSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 right-0 mt-1 bg-[#0a1628] border-2 border-cyan-400/40 shadow-[0_0_30px_rgba(0,255,255,0.4)] max-h-80 overflow-y-auto"
                      style={{ zIndex: 99999, position: 'absolute' }}
                    >
                      {autocompleteSuggestions.map((suggestion, idx) => (
                        <button
                          key={`${suggestion.puuid}-${idx}`}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-cyan-400/10 transition-colors border-b border-cyan-400/10 last:border-b-0"
                        >
                          {/* Profile Icon */}
                          <div className="relative w-10 h-10 flex-shrink-0">
                            <Image
                              src={getProfileIconUrl(suggestion.profileIconId)}
                              alt={suggestion.gameName}
                              width={40}
                              height={40}
                              className="rounded-full border-2 border-cyan-400/50"
                            />
                            <div className="absolute -bottom-1 -right-1 bg-[#0a1628] rounded-full px-1.5 py-0.5 border border-cyan-400/50">
                              <span className="text-[10px] font-bold text-cyan-400">{suggestion.summonerLevel}</span>
                            </div>
                          </div>

                          {/* Name and Region */}
                          <div className="flex-1 text-left">
                            <div className="font-mono text-sm text-white">
                              {suggestion.gameName}<span className="text-gray-500">#{suggestion.tagLine}</span>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">{suggestion.region.toUpperCase()}</div>
                          </div>

                          {/* Arrow */}
                          <ChevronDown className="w-4 h-4 text-cyan-400 rotate-[-90deg]" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {/* Search Button */}
              <button
                onClick={() => handleSearchSummoner()}
                disabled={isSearching}
                className="relative bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white px-6 py-2.5 font-bold font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]"
              >
                <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-white/50"></div>
                <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-white/50"></div>
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SEARCHING...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>SEARCH</span>
                  </>
                )}
              </button>
              
              {/* Clear Button (only show when there's a searched summoner) */}
              {searchedSummoner && (
                <button
                  onClick={handleReturnToMyProfile}
                  className="relative bg-[#0a1628] border border-red-400/50 text-red-400 px-4 py-2.5 font-bold font-mono hover:bg-red-400/10 transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(248,113,113,0.3)] hover:shadow-[0_0_25px_rgba(248,113,113,0.5)]"
                >
                  <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-red-400/50"></div>
                  <div className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2 border-red-400/50"></div>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Error Message */}
            {searchError && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center space-x-2 text-red-400 text-sm font-mono"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{searchError}</span>
              </motion.div>
            )}
            
            {/* Currently Viewing Indicator */}
            {searchedSummoner && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center space-x-2 text-cyan-400 text-sm font-mono"
              >
                <Search className="w-4 h-4" />
                <span>Viewing: {searchedSummoner.gameName}#{searchedSummoner.tagLine}</span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 pb-6 max-w-[1400px]">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Profile & Stats */}
          <div className="col-span-3 space-y-4">
            {/* Profile Card */}
            {getCurrentAccount() && (
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
                
                {/* Summoner Info */}
                <div className="flex items-center space-x-4 mb-6 relative z-10">
                  <div className="relative group">
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 shadow-[0_0_30px_rgba(0,255,255,0.4)] group-hover:shadow-[0_0_40px_rgba(0,255,255,0.6)] transition-all duration-300"></div>
                    
                    {/* Outer glow border */}
                    <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400 via-[#5383E8] to-cyan-400 opacity-50 blur-md"></div>
                    
                    <div className="relative w-24 h-24 overflow-hidden border-2 border-cyan-400/50 bg-gradient-to-br from-[#0a1628] to-[#1a2f4a]">
                      <Image
                        src={lolService.getSummonerIconUrl(getCurrentAccount()?.profileIconId || 0)}
                        alt="Profile Icon"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                        priority
                      />
                      {/* Holographic overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400/10 via-transparent to-transparent"></div>
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400"></div>
                    </div>
                    
                    {/* Level badge with glow */}
                    <div className="absolute -top-2 -right-2 bg-gradient-to-br from-[#5383E8] to-cyan-400 border-2 border-cyan-400/50 px-2.5 py-1 shadow-[0_0_15px_rgba(0,255,255,0.6)]">
                      <span className="text-xs font-bold font-mono text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{getCurrentAccount()?.summonerLevel || 0}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-white mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      {getCurrentAccount()?.gameName || 'Unknown'}
                      <span className="text-gray-500 font-mono">#{getCurrentAccount()?.tagLine || 'NA'}</span>
                    </h2>
                    <button 
                      onClick={refreshMatches}
                      disabled={refreshing}
                      className="relative group/btn bg-gradient-to-r from-[#5383E8] to-cyan-400 hover:from-cyan-400 hover:to-[#5383E8] text-white text-sm px-4 py-2 font-bold font-mono transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)] hover:shadow-[0_0_25px_rgba(0,255,255,0.5)]"
                      title="Full refresh: Clears cache and reloads all data from Riot API"
                    >
                      {/* Button corner accents */}
                      <div className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2 border-white/50"></div>
                      <div className="absolute -bottom-[1px] -right-[9px] w-3 h-3 border-b-2 border-r-2 border-white/50"></div>
                      
                      {refreshing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>REFRESHING...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          <span>REFRESH</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ranked Solo Stats */}
                <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-4 mb-3 border border-cyan-400/20 overflow-hidden group/rank shadow-[0_0_15px_rgba(83,131,232,0.1)] hover:shadow-[0_0_25px_rgba(83,131,232,0.2)] transition-all">
                  {/* Tech accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#5383E8]/50 to-transparent"></div>
                  
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/30"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/30"></div>
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-sm text-cyan-400 font-bold font-mono tracking-wider uppercase">Ranked Solo</span>
                    <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {(() => {
                    const soloQueue = getCurrentAccount()?.rankedData?.find(r => r.queueType === 'RANKED_SOLO_5x5');
                    return soloQueue ? (
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="relative w-16 h-16 flex items-center justify-center group/emblem">
                          {/* Emblem glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 blur-lg opacity-0 group-hover/emblem:opacity-100 transition-opacity"></div>
                          <Image
                            src={`/Rank=${soloQueue.tier}.png`}
                            alt={soloQueue.tier}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain relative drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                            {soloQueue.tier} {soloQueue.rank}
                          </div>
                          <div className="text-sm text-cyan-400 font-mono font-bold">
                            {soloQueue.leaguePoints} <span className="text-xs text-gray-500">LP</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400 font-mono">
                              {soloQueue.wins}<span className="text-green-400">W</span> {soloQueue.losses}<span className="text-red-400">L</span>
                            </span>
                            <span className="text-xs text-cyan-400/50">•</span>
                            <span className={`text-xs font-bold font-mono ${
                              (soloQueue.wins / (soloQueue.wins + soloQueue.losses) * 100) >= 50
                                ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' 
                                : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'
                            }`}>
                              {Math.round((soloQueue.wins / (soloQueue.wins + soloQueue.losses) * 100))}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 relative z-10">
                        <p className="text-gray-500 text-sm font-mono uppercase tracking-wider">Unranked</p>
                      </div>
                    );
                  })()}
                </div>

                {/* Ranked Flex Stats */}
                <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-4 border border-cyan-400/20 overflow-hidden group/rank shadow-[0_0_15px_rgba(83,131,232,0.1)] hover:shadow-[0_0_25px_rgba(83,131,232,0.2)] transition-all">
                  {/* Tech accent line */}
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>
                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#5383E8]/50 to-transparent"></div>
                  
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-cyan-400/30"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-cyan-400/30"></div>
                  
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <span className="text-sm text-cyan-400 font-bold font-mono tracking-wider uppercase">Ranked Flex</span>
                    <button className="text-gray-500 hover:text-cyan-400 transition-colors">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {(() => {
                    const flexQueue = getCurrentAccount()?.rankedData?.find(r => r.queueType === 'RANKED_FLEX_SR');
                    return flexQueue ? (
                      <div className="flex items-center space-x-3 relative z-10">
                        <div className="relative w-16 h-16 flex items-center justify-center group/emblem">
                          {/* Emblem glow */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 blur-lg opacity-0 group-hover/emblem:opacity-100 transition-opacity"></div>
                          <Image
                            src={`/Rank=${flexQueue.tier}.png`}
                            alt={flexQueue.tier}
                            width={64}
                            height={64}
                            className="w-full h-full object-contain relative drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-bold mb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                            {flexQueue.tier} {flexQueue.rank}
                          </div>
                          <div className="text-sm text-cyan-400 font-mono font-bold">
                            {flexQueue.leaguePoints} <span className="text-xs text-gray-500">LP</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400 font-mono">
                              {flexQueue.wins}<span className="text-green-400">W</span> {flexQueue.losses}<span className="text-red-400">L</span>
                            </span>
                            <span className="text-xs text-cyan-400/50">•</span>
                            <span className={`text-xs font-bold font-mono ${
                              (flexQueue.wins / (flexQueue.wins + flexQueue.losses) * 100) >= 50
                                ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' 
                                : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'
                            }`}>
                              {Math.round((flexQueue.wins / (flexQueue.wins + flexQueue.losses) * 100))}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 relative z-10">
                        <p className="text-gray-500 text-sm font-mono uppercase tracking-wider">Unranked</p>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Recently Played With Card */}
            {getCurrentAccount() && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-5 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] relative overflow-hidden"
              >
                {/* Top tech line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                
                {/* Side accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
                
                {/* Header */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-sm font-bold text-white font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                    Recently Played With
                  </h3>
                  <span className="text-xs text-gray-500 font-mono">Last {matches.length} games</span>
                </div>
                
                {/* Calculate teammate statistics */}
                {(() => {
                  const teammateStats = new Map<string, {
                    puuid: string;
                    gameName: string;
                    tagLine: string;
                    profileIconId: number;
                    gamesPlayed: number;
                    wins: number;
                    losses: number;
                    lastPlayed: number;
                  }>();
                  
                  // Process matches to find teammates
                  const currentAcc = getCurrentAccount();
                  matches.forEach(match => {
                    const playerData = match.info.participants.find(p => p.puuid === currentAcc?.puuid);
                    if (!playerData) return;
                    
                    // Find teammates (same team)
                    match.info.participants
                      .filter(p => p.teamId === playerData.teamId && p.puuid !== currentAcc?.puuid)
                      .forEach(teammate => {
                        const key = teammate.puuid;
                        const existing = teammateStats.get(key);
                        
                        if (existing) {
                          existing.gamesPlayed += 1;
                          if (teammate.win) existing.wins += 1;
                          else existing.losses += 1;
                          existing.lastPlayed = Math.max(existing.lastPlayed, match.info.gameCreation);
                        } else {
                          teammateStats.set(key, {
                            puuid: teammate.puuid,
                            gameName: teammate.riotIdGameName || 'Player',
                            tagLine: teammate.riotIdTagline || '',
                            profileIconId: teammateIcons[teammate.puuid] || 29, // Use fetched icon or default
                            gamesPlayed: 1,
                            wins: teammate.win ? 1 : 0,
                            losses: teammate.win ? 0 : 1,
                            lastPlayed: match.info.gameCreation,
                          });
                        }
                      });
                  });
                  
                  // Sort by games played (descending) then by last played (most recent first)
                  const topTeammates = Array.from(teammateStats.values())
                    .sort((a, b) => {
                      if (b.gamesPlayed !== a.gamesPlayed) {
                        return b.gamesPlayed - a.gamesPlayed;
                      }
                      return b.lastPlayed - a.lastPlayed;
                    })
                    .slice(0, 5);
                  
                  return (
                    <div className="space-y-2 relative z-10">
                      {/* Table Header */}
                      <div className="grid grid-cols-12 gap-2 pb-2 border-b border-cyan-400/20 text-xs font-mono text-gray-500 uppercase tracking-wider">
                        <div className="col-span-5">Summoner</div>
                        <div className="col-span-2 text-center">Played</div>
                        <div className="col-span-3 text-center">W - L</div>
                        <div className="col-span-2 text-right">Win Ratio</div>
                      </div>
                      
                      {/* Teammate List */}
                      {topTeammates.length > 0 ? (
                        topTeammates.map((teammate, index) => {
                          const winRate = (teammate.wins / teammate.gamesPlayed * 100).toFixed(0);
                          
                          return (
                            <button 
                              key={teammate.puuid}
                              onClick={() => navigateToSummoner(teammate.gameName, teammate.tagLine, getCurrentAccount()?.region)}
                              className="grid grid-cols-12 gap-2 items-center py-2 border-b border-cyan-400/10 hover:bg-cyan-400/5 transition-colors group w-full text-left cursor-pointer"
                            >
                              {/* Summoner Info */}
                              <div className="col-span-5 flex items-center space-x-2">
                                <div className="relative w-8 h-8 flex-shrink-0">
                                  <div className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="relative w-full h-full overflow-hidden border border-cyan-400/30 bg-[#0a1628]">
                                    <img
                                      src={getProfileIconUrl(teammate.profileIconId)}
                                      alt="Icon"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium text-white truncate font-mono">
                                    {teammate.gameName}
                                  </div>
                                </div>
                              </div>
                              
                              {/* Games Played */}
                              <div className="col-span-2 text-center">
                                <span className="text-sm font-bold text-cyan-400 font-mono">
                                  {teammate.gamesPlayed}
                                </span>
                              </div>
                              
                              {/* W - L */}
                              <div className="col-span-3 text-center">
                                <span className="text-sm font-mono text-gray-400">
                                  <span className="text-green-400">{teammate.wins}</span>
                                  {' - '}
                                  <span className="text-red-400">{teammate.losses}</span>
                                </span>
                              </div>
                              
                              {/* Win Rate */}
                              <div className="col-span-2 text-right">
                                <span className={`text-sm font-bold font-mono ${
                                  parseFloat(winRate) >= 50
                                    ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]'
                                    : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'
                                }`}>
                                  {winRate}%
                                </span>
                              </div>
                            </button>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-gray-500 text-sm font-mono">
                          No teammates found
                        </div>
                      )}
                    </div>
                  );
                })()}
              </motion.div>
            )}

            {!getCurrentAccount() && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-2 border-yellow-500/40 rounded-none p-4 overflow-hidden shadow-[0_0_20px_rgba(234,179,8,0.2)]"
              >
                {/* Tech corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400/50"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400/50"></div>
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-yellow-400/50"></div>
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-yellow-400/50"></div>
                
                {/* Warning accent line */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"></div>
                
                <div className="flex items-start space-x-3 relative z-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400/20 blur-lg"></div>
                    <AlertCircle className="relative w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                  </div>
                  <div>
                    <p className="text-yellow-200 font-bold text-sm font-mono tracking-wider uppercase drop-shadow-[0_0_5px_rgba(250,204,21,0.3)]">No Account Linked</p>
                    <p className="text-yellow-300/80 text-xs mt-1 font-mono">
                      Link your LoL account to view stats
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Content - Match History */}
          <div className="col-span-9 space-y-4">
            {/* Match History Header with Stats */}
            {getCurrentAccount() && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-5 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] overflow-hidden"
              >
                {/* Tech lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
                
                <div className="relative z-10">
                  {/* Header Row */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      Match History
                    </h3>
                    
                    {/* Recent Performance Summary */}
                    <div className="flex items-center space-x-6">
                    {/* All Loaded Games Stats */}
                    <div className="flex items-center space-x-3">
                      <div className="text-center">
                        <div className="text-sm font-bold text-cyan-400 font-mono drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                          {(() => {
                            const wins = matches.filter(m => {
                              const player = getPlayerData(m);
                              return player?.win;
                            }).length;
                            const losses = matches.length - wins;
                            const winRate = matches.length > 0 ? (wins / matches.length * 100).toFixed(0) : 0;
                            return `${winRate}%`;
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Last {matches.length}</div>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <div className={`relative px-3 py-1.5 border text-sm font-bold font-mono ${
                          (() => {
                            const wins = matches.filter(m => {
                              const player = getPlayerData(m);
                              return player?.win;
                            }).length;
                            return (wins / matches.length * 100) >= 50 
                              ? 'bg-green-500/10 border-green-400/30 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.2)]' 
                              : 'bg-[#5383E8]/10 border-[#5383E8]/30 text-[#5383E8] shadow-[0_0_10px_rgba(83,131,232,0.2)]';
                          })()
                        }`}>
                          {(() => {
                            const wins = matches.filter(m => {
                              const player = getPlayerData(m);
                              return player?.win;
                            }).length;
                            return `${wins}W`;
                          })()}
                        </div>
                        <div className="text-cyan-400/50 font-bold">/</div>
                        <div className="relative px-3 py-1.5 border bg-red-500/10 border-red-400/30 text-sm font-bold font-mono text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                          {(() => {
                            const wins = matches.filter(m => {
                              const player = getPlayerData(m);
                              return player?.win;
                            }).length;
                            return `${matches.length - wins}L`;
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Average KDA */}
                    <div className="text-center relative">
                      {/* Glow background */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-cyan-400/5 blur-xl"></div>
                      
                      <div className="text-sm font-bold text-white font-mono relative drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
                        {(() => {
                          const kdas = matches.map(m => {
                            const player = getPlayerData(m);
                            return player ? parseFloat(getKDA(player)) : 0;
                          });
                          const avgKDA = kdas.reduce((a, b) => a + b, 0) / kdas.length;
                          return avgKDA.toFixed(2);
                        })()} <span className="text-xs text-cyan-400">KDA</span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono relative">
                        {(() => {
                          let totalK = 0, totalD = 0, totalA = 0;
                          matches.forEach(m => {
                            const player = getPlayerData(m);
                            if (player) {
                              totalK += player.kills;
                              totalD += player.deaths;
                              totalA += player.assists;
                            }
                          });
                          const avgK = (totalK / matches.length).toFixed(1);
                          const avgD = (totalD / matches.length).toFixed(1);
                          const avgA = (totalA / matches.length).toFixed(1);
                          return `${avgK} / ${avgD} / ${avgA}`;
                        })()}
                      </div>
                      
                      {/* Corner accents */}
                      <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400/30"></div>
                      <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400/30"></div>
                    </div>
                  </div>
                  </div>
                
                  {/* AI Insights Button - Own Row */}
                  <div className="flex justify-center mt-4 pt-4 border-t border-cyan-400/10">
                    <button
                      onClick={() => {
                        setShowAIInsights(true);
                        if (!aiInsights) fetchAIInsights();
                      }}
                      className="relative group bg-gradient-to-br from-[#0a1628] to-[#1a2f4a] hover:from-[#1a2f4a] hover:to-[#0a1628] border-2 border-cyan-400/30 hover:border-cyan-400/60 px-5 py-2.5 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]"
                    >
                      {/* Corner brackets */}
                      <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all"></div>
                      <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all"></div>
                      <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all"></div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400 group-hover:w-3 group-hover:h-3 transition-all"></div>
                      
                      {/* Scan line */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity"></div>
                      
                      <span className="relative flex items-center space-x-2 text-cyan-400 font-mono font-bold text-sm uppercase tracking-wider drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                        <Sparkles className="w-4 h-4" />
                        <span>Season Rewind</span>
                      </span>
                    </button>
                  </div>
                
                  {/* Player Tags Section */}
                  {playerTags.length > 0 && (
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-cyan-400/10 flex-wrap">
                      {playerTags.map((tag, index) => {
                        // Determine tag style based on content
                        const isPositive = ['Winner', 'KDA King', 'Good Laner', 'Deathless', 'Team Player', '1v1 Master', 'Consistent', 'Vision Expert', 'Good with', 'Pentakiller', 'Damage Dealer'].some(keyword => tag.includes(keyword));
                        const isNegative = ['Bad Laner', 'Needs Practice', 'Risky Player', 'Struggling', 'Lacking Laner', 'Bad Duelist', 'Coinflip'].some(keyword => tag.includes(keyword));
                        const isNeutral = !isPositive && !isNegative;
                        
                        let tagStyles = '';
                        if (isPositive) {
                          tagStyles = 'bg-green-500/10 border-green-400/30 text-green-400 shadow-[0_0_10px_rgba(74,222,128,0.15)]';
                        } else if (isNegative) {
                          tagStyles = 'bg-red-500/10 border-red-400/30 text-red-400 shadow-[0_0_10px_rgba(248,113,113,0.15)]';
                        } else {
                          tagStyles = 'bg-yellow-500/10 border-yellow-400/30 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.15)]';
                        }

                        return (
                          <div
                            key={index}
                            className={`relative px-3 py-1.5 border text-xs font-bold font-mono uppercase tracking-wider ${tagStyles}`}
                          >
                            {tag}
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-current opacity-50"></div>
                            <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-current opacity-50"></div>
                          </div>
                        );
                      })}
                      
                      {/* Refresh tags button */}
                      {tagsLoading ? (
                        <div className="px-3 py-1.5 border border-cyan-400/30 text-xs font-mono text-cyan-400 animate-pulse">
                          Analyzing...
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const account = getCurrentAccount();
                            if (account) refreshPlayerTags(account);
                          }}
                          className="px-3 py-1.5 border border-cyan-400/30 text-xs font-mono text-cyan-400 hover:bg-cyan-400/10 transition-colors"
                          title="Refresh player tags based on all loaded matches"
                        >
                          ↻
                        </button>
                      )}
                    </div>
                  )}
                
                  {/* Top 3 Most Played Champions */}
                  <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-cyan-400/10">
                  {(() => {
                    const championStats = new Map<string, { 
                      count: number; 
                      wins: number; 
                      championName: string;
                      championId: number;
                    }>();
                    
                    // Calculate champion stats from current matches
                    matches.forEach(m => {
                      const player = getPlayerData(m);
                      if (player) {
                        const champName = player.championName;
                        const champId = player.championId;
                        const existing = championStats.get(champName) || { 
                          count: 0, 
                          wins: 0, 
                          championName: champName,
                          championId: champId
                        };
                        existing.count += 1;
                        if (player.win) existing.wins += 1;
                        championStats.set(champName, existing);
                      }
                    });
                    
                    // Get top 3 most played
                    const topChampions = Array.from(championStats.values())
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 3);
                    
                    return topChampions.map((champ, index) => {
                      const winRate = (champ.wins / champ.count * 100).toFixed(0);
                      const losses = champ.count - champ.wins;
                      
                      return (
                        <div key={champ.championName} className="relative group">
                          {/* Glow background */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                          
                          <div className="relative flex items-center space-x-3 px-4 py-2 border border-cyan-400/20 bg-gradient-to-br from-[#0a1628]/80 to-[#0f1f3a]/80 group-hover:border-cyan-400/40 transition-all duration-300">
                            {/* Champion Portrait */}
                            <div className="relative">
                              <div className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <img
                                src={getCDNUrl(`img/champion/${champ.championName}.png`)}
                                alt={champ.championName}
                                className="relative w-12 h-12 rounded-none border-2 border-cyan-400/30 group-hover:border-cyan-400/50 transition-all duration-300 shadow-[0_0_10px_rgba(0,255,255,0.2)]"
                              />
                              {/* Rank badge */}
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-none flex items-center justify-center text-[10px] font-bold text-black shadow-[0_0_8px_rgba(0,255,255,0.6)]">
                                {index + 1}
                              </div>
                            </div>
                            
                            {/* Stats */}
                            <div className="flex flex-col">
                              <div className="flex items-center space-x-2">
                                <span className={`text-lg font-bold font-mono ${
                                  parseFloat(winRate) >= 50
                                    ? 'text-green-400 drop-shadow-[0_0_5px_rgba(74,222,128,0.5)]' 
                                    : 'text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.5)]'
                                }`}>
                                  {winRate}%
                                </span>
                                <span className="text-xs text-gray-500 font-mono uppercase">WR</span>
                              </div>
                              <div className="flex items-center space-x-1.5 mt-0.5">
                                <span className="text-xs text-green-400 font-mono">{champ.wins}W</span>
                                <span className="text-xs text-gray-600">/</span>
                                <span className="text-xs text-red-400 font-mono">{losses}L</span>
                              </div>
                              <div className="text-[10px] text-cyan-400/60 font-mono mt-0.5">
                                {champ.count} {champ.count === 1 ? 'game' : 'games'}
                              </div>
                            </div>
                            
                            {/* Corner accents */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-cyan-400/30"></div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-cyan-400/30"></div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
                </div>
              </motion.div>
            )}

            {/* Filter Section */}
            {getCurrentAccount() && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-4 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] overflow-hidden"
              >
                {/* Tech lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-white font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                      Filter by Game Mode
                    </h4>
                    <span className="text-xs text-gray-500 font-mono">
                      {getFilteredMatches().length} / {matches.length} matches
                    </span>
                  </div>
                  
                  {/* Filter Buttons Grid */}
                  <div className="flex flex-wrap gap-2">
                    {GAME_MODE_CATEGORIES.map((category) => {
                      const isSelected = selectedFilter === category.id;
                      const matchCount = category.id === 'all' 
                        ? matches.length 
                        : matches.filter(m => category.queueIds.includes(m.info.queueId)).length;
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedFilter(category.id)}
                          disabled={matchCount === 0}
                          className={`relative group/filter px-4 py-2 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-300 border disabled:opacity-30 disabled:cursor-not-allowed ${
                            isSelected
                              ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white border-cyan-400/50 shadow-[0_0_20px_rgba(0,255,255,0.4)]'
                              : 'bg-[#0a1628]/50 text-gray-400 border-cyan-400/20 hover:border-cyan-400/40 hover:text-cyan-400 hover:shadow-[0_0_15px_rgba(0,255,255,0.2)]'
                          }`}
                        >
                          {/* Button corner accents */}
                          {isSelected && (
                            <>
                              <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/50"></div>
                              <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/50"></div>
                            </>
                          )}
                          
                          {/* Holographic effect on hover */}
                          {!isSelected && (
                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 opacity-0 group-hover/filter:opacity-100 transition-opacity"></div>
                          )}
                          
                          <span className="relative z-10 flex items-center space-x-2">
                            <span>{category.label}</span>
                            {matchCount > 0 && (
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-none ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-cyan-400/10 text-cyan-400'
                              }`}>
                                {matchCount}
                              </span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Matches List */}
            {getCurrentAccount() && (
              <div className="space-y-2">
                {getFilteredMatches().length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] rounded-none p-8 border-2 border-cyan-400/20 shadow-[0_0_30px_rgba(83,131,232,0.2)] overflow-hidden"
                  >
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-400/40"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/40"></div>
                    
                    <div className="text-center relative z-10">
                      <AlertCircle className="w-12 h-12 text-cyan-400 mx-auto mb-3 drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]" />
                      <p className="text-gray-400 font-mono text-sm uppercase tracking-wider">
                        No matches found for this filter
                      </p>
                      <p className="text-gray-600 font-mono text-xs mt-2">
                        Try selecting a different game mode
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  getFilteredMatches().map((match) => {
                    const playerData = getPlayerData(match);
                    if (!playerData) return null;

                    const isExpanded = expandedMatch === match.metadata.matchId;
                    const playerTeam = match.info.teams.find(t => t.teamId === playerData.teamId);
                    const enemyTeam = match.info.teams.find(t => t.teamId !== playerData.teamId);

                    return (
                    <motion.div
                      key={match.metadata.matchId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-none overflow-hidden transition-all relative group ${
                        playerData.win
                          ? 'bg-gradient-to-r from-[#0a1628] via-[#0f1f3a] to-[#0a1628] shadow-[0_0_20px_rgba(83,131,232,0.15)] hover:shadow-[0_0_30px_rgba(83,131,232,0.3)]'
                          : 'bg-gradient-to-r from-[#1a0a0f] via-[#2d1419] to-[#1a0a0f] shadow-[0_0_20px_rgba(232,64,87,0.15)] hover:shadow-[0_0_30px_rgba(232,64,87,0.3)]'
                      }`}
                    >
                      {/* Futuristic Side Accent */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        playerData.win 
                          ? 'bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]' 
                          : 'bg-gradient-to-b from-transparent via-[#E84057] to-transparent shadow-[0_0_10px_#E84057]'
                      }`}></div>
                      
                      {/* Top Tech Line */}
                      <div className={`absolute top-0 left-0 right-0 h-px ${
                        playerData.win 
                          ? 'bg-gradient-to-r from-transparent via-[#5383E8]/50 to-transparent' 
                          : 'bg-gradient-to-r from-transparent via-[#E84057]/50 to-transparent'
                      }`}></div>
                      {/* Compact Match Card */}
                      <div
                        className="p-4 cursor-pointer hover:bg-white/5 transition-all relative"
                        onClick={() => setExpandedMatch(isExpanded ? null : match.metadata.matchId)}
                      >
                        {/* Scan Line Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <div className="flex items-center justify-between relative z-10">
                          {/* Left Section: Game Info */}
                          <div className="flex flex-col items-start w-24 flex-shrink-0 relative">
                            {/* Holographic Corner */}
                            <div className={`absolute -left-2 -top-2 w-12 h-12 border-l-2 border-t-2 ${
                              playerData.win ? 'border-[#5383E8]/30' : 'border-[#E84057]/30'
                            }`}></div>
                            
                            <span className="text-xs font-bold uppercase text-cyan-400 tracking-wider font-mono">
                              {QUEUE_NAMES[match.info.queueId] || `Queue ${match.info.queueId}`}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              {formatTimestamp(match.info.gameCreation)}
                            </span>
                            <div className={`w-full h-px my-1.5 ${
                              playerData.win 
                                ? 'bg-gradient-to-r from-[#5383E8] to-transparent' 
                                : 'bg-gradient-to-r from-[#E84057] to-transparent'
                            }`}></div>
                            <span className={`text-sm font-bold tracking-widest ${
                              playerData.win 
                                ? 'text-[#5383E8] drop-shadow-[0_0_8px_rgba(83,131,232,0.8)]' 
                                : 'text-[#E84057] drop-shadow-[0_0_8px_rgba(232,64,87,0.8)]'
                            }`}>
                              {playerData.win ? 'VICTORY' : 'DEFEAT'}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                              {formatGameDuration(match.info.gameDuration)}
                            </span>
                          </div>

                          {/* Center Section: Champion, Stats & Items */}
                          <div className="flex items-center space-x-4 flex-1">
                            {/* Champion + Spells/Runes */}
                            <div className="flex items-center space-x-2">
                              <div className="relative group/champ">
                                {/* Hexagonal glow effect */}
                                <div className={`absolute inset-0 ${
                                  playerData.win 
                                    ? 'shadow-[0_0_25px_rgba(83,131,232,0.5)]' 
                                    : 'shadow-[0_0_25px_rgba(232,64,87,0.5)]'
                                } group-hover/champ:shadow-[0_0_35px_rgba(0,255,255,0.6)] transition-all duration-300`}></div>
                                
                                {/* Outer glow border */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-br ${
                                  playerData.win 
                                    ? 'from-[#5383E8] via-cyan-400 to-[#5383E8]' 
                                    : 'from-[#E84057] via-red-400 to-[#E84057]'
                                } opacity-60 blur-sm`}></div>
                                
                                <div className="relative w-14 h-14 overflow-hidden border-2 border-cyan-400/40 bg-gradient-to-br from-[#0a1628] to-[#1a2f4a]">
                                  <Image
                                    src={getChampionImageUrl(playerData.championId)}
                                    alt={playerData.championName}
                                    width={56}
                                    height={56}
                                    className="w-full h-full object-cover"
                                  />
                                  {/* Holographic scanline */}
                                  <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/20 via-transparent to-transparent opacity-0 group-hover/champ:opacity-100 transition-opacity"></div>
                                  {/* Corner brackets */}
                                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400"></div>
                                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400"></div>
                                </div>
                                <div className={`absolute -bottom-0.5 -right-0.5 px-1.5 text-[9px] font-bold font-mono ${
                                  playerData.win 
                                    ? 'bg-gradient-to-br from-[#5383E8] to-cyan-400 text-white shadow-[0_0_10px_#5383E8]' 
                                    : 'bg-gradient-to-br from-[#E84057] to-red-400 text-white shadow-[0_0_10px_#E84057]'
                                } border border-cyan-400/50`}>
                                  {playerData.champLevel}
                                </div>
                              </div>
                              
                              <div className="flex space-x-0.5">
                                <div className="flex flex-col space-y-0.5">
                                  <div className="relative group/spell w-5 h-5 overflow-hidden bg-[#0a1628] border border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#5383E8]/20 to-cyan-400/20 opacity-0 group-hover/spell:opacity-100 transition-opacity blur-sm"></div>
                                    <Image
                                      src={getSummonerSpellImageUrl(playerData.summoner1Id)}
                                      alt="Spell 1"
                                      width={20}
                                      height={20}
                                      className="relative w-full h-full object-cover"
                                      unoptimized
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect fill="%230a1628" width="20" height="20"/%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                  <div className="relative group/spell w-5 h-5 overflow-hidden bg-[#0a1628] border border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
                                    <div className="absolute -inset-0.5 bg-gradient-to-br from-[#5383E8]/20 to-cyan-400/20 opacity-0 group-hover/spell:opacity-100 transition-opacity blur-sm"></div>
                                    <Image
                                      src={getSummonerSpellImageUrl(playerData.summoner2Id)}
                                      alt="Spell 2"
                                      width={20}
                                      height={20}
                                      className="relative w-full h-full object-cover"
                                      unoptimized
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="20" height="20"%3E%3Crect fill="%230a1628" width="20" height="20"/%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex flex-col space-y-0.5">
                                  {getKeystoneRuneImageUrl(getKeystoneRuneId(playerData.perks)) && (
                                    <div className="relative group/rune w-5 h-5 rounded-full overflow-hidden bg-[#0a1628] border border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
                                      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#5383E8]/20 to-cyan-400/20 opacity-0 group-hover/rune:opacity-100 transition-opacity blur-sm"></div>
                                      <Image
                                        src={getKeystoneRuneImageUrl(getKeystoneRuneId(playerData.perks))}
                                        alt="Rune"
                                        width={20}
                                        height={20}
                                        className="relative w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  {getSecondaryTreeImageUrl(getSecondaryTreeId(playerData.perks)) && (
                                    <div className="relative group/rune w-5 h-5 rounded-full overflow-hidden bg-[#0a1628] border border-cyan-400/20 hover:border-cyan-400/50 transition-colors">
                                      <div className="absolute -inset-0.5 bg-gradient-to-br from-[#5383E8]/20 to-cyan-400/20 opacity-0 group-hover/rune:opacity-100 transition-opacity blur-sm"></div>
                                      <Image
                                        src={getSecondaryTreeImageUrl(getSecondaryTreeId(playerData.perks))}
                                        alt="Tree"
                                        width={20}
                                        height={20}
                                        className="relative w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* KDA & Stats */}
                            <div className="flex items-center space-x-6">
                              <div className="text-center relative">
                                {/* Holographic background glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 via-transparent to-cyan-400/5 blur-xl"></div>
                                
                                <div className="mb-0.5 relative font-mono">
                                  <span className="text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{playerData.kills}</span>
                                  <span className="text-gray-500 mx-0.5">/</span>
                                  <span className="text-red-400 font-bold drop-shadow-[0_0_5px_rgba(232,64,87,0.5)]">{playerData.deaths}</span>
                                  <span className="text-gray-500 mx-0.5">/</span>
                                  <span className="text-white font-bold drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">{playerData.assists}</span>
                                </div>
                                <div className={`text-sm font-bold font-mono tracking-wider relative ${
                                  parseFloat(getKDA(playerData)) >= 5 ? 'text-[#ECBC2C] drop-shadow-[0_0_10px_rgba(236,188,44,0.8)]' :
                                  parseFloat(getKDA(playerData)) >= 3 ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]' : 'text-gray-400'
                                }`}>
                                  {getKDA(playerData)} <span className="text-xs text-gray-500">KDA</span>
                                </div>
                                {/* Corner accents */}
                                <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-400/30"></div>
                                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b border-r border-cyan-400/30"></div>
                              </div>

                              <div className="text-xs text-gray-400 space-y-0.5 font-mono">
                                <div className="flex items-center gap-1">
                                  <span className="text-cyan-400/60">▸</span>
                                  <span className="text-white">{getCS(playerData)}</span> CS
                                  <span className="text-gray-600">({getCSPerMin(playerData, match.info.gameDuration)})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className="text-cyan-400/60">▸</span>
                                  <span className="text-white">{playerData.visionScore}</span> vision
                                </div>
                              </div>
                            </div>

                            {/* Items */}
                            <div className="flex items-center space-x-0.5">
                              {[0, 1, 2, 3, 4, 5].map((index) => {
                                const itemId = (playerData as any)[`item${index}`];
                                return (
                                  <div 
                                    key={index} 
                                    className={`relative group/item w-6 h-6 ${
                                      itemId > 0 ? 'bg-[#0a1628]' : 'bg-[#0a1628]/30'
                                    } border ${
                                      itemId > 0 ? 'border-cyan-400/30 hover:border-cyan-400/60' : 'border-gray-700/20'
                                    } flex items-center justify-center overflow-hidden transition-all`}
                                  >
                                    {/* Glow effect on hover */}
                                    {itemId > 0 && (
                                      <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 opacity-0 group-hover/item:opacity-100 transition-opacity blur-sm"></div>
                                    )}
                                    {/* Corner tech accents */}
                                    {itemId > 0 && (
                                      <>
                                        <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-cyan-400/50 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                        <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-cyan-400/50 opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                      </>
                                    )}
                                    {itemId > 0 && (
                                      <Image
                                        src={getItemImageUrl(itemId)}
                                        alt={`Item ${index}`}
                                        width={24}
                                        height={24}
                                        className="relative w-full h-full object-cover"
                                      />
                                    )}
                                    {/* Empty slot pattern */}
                                    {itemId === 0 && (
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-gray-900/10"></div>
                                    )}
                                  </div>
                                );
                              })}
                              {(() => {
                                const itemId = (playerData as any)[`item6`];
                                return (
                                  <div 
                                    className={`relative group/item w-6 h-6 rounded-full ${
                                      itemId > 0 ? 'bg-[#0a1628]' : 'bg-[#0a1628]/30'
                                    } border ${
                                      itemId > 0 ? 'border-cyan-400/30 hover:border-cyan-400/60' : 'border-gray-700/20'
                                    } flex items-center justify-center overflow-hidden transition-all`}
                                  >
                                    {/* Glow effect on hover */}
                                    {itemId > 0 && (
                                      <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400/30 to-[#5383E8]/30 opacity-0 group-hover/item:opacity-100 transition-opacity blur-md rounded-full"></div>
                                    )}
                                    {itemId > 0 && (
                                      <Image
                                        src={getItemImageUrl(itemId)}
                                        alt="Trinket"
                                        width={24}
                                        height={24}
                                        className="relative w-full h-full object-cover"
                                      />
                                    )}
                                    {/* Empty slot pattern */}
                                    {itemId === 0 && (
                                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800/10 to-gray-900/10 rounded-full"></div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Right Section: All Players */}
                          <div className="flex items-center space-x-4 ml-6">
                            {/* Blue Team */}
                            <div className="flex items-center space-x-1 relative">
                              {/* Team label */}
                              <div className="absolute -top-4 left-0 text-[9px] font-mono text-[#5383E8]/60 tracking-wider">BLUE</div>
                              {match.info.participants
                                .filter(p => p.teamId === 100)
                                .sort((a, b) => {
                                  const orderMap: any = { TOP: 1, JUNGLE: 2, MIDDLE: 3, BOTTOM: 4, UTILITY: 5 };
                                  const posA = getPlayerPosition(a);
                                  const posB = getPlayerPosition(b);
                                  return (orderMap[posA] || 6) - (orderMap[posB] || 6);
                                })
                                .map((participant, idx) => {
                                  const isCurrentPlayer = participant.puuid === playerData.puuid;
                                  const playerPos = getPlayerPosition(participant);
                                  const roleIconUrl = getRoleIconUrl(playerPos);
                                  return (
                                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                                      <div 
                                        className={`relative group/champion w-5 h-5 overflow-hidden transition-all ${
                                          isCurrentPlayer 
                                            ? 'ring-1 ring-[#5383E8] border-2 border-[#5383E8] shadow-[0_0_10px_rgba(83,131,232,0.6)]' 
                                            : 'border border-cyan-400/20 hover:border-cyan-400/50'
                                        }`}
                                      >
                                        {/* Glow effect */}
                                        {isCurrentPlayer && (
                                          <div className="absolute -inset-1 bg-[#5383E8]/30 blur-md"></div>
                                        )}
                                        <Image
                                          src={getChampionImageUrl(participant.championId)}
                                          alt={participant.championName}
                                          width={20}
                                          height={20}
                                          className="relative w-full h-full object-cover"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#5383E8]/20 to-transparent opacity-0 group-hover/champion:opacity-100 transition-opacity"></div>
                                      </div>
                                      {/* Role Icon */}
                                      {hasPositions(match.info.queueId) && playerPos && roleIconUrl && (
                                        <div className="w-3 h-3 relative flex-shrink-0">
                                          <Image
                                            src={roleIconUrl}
                                            alt={playerPos}
                                            width={12}
                                            height={12}
                                            className="w-full h-full object-contain opacity-50"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Team Divider */}
                            <div className="h-6 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent"></div>

                            {/* Red Team */}
                            <div className="flex items-center space-x-1 relative">
                              {/* Team label */}
                              <div className="absolute -top-4 left-0 text-[9px] font-mono text-[#E84057]/60 tracking-wider">RED</div>
                              {match.info.participants
                                .filter(p => p.teamId === 200)
                                .sort((a, b) => {
                                  const orderMap: any = { TOP: 1, JUNGLE: 2, MIDDLE: 3, BOTTOM: 4, UTILITY: 5 };
                                  const posA = getPlayerPosition(a);
                                  const posB = getPlayerPosition(b);
                                  return (orderMap[posA] || 6) - (orderMap[posB] || 6);
                                })
                                .map((participant, idx) => {
                                  const isCurrentPlayer = participant.puuid === playerData.puuid;
                                  const playerPos = getPlayerPosition(participant);
                                  const roleIconUrl = getRoleIconUrl(playerPos);
                                  return (
                                    <div key={idx} className="flex flex-col items-center space-y-0.5">
                                      <div 
                                        className={`relative group/champion w-5 h-5 overflow-hidden transition-all ${
                                          isCurrentPlayer 
                                            ? 'ring-1 ring-[#E84057] border-2 border-[#E84057] shadow-[0_0_10px_rgba(232,64,87,0.6)]' 
                                            : 'border border-red-400/20 hover:border-red-400/50'
                                        }`}
                                      >
                                        {/* Glow effect */}
                                        {isCurrentPlayer && (
                                          <div className="absolute -inset-1 bg-[#E84057]/30 blur-md"></div>
                                        )}
                                        <Image
                                          src={getChampionImageUrl(participant.championId)}
                                          alt={participant.championName}
                                          width={20}
                                          height={20}
                                          className="relative w-full h-full object-cover"
                                        />
                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#E84057]/20 to-transparent opacity-0 group-hover/champion:opacity-100 transition-opacity"></div>
                                      </div>
                                      {/* Role Icon */}
                                      {hasPositions(match.info.queueId) && playerPos && roleIconUrl && (
                                        <div className="w-3 h-3 relative flex-shrink-0">
                                          <Image
                                            src={roleIconUrl}
                                            alt={playerPos}
                                            width={12}
                                            height={12}
                                            className="w-full h-full object-contain opacity-50"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>

                            {/* Expand Button */}
                            <button className="relative group/expand ml-2 p-1.5 border border-cyan-400/20 hover:border-cyan-400/50 transition-all bg-[#0a1628] hover:bg-[#0a1628]/80">
                              {/* Button glow on hover */}
                              <div className="absolute -inset-0.5 bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 opacity-0 group-hover/expand:opacity-100 transition-opacity blur-sm"></div>
                              <div className="relative">
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4 text-cyan-400" />
                                ) : (
                                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover/expand:text-cyan-400 transition-colors" />
                                )}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-cyan-400/20 bg-gradient-to-br from-[#0a1628]/95 to-[#0f1f3a]/95 relative overflow-hidden"
                          >
                            {/* Tech accent line */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                            
                            <div className="p-6 relative z-10">
                              {/* Tabs */}
                              <div className="flex items-center space-x-2 mb-6 bg-[#0a1628]/50 rounded-none p-1 border border-cyan-400/20 relative overflow-hidden">
                                {/* Background glow */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent"></div>
                                
                                <button 
                                  onClick={() => setActiveTab({ ...activeTab, [match.metadata.matchId]: 'post-game' })}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    (!activeTab[match.metadata.matchId] || activeTab[match.metadata.matchId] === 'post-game')
                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                      : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'
                                  }`}
                                >
                                  {(!activeTab[match.metadata.matchId] || activeTab[match.metadata.matchId] === 'post-game') && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10">Post Game</span>
                                </button>
                                <button 
                                  onClick={() => setActiveTab({ ...activeTab, [match.metadata.matchId]: 'performance' })}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    activeTab[match.metadata.matchId] === 'performance'
                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                      : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'
                                  }`}
                                >
                                  {activeTab[match.metadata.matchId] === 'performance' && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10">Performance</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab({ ...activeTab, [match.metadata.matchId]: 'item-build' });
                                    fetchTimeline(match.metadata.matchId, getCurrentAccount()?.region);
                                  }}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    activeTab[match.metadata.matchId] === 'item-build'
                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                      : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'
                                  }`}
                                >
                                  {activeTab[match.metadata.matchId] === 'item-build' && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10">Item Build</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab({ ...activeTab, [match.metadata.matchId]: 'timeline' });
                                    fetchTimeline(match.metadata.matchId, getCurrentAccount()?.region);
                                  }}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    activeTab[match.metadata.matchId] === 'timeline'
                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                      : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'
                                  }`}
                                >
                                  {activeTab[match.metadata.matchId] === 'timeline' && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10">Timeline</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab({ ...activeTab, [match.metadata.matchId]: 'metrics' });
                                    fetchTimeline(match.metadata.matchId, getCurrentAccount()?.region);
                                  }}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    activeTab[match.metadata.matchId] === 'metrics'
                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_15px_rgba(0,255,255,0.4)]'
                                      : 'text-gray-500 hover:text-cyan-400 hover:bg-cyan-400/5'
                                  }`}
                                >
                                  {activeTab[match.metadata.matchId] === 'metrics' && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10">Metrics</span>
                                </button>
                                <button 
                                  onClick={() => {
                                    setActiveTab({ ...activeTab, [match.metadata.matchId]: 'ai-coaching' });
                                    fetchAICoaching(match.metadata.matchId, match);
                                  }}
                                  className={`relative flex-1 px-4 py-2.5 text-sm font-bold font-mono tracking-wider uppercase transition-all group ${
                                    activeTab[match.metadata.matchId] === 'ai-coaching'
                                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                                      : 'text-gray-500 hover:text-purple-400 hover:bg-purple-400/5'
                                  }`}
                                >
                                  {activeTab[match.metadata.matchId] === 'ai-coaching' && (
                                    <>
                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/50"></div>
                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/50"></div>
                                    </>
                                  )}
                                  <span className="relative z-10 flex items-center space-x-1">
                                    <Sparkles className="w-4 h-4" />
                                    <span>AI Coach</span>
                                  </span>
                                </button>
                              </div>

                              {/* Post Game Tab Content */}
                              {(!activeTab[match.metadata.matchId] || activeTab[match.metadata.matchId] === 'post-game') && (
                              <div className="space-y-4">
                                {/* Blue Team (Victory/Defeat) */}
                                <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-5 border border-cyan-400/20 overflow-hidden shadow-[0_0_20px_rgba(83,131,232,0.15)]">
                                  {/* Tech lines */}
                                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#5383E8]/50 to-transparent"></div>
                                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#5383E8]/50 to-transparent"></div>
                                  
                                  {/* Corner brackets */}
                                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#5383E8]/40"></div>
                                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#5383E8]/40"></div>
                                  
                                  <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center space-x-3">
                                      <span className={`font-bold text-base font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(83,131,232,0.6)] ${
                                        playerTeam?.teamId === 100 && playerData.win ? 'text-[#5383E8]' :
                                        playerTeam?.teamId === 100 && !playerData.win ? 'text-[#E84057]' :
                                        playerTeam?.teamId === 200 && playerData.win ? 'text-[#E84057]' : 'text-[#5383E8]'
                                      }`}>
                                        {playerTeam?.teamId === 100 ? 
                                          (playerData.win ? 'VICTORY' : 'DEFEAT') : 
                                          (playerData.win ? 'DEFEAT' : 'VICTORY')
                                        }
                                      </span>
                                      <span className="text-gray-500 text-xs font-mono uppercase tracking-wider">(Blue Team)</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 font-bold font-mono uppercase tracking-wider">
                                      <div className="flex-1 min-w-0"></div> {/* Spacer for champion/name section */}
                                      <div className="flex items-center space-x-4">
                                        <span className="w-12 text-center flex-shrink-0">Carry</span>
                                        <span className="w-20 text-center flex-shrink-0">KDA</span>
                                        <span className="w-20 text-center flex-shrink-0">Damage</span>
                                        <span className="w-16 text-center flex-shrink-0">Gold</span>
                                        <span className="w-12 text-center flex-shrink-0">CS</span>
                                        <span className="w-16 text-center flex-shrink-0">Wards</span>
                                        <span className="ml-4 flex-shrink-0" style={{ width: '192px' }}>Items</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1.5 relative z-10">
                                    {match.info.participants
                                      .filter(p => p.teamId === 100)
                                      .sort((a, b) => {
                                        const orderMap: any = { TOP: 1, JUNGLE: 2, MIDDLE: 3, BOTTOM: 4, UTILITY: 5 };
                                        const posA = getPlayerPosition(a);
                                        const posB = getPlayerPosition(b);
                                        return (orderMap[posA] || 6) - (orderMap[posB] || 6);
                                      })
                                      .map((participant, idx) => {
                                        const isPlayer = participant.puuid === playerData.puuid;
                                        const participantKDA = parseFloat(getKDA(participant));
                                        
                                        return (
                                          <div
                                            key={idx}
                                            className={`relative flex items-center justify-between p-3 rounded-none transition-all overflow-hidden group/player ${
                                              isPlayer 
                                                ? 'bg-[#5383E8]/15 border-l-2 border-[#5383E8] shadow-[0_0_15px_rgba(83,131,232,0.3)]' 
                                                : 'hover:bg-cyan-400/5 border-l-2 border-transparent hover:border-cyan-400/30'
                                            }`}
                                          >
                                            {/* Scan line effect on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                                            
                                            {/* Champion Info */}
                                            <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
                                              <div className="relative flex-shrink-0 group/champ">
                                                {/* Champion glow */}
                                                {isPlayer && (
                                                  <div className="absolute inset-0 bg-[#5383E8]/30 blur-md"></div>
                                                )}
                                                <div className={`relative w-10 h-10 overflow-hidden border ${
                                                  isPlayer ? 'border-[#5383E8]/50' : 'border-cyan-400/20'
                                                }`}>
                                                  <Image
                                                    src={getChampionImageUrl(participant.championId)}
                                                    alt={participant.championName}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                  />
                                                  {/* Corner brackets */}
                                                  {isPlayer && (
                                                    <>
                                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#5383E8]"></div>
                                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#5383E8]"></div>
                                                    </>
                                                  )}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 px-1 text-[9px] font-bold font-mono border ${
                                                  isPlayer 
                                                    ? 'bg-gradient-to-br from-[#5383E8] to-cyan-400 text-white border-cyan-400/50 shadow-[0_0_8px_rgba(0,255,255,0.5)]' 
                                                    : 'bg-[#0a1628] text-white border-gray-700'
                                                }`}>
                                                  {participant.champLevel}
                                                </div>
                                              </div>
                                              
                                              {/* Spells & Runes */}
                                              <div className="flex flex-col space-y-0.5 flex-shrink-0">
                                                <div className="flex space-x-0.5">
                                                  <div className="w-4 h-4 overflow-hidden bg-[#0a1628] border border-cyan-400/20">
                                                    <Image
                                                      src={getSummonerSpellImageUrl(participant.summoner1Id)}
                                                      alt="Spell"
                                                      width={16}
                                                      height={16}
                                                    />
                                                  </div>
                                                  <div className="w-4 h-4 overflow-hidden bg-[#0a1628] border border-cyan-400/20">
                                                    <Image
                                                      src={getSummonerSpellImageUrl(participant.summoner2Id)}
                                                      alt="Spell"
                                                      width={16}
                                                      height={16}
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex space-x-0.5">
                                                  {getKeystoneRuneImageUrl(getKeystoneRuneId(participant.perks)) && (
                                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-[#0a1628] border border-cyan-400/20">
                                                      <Image
                                                        src={getKeystoneRuneImageUrl(getKeystoneRuneId(participant.perks))}
                                                        alt="Rune"
                                                        width={16}
                                                        height={16}
                                                      />
                                                    </div>
                                                  )}
                                                  {getSecondaryTreeImageUrl(getSecondaryTreeId(participant.perks)) && (
                                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-[#0a1628] border border-cyan-400/20">
                                                      <Image
                                                        src={getSecondaryTreeImageUrl(getSecondaryTreeId(participant.perks))}
                                                        alt="Tree"
                                                        width={16}
                                                        height={16}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Player Name & Position */}
                                              <div className="flex-1 min-w-0">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigateToSummoner(
                                                      participant.riotIdGameName,
                                                      participant.riotIdTagline,
                                                      getCurrentAccount()?.region
                                                    );
                                                  }}
                                                  className={`text-xs font-medium truncate text-left hover:underline transition-all ${
                                                    isPlayer ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.5)] hover:text-cyan-300' : 'text-white hover:text-cyan-400'
                                                  }`}
                                                  title={`View ${participant.riotIdGameName}#${participant.riotIdTagline}'s profile`}
                                                >
                                                  {participant.riotIdGameName}
                                                </button>
                                                <div className="flex items-center space-x-1.5">
                                                  {hasPositions(match.info.queueId) && getPlayerPosition(participant) && getRoleIconUrl(getPlayerPosition(participant)) && (
                                                    <div className="w-3 h-3 relative flex-shrink-0">
                                                      <Image
                                                        src={getRoleIconUrl(getPlayerPosition(participant))}
                                                        alt={getPlayerPosition(participant)}
                                                        width={12}
                                                        height={12}
                                                        className="w-full h-full object-contain opacity-60"
                                                      />
                                                    </div>
                                                  )}
                                                  {isPlayer && (
                                                    <span className="text-[10px] text-[#5383E8] font-bold font-mono uppercase tracking-wider drop-shadow-[0_0_5px_rgba(83,131,232,0.6)]">You</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center space-x-4 text-xs relative z-10">
                                              {/* Carry Score */}
                                              <div className="w-12 text-center flex-shrink-0">
                                                <div className={`font-bold font-mono drop-shadow-[0_0_5px_rgba(236,188,44,0.3)] ${
                                                  participantKDA >= 5 ? 'text-[#ECBC2C]' :
                                                  participantKDA >= 3 ? 'text-cyan-400' : 'text-gray-400'
                                                }`}>
                                                  {(() => {
                                                    const score = (participant.kills * 2 + participant.assists) / Math.max(participant.deaths, 1);
                                                    return Math.round(score * 10);
                                                  })()}
                                                </div>
                                              </div>

                                              {/* KDA */}
                                              <div className="w-20 flex-shrink-0">
                                                <div className="text-center">
                                                  <div className="text-white text-[10px] font-medium font-mono whitespace-nowrap leading-tight">
                                                    {participant.kills}<span className="text-gray-600 mx-0.5">/</span><span className="text-[#E84057] font-bold">{participant.deaths}</span><span className="text-gray-600 mx-0.5">/</span>{participant.assists}
                                                  </div>
                                                  <div className={`text-[9px] font-bold font-mono mt-0.5 ${
                                                    participantKDA >= 5 ? 'text-[#ECBC2C] drop-shadow-[0_0_5px_rgba(236,188,44,0.5)]' :
                                                    participantKDA >= 3 ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-gray-400'
                                                  }`}>
                                                    {getKDA(participant)}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Damage */}
                                              <div className="w-20 flex-shrink-0">
                                                <div className="text-white text-center font-mono font-bold">{(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k</div>
                                                <div className="w-full bg-[#0a1628] h-1.5 rounded-none mt-1 border border-cyan-400/20 overflow-hidden">
                                                  <div 
                                                    className="bg-gradient-to-r from-[#5383E8] to-cyan-400 h-full shadow-[0_0_8px_rgba(0,255,255,0.6)]"
                                                    style={{ 
                                                      width: `${Math.min(100, (participant.totalDamageDealtToChampions / Math.max(...match.info.participants.filter(p => p.teamId === 100).map(p => p.totalDamageDealtToChampions))) * 100)}%` 
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>

                                              {/* Gold */}
                                              <div className="w-16 text-center flex-shrink-0">
                                                <div className="text-[#ECBC2C] font-bold font-mono drop-shadow-[0_0_5px_rgba(236,188,44,0.5)]">{(participant.goldEarned / 1000).toFixed(1)}k</div>
                                              </div>

                                              {/* CS */}
                                              <div className="w-12 text-center flex-shrink-0">
                                                <div className="text-white font-mono font-bold">{getCS(participant)}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">
                                                  ({getCSPerMin(participant, match.info.gameDuration)})
                                                </div>
                                              </div>

                                              {/* Wards */}
                                              <div className="w-16 text-center flex-shrink-0">
                                                <div className="text-white font-mono font-bold">{participant.visionScore}</div>
                                              </div>

                                              {/* Items */}
                                              <div className="flex space-x-1 flex-shrink-0 ml-4">
                                                {[0, 1, 2, 3, 4, 5, 6].map((itemIdx) => {
                                                  const itemId = (participant as any)[`item${itemIdx}`];
                                                  return (
                                                    <div 
                                                      key={itemIdx} 
                                                      className={`relative group/item w-6 h-6 ${itemIdx === 6 ? 'rounded-full' : 'rounded-none'} ${
                                                        itemId > 0 ? 'bg-[#0a1628]' : 'bg-[#0a1628]/30'
                                                      } border ${
                                                        itemId > 0 ? 'border-cyan-400/30 hover:border-cyan-400/60' : 'border-gray-700/20'
                                                      } overflow-hidden flex items-center justify-center transition-all`}
                                                    >
                                                      {/* Item glow on hover */}
                                                      {itemId > 0 && (
                                                        <div className={`absolute ${itemIdx === 6 ? '-inset-1 rounded-full' : '-inset-0.5'} bg-gradient-to-br from-cyan-400/20 to-[#5383E8]/20 opacity-0 group-hover/item:opacity-100 transition-opacity blur-sm`}></div>
                                                      )}
                                                      {itemId > 0 && (
                                                        <Image
                                                          src={getItemImageUrl(itemId)}
                                                          alt="Item"
                                                          width={24}
                                                          height={24}
                                                          className="w-full h-full object-cover"
                                                        />
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>

                                {/* Red Team */}
                                <div className="relative bg-gradient-to-br from-[#1a0a0f]/80 to-[#2d1419]/80 rounded-none p-5 border border-red-400/20 overflow-hidden shadow-[0_0_20px_rgba(232,64,87,0.15)]">
                                  {/* Tech lines */}
                                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#E84057]/50 to-transparent"></div>
                                  <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#E84057]/50 to-transparent"></div>
                                  
                                  {/* Corner brackets */}
                                  <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#E84057]/40"></div>
                                  <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#E84057]/40"></div>
                                  
                                  <div className="flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex items-center space-x-3">
                                      <span className={`font-bold text-base font-mono tracking-wider uppercase drop-shadow-[0_0_10px_rgba(232,64,87,0.6)] ${
                                        playerTeam?.teamId === 200 && playerData.win ? 'text-[#5383E8]' :
                                        playerTeam?.teamId === 200 && !playerData.win ? 'text-[#E84057]' :
                                        playerTeam?.teamId === 100 && playerData.win ? 'text-[#E84057]' : 'text-[#5383E8]'
                                      }`}>
                                        {playerTeam?.teamId === 200 ? 
                                          (playerData.win ? 'VICTORY' : 'DEFEAT') : 
                                          (playerData.win ? 'DEFEAT' : 'VICTORY')
                                        }
                                      </span>
                                      <span className="text-gray-500 text-xs font-mono uppercase tracking-wider">(Red Team)</span>
                                    </div>
                                    <div className="flex items-center text-xs font-mono tracking-wider uppercase">
                                      <div className="flex-1 min-w-0"></div> {/* Spacer for champion/name section */}
                                      <div className="flex items-center space-x-4">
                                        <span className="w-12 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">Carry</span>
                                        <span className="w-20 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">KDA</span>
                                        <span className="w-20 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">Damage</span>
                                        <span className="w-16 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">Gold</span>
                                        <span className="w-12 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">CS</span>
                                        <span className="w-16 text-center flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]">Wards</span>
                                        <span className="ml-4 flex-shrink-0 text-red-400/60 drop-shadow-[0_0_5px_rgba(232,64,87,0.3)]" style={{ width: '192px' }}>Items</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    {match.info.participants
                                      .filter(p => p.teamId === 200)
                                      .sort((a, b) => {
                                        const orderMap: any = { TOP: 1, JUNGLE: 2, MIDDLE: 3, BOTTOM: 4, UTILITY: 5 };
                                        const posA = getPlayerPosition(a);
                                        const posB = getPlayerPosition(b);
                                        return (orderMap[posA] || 6) - (orderMap[posB] || 6);
                                      })
                                      .map((participant, idx) => {
                                        const isPlayer = participant.puuid === playerData.puuid;
                                        const participantKDA = parseFloat(getKDA(participant));
                                        
                                        return (
                                          <div
                                            key={idx}
                                            className={`relative flex items-center justify-between p-3 rounded-none transition-all overflow-hidden group/player ${
                                              isPlayer 
                                                ? 'bg-[#E84057]/15 border-l-2 border-[#E84057] shadow-[0_0_15px_rgba(232,64,87,0.3)]' 
                                                : 'hover:bg-red-400/5 border-l-2 border-transparent hover:border-red-400/30'
                                            }`}
                                          >
                                            {/* Scan line effect on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400/5 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                                            
                                            {/* Champion Info */}
                                            <div className="flex items-center space-x-3 flex-1 min-w-0 relative z-10">
                                              <div className="relative flex-shrink-0 group/champ">
                                                {/* Champion glow */}
                                                {isPlayer && (
                                                  <div className="absolute inset-0 bg-[#E84057]/30 blur-md"></div>
                                                )}
                                                <div className={`relative w-10 h-10 overflow-hidden border ${
                                                  isPlayer ? 'border-[#E84057]/50' : 'border-red-400/20'
                                                }`}>
                                                  <Image
                                                    src={getChampionImageUrl(participant.championId)}
                                                    alt={participant.championName}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                  />
                                                  {/* Corner brackets */}
                                                  {isPlayer && (
                                                    <>
                                                      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#E84057]"></div>
                                                      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#E84057]"></div>
                                                    </>
                                                  )}
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 px-1 text-[9px] font-bold font-mono border ${
                                                  isPlayer 
                                                    ? 'bg-gradient-to-br from-[#E84057] to-red-400 text-white border-red-400/50 shadow-[0_0_8px_rgba(232,64,87,0.5)]' 
                                                    : 'bg-[#0a1628] text-white border-gray-700'
                                                }`}>
                                                  {participant.champLevel}
                                                </div>
                                              </div>
                                              
                                              {/* Spells & Runes */}
                                              <div className="flex flex-col space-y-0.5 flex-shrink-0">
                                                <div className="flex space-x-0.5">
                                                  <div className="w-4 h-4 overflow-hidden bg-[#0a1628] border border-red-400/20">
                                                    <Image
                                                      src={getSummonerSpellImageUrl(participant.summoner1Id)}
                                                      alt="Spell"
                                                      width={16}
                                                      height={16}
                                                    />
                                                  </div>
                                                  <div className="w-4 h-4 overflow-hidden bg-[#0a1628] border border-red-400/20">
                                                    <Image
                                                      src={getSummonerSpellImageUrl(participant.summoner2Id)}
                                                      alt="Spell"
                                                      width={16}
                                                      height={16}
                                                    />
                                                  </div>
                                                </div>
                                                <div className="flex space-x-0.5">
                                                  {getKeystoneRuneImageUrl(getKeystoneRuneId(participant.perks)) && (
                                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-[#0a1628] border border-red-400/20">
                                                      <Image
                                                        src={getKeystoneRuneImageUrl(getKeystoneRuneId(participant.perks))}
                                                        alt="Rune"
                                                        width={16}
                                                        height={16}
                                                      />
                                                    </div>
                                                  )}
                                                  {getSecondaryTreeImageUrl(getSecondaryTreeId(participant.perks)) && (
                                                    <div className="w-4 h-4 rounded-full overflow-hidden bg-[#0a1628] border border-red-400/20">
                                                      <Image
                                                        src={getSecondaryTreeImageUrl(getSecondaryTreeId(participant.perks))}
                                                        alt="Tree"
                                                        width={16}
                                                        height={16}
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Player Name & Position */}
                                              <div className="flex-1 min-w-0">
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigateToSummoner(
                                                      participant.riotIdGameName,
                                                      participant.riotIdTagline,
                                                      getCurrentAccount()?.region
                                                    );
                                                  }}
                                                  className={`text-xs font-medium truncate text-left hover:underline transition-all ${
                                                    isPlayer ? 'text-red-400 font-bold drop-shadow-[0_0_5px_rgba(232,64,87,0.5)] hover:text-red-300' : 'text-white hover:text-cyan-400'
                                                  }`}
                                                  title={`View ${participant.riotIdGameName}#${participant.riotIdTagline}'s profile`}
                                                >
                                                  {participant.riotIdGameName}
                                                </button>
                                                <div className="flex items-center space-x-1.5">
                                                  {hasPositions(match.info.queueId) && getPlayerPosition(participant) && getRoleIconUrl(getPlayerPosition(participant)) && (
                                                    <div className="w-3 h-3 relative flex-shrink-0">
                                                      <Image
                                                        src={getRoleIconUrl(getPlayerPosition(participant))}
                                                        alt={getPlayerPosition(participant)}
                                                        width={12}
                                                        height={12}
                                                        className="w-full h-full object-contain opacity-60"
                                                      />
                                                    </div>
                                                  )}
                                                  {isPlayer && (
                                                    <span className="text-[10px] text-[#E84057] font-bold font-mono uppercase tracking-wider drop-shadow-[0_0_5px_rgba(232,64,87,0.6)]">You</span>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Stats Row */}
                                            <div className="flex items-center space-x-4 text-xs relative z-10">
                                              {/* Carry Score */}
                                              <div className="w-12 text-center flex-shrink-0">
                                                <div className={`font-bold font-mono drop-shadow-[0_0_5px_rgba(236,188,44,0.3)] ${
                                                  participantKDA >= 5 ? 'text-[#ECBC2C]' :
                                                  participantKDA >= 3 ? 'text-cyan-400' : 'text-gray-400'
                                                }`}>
                                                  {(() => {
                                                    const score = (participant.kills * 2 + participant.assists) / Math.max(participant.deaths, 1);
                                                    return Math.round(score * 10);
                                                  })()}
                                                </div>
                                              </div>

                                              {/* KDA */}
                                              <div className="w-20 flex-shrink-0">
                                                <div className="text-center">
                                                  <div className="text-white text-[10px] font-medium font-mono whitespace-nowrap leading-tight">
                                                    {participant.kills}<span className="text-gray-600 mx-0.5">/</span><span className="text-[#E84057] font-bold">{participant.deaths}</span><span className="text-gray-600 mx-0.5">/</span>{participant.assists}
                                                  </div>
                                                  <div className={`text-[9px] font-bold font-mono mt-0.5 ${
                                                    participantKDA >= 5 ? 'text-[#ECBC2C] drop-shadow-[0_0_5px_rgba(236,188,44,0.5)]' :
                                                    participantKDA >= 3 ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-gray-400'
                                                  }`}>
                                                    {getKDA(participant)}
                                                  </div>
                                                </div>
                                              </div>

                                              {/* Damage */}
                                              <div className="w-20 flex-shrink-0">
                                                <div className="text-white text-center font-mono font-bold">{(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k</div>
                                                <div className="w-full bg-[#0a1628] h-1.5 rounded-none mt-1 border border-red-400/20 overflow-hidden">
                                                  <div 
                                                    className="bg-gradient-to-r from-[#E84057] to-red-400 h-full shadow-[0_0_8px_rgba(232,64,87,0.6)]"
                                                    style={{ 
                                                      width: `${Math.min(100, (participant.totalDamageDealtToChampions / Math.max(...match.info.participants.filter(p => p.teamId === 200).map(p => p.totalDamageDealtToChampions))) * 100)}%` 
                                                    }}
                                                  ></div>
                                                </div>
                                              </div>

                                              {/* Gold */}
                                              <div className="w-16 text-center flex-shrink-0">
                                                <div className="text-[#ECBC2C] font-bold font-mono drop-shadow-[0_0_5px_rgba(236,188,44,0.5)]">{(participant.goldEarned / 1000).toFixed(1)}k</div>
                                              </div>

                                              {/* CS */}
                                              <div className="w-12 text-center flex-shrink-0">
                                                <div className="text-white font-mono font-bold">{getCS(participant)}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">
                                                  ({getCSPerMin(participant, match.info.gameDuration)})
                                                </div>
                                              </div>

                                              {/* Wards */}
                                              <div className="w-16 text-center flex-shrink-0">
                                                <div className="text-white font-mono font-bold">{participant.visionScore}</div>
                                              </div>

                                              {/* Items */}
                                              <div className="flex space-x-1 flex-shrink-0 ml-4">
                                                {[0, 1, 2, 3, 4, 5, 6].map((itemIdx) => {
                                                  const itemId = (participant as any)[`item${itemIdx}`];
                                                  return (
                                                    <div 
                                                      key={itemIdx} 
                                                      className={`relative group/item w-6 h-6 ${itemIdx === 6 ? 'rounded-full' : 'rounded-none'} ${
                                                        itemId > 0 ? 'bg-[#0a1628]' : 'bg-[#0a1628]/30'
                                                      } border ${
                                                        itemId > 0 ? 'border-red-400/30 hover:border-red-400/60' : 'border-gray-700/20'
                                                      } overflow-hidden flex items-center justify-center transition-all`}
                                                    >
                                                      {/* Item glow on hover */}
                                                      {itemId > 0 && (
                                                        <div className={`absolute ${itemIdx === 6 ? '-inset-1 rounded-full' : '-inset-0.5'} bg-gradient-to-br from-red-400/20 to-[#E84057]/20 opacity-0 group-hover/item:opacity-100 transition-opacity blur-sm`}></div>
                                                      )}
                                                      {itemId > 0 && (
                                                        <Image
                                                          src={getItemImageUrl(itemId)}
                                                          alt="Item"
                                                          width={24}
                                                          height={24}
                                                          className="relative w-full h-full object-cover"
                                                        />
                                                      )}
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              </div>
                              )}

                              {/* Performance Tab Content */}
                              {activeTab[match.metadata.matchId] === 'performance' && (
                                <div className="relative">
                                  {/* Performance Header */}
                                  <div className="flex items-center justify-between mb-4 px-4 text-xs font-mono tracking-wider uppercase text-gray-500">
                                    <span className="w-48">Player</span>
                                    <span className="w-20 text-center">Kills</span>
                                    <span className="w-20 text-center">KDA</span>
                                    <span className="flex-1 text-center">Damage</span>
                                    <span className="w-24 text-center">Gold</span>
                                    <span className="w-20 text-center">Wards</span>
                                    <span className="w-20 text-center">CS</span>
                                  </div>

                                  {/* All Players Performance */}
                                  <div className="space-y-1">
                                    {match.info.participants
                                      .sort((a, b) => {
                                        // Calculate performance score for sorting
                                        const scoreA = (a.kills * 300 + a.assists * 150 + a.totalDamageDealtToChampions + a.goldEarned + a.visionScore * 50 + (a.totalMinionsKilled + a.neutralMinionsKilled) * 20) / Math.max(a.deaths, 1);
                                        const scoreB = (b.kills * 300 + b.assists * 150 + b.totalDamageDealtToChampions + b.goldEarned + b.visionScore * 50 + (b.totalMinionsKilled + b.neutralMinionsKilled) * 20) / Math.max(b.deaths, 1);
                                        return scoreB - scoreA;
                                      })
                                      .map((participant, idx) => {
                                        const isPlayer = participant.puuid === playerData.puuid;
                                        const participantKDA = parseFloat(getKDA(participant));
                                        
                                        // Calculate performance score (0-100)
                                        const maxDamage = Math.max(...match.info.participants.map(p => p.totalDamageDealtToChampions));
                                        const maxGold = Math.max(...match.info.participants.map(p => p.goldEarned));
                                        const maxVision = Math.max(...match.info.participants.map(p => p.visionScore));
                                        const maxCS = Math.max(...match.info.participants.map(p => p.totalMinionsKilled + p.neutralMinionsKilled));
                                        
                                        const damageScore = (participant.totalDamageDealtToChampions / maxDamage) * 30;
                                        const goldScore = (participant.goldEarned / maxGold) * 20;
                                        const kdaScore = Math.min(participantKDA * 10, 25);
                                        const visionScore = (participant.visionScore / maxVision) * 15;
                                        const csScore = ((participant.totalMinionsKilled + participant.neutralMinionsKilled) / maxCS) * 10;
                                        
                                        const performanceScore = Math.min(100, Math.round(damageScore + goldScore + kdaScore + visionScore + csScore));

                                        return (
                                          <div
                                            key={idx}
                                            className={`relative flex items-center p-3 rounded-none transition-all overflow-hidden group/player ${
                                              isPlayer 
                                                ? 'bg-cyan-400/10 border-l-2 border-cyan-400 shadow-[0_0_15px_rgba(0,255,255,0.2)]' 
                                                : 'hover:bg-white/5 border-l-2 border-transparent'
                                            } ${participant.teamId === 100 ? 'bg-[#5383E8]/5' : 'bg-[#E84057]/5'}`}
                                          >
                                            {/* Scan line effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity"></div>
                                            
                                            {/* Player Info */}
                                            <div className="flex items-center space-x-3 w-48 flex-shrink-0 relative z-10">
                                              <div className="relative flex-shrink-0">
                                                <div className={`relative w-10 h-10 overflow-hidden border ${
                                                  isPlayer ? 'border-cyan-400/50' : participant.teamId === 100 ? 'border-[#5383E8]/30' : 'border-[#E84057]/30'
                                                }`}>
                                                  <Image
                                                    src={getChampionImageUrl(participant.championId)}
                                                    alt={participant.championName}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                  />
                                                </div>
                                                <div className={`absolute -bottom-0.5 -right-0.5 px-1 text-[9px] font-bold font-mono border ${
                                                  participant.teamId === 100 
                                                    ? 'bg-gradient-to-br from-[#5383E8] to-cyan-400 text-white border-cyan-400/50' 
                                                    : 'bg-gradient-to-br from-[#E84057] to-red-400 text-white border-red-400/50'
                                                }`}>
                                                  {participant.champLevel}
                                                </div>
                                              </div>
                                              
                                              <div className="flex-1 min-w-0">
                                                <div className={`text-xs font-medium truncate ${
                                                  isPlayer ? 'text-cyan-400 font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-white'
                                                }`}>
                                                  {participant.riotIdGameName}
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                  {hasPositions(match.info.queueId) && getPlayerPosition(participant) && getRoleIconUrl(getPlayerPosition(participant)) && (
                                                    <div className="w-3 h-3 relative flex-shrink-0">
                                                      <Image
                                                        src={getRoleIconUrl(getPlayerPosition(participant))}
                                                        alt={getPlayerPosition(participant)}
                                                        width={12}
                                                        height={12}
                                                        className="w-full h-full object-contain opacity-60"
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            </div>

                                            {/* Stats */}
                                            <div className="flex items-center flex-1 space-x-4 text-xs relative z-10">
                                              <div className="w-20 text-center font-mono font-bold text-white">{participant.kills}</div>
                                              
                                              <div className="w-20 text-center">
                                                <div className={`text-xs font-bold font-mono ${
                                                  participantKDA >= 5 ? 'text-[#ECBC2C] drop-shadow-[0_0_5px_rgba(236,188,44,0.5)]' :
                                                  participantKDA >= 3 ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]' : 'text-gray-400'
                                                }`}>
                                                  {getKDA(participant)}
                                                </div>
                                              </div>
                                              
                                              <div className="flex-1 text-center font-mono text-white font-bold">
                                                {(participant.totalDamageDealtToChampions / 1000).toFixed(1)}k
                                              </div>
                                              
                                              <div className="w-24 text-center font-mono text-[#ECBC2C] font-bold drop-shadow-[0_0_5px_rgba(236,188,44,0.3)]">
                                                {(participant.goldEarned / 1000).toFixed(1)}k
                                              </div>
                                              
                                              <div className="w-20 text-center font-mono text-white font-bold">{participant.visionScore}</div>
                                              
                                              <div className="w-20 text-center font-mono text-white font-bold">{getCS(participant)}</div>
                                            </div>

                                            {/* Performance Bar */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1">
                                              <div 
                                                className={`h-full ${
                                                  participant.teamId === 100 
                                                    ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 shadow-[0_0_8px_rgba(0,255,255,0.5)]' 
                                                    : 'bg-gradient-to-r from-[#E84057] to-red-400 shadow-[0_0_8px_rgba(232,64,87,0.5)]'
                                                }`}
                                                style={{ width: `${performanceScore}%` }}
                                              ></div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}

                              {/* Timeline Tab Content */}
                              {activeTab[match.metadata.matchId] === 'timeline' && (
                                <div className="relative">
                                  {loadingTimeline[match.metadata.matchId] ? (
                                    <div className="flex items-center justify-center py-20">
                                      <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                                    </div>
                                  ) : timelineData[match.metadata.matchId]?.events ? (
                                    <div className="space-y-2">
                                      {timelineData[match.metadata.matchId].events
                                        .filter((event: any) => {
                                          // Filter out events we don't want to display
                                          const excludedTypes = ['ITEM_PURCHASED', 'ITEM_SOLD', 'ITEM_DESTROYED', 'ITEM_UNDO'];
                                          return !excludedTypes.includes(event.type);
                                        })
                                        .map((event: any, idx: number) => {
                                        // Get participant data - try different ID fields based on event type
                                        let participant = null;
                                        
                                        // WARD_PLACED and WARD_KILL use creatorId
                                        if (event.type === 'WARD_PLACED' || event.type === 'WARD_KILL') {
                                          if (event.creatorId) {
                                            participant = match.info.participants.find(
                                              (p: any) => p.participantId === event.creatorId
                                            );
                                          }
                                        }
                                        // CHAMPION_KILL uses killerId
                                        else if (event.killerId) {
                                          participant = match.info.participants.find(
                                            (p: any) => p.participantId === event.killerId
                                          );
                                        } 
                                        // Other events use participantId
                                        else if (event.participantId) {
                                          participant = match.info.participants.find(
                                            (p: any) => p.participantId === event.participantId
                                          );
                                        }
                                        
                                        const victim = event.victimId ? match.info.participants.find(
                                          (p: any) => p.participantId === event.victimId
                                        ) : null;

                                        // Skip if no participant found (shouldn't happen with filtered events)
                                        if (!participant) return null;

                                        // Determine if we should render this event
                                        const shouldRender = 
                                          event.type === 'CHAMPION_KILL' ||
                                          event.type === 'ELITE_MONSTER_KILL' ||
                                          event.type === 'BUILDING_KILL' ||
                                          event.type === 'WARD_PLACED' ||
                                          event.type === 'WARD_KILL' ||
                                          event.type === 'TURRET_PLATE_DESTROYED';

                                        if (!shouldRender) return null;

                                        // Render different event types
                                        return (
                                          <div
                                            key={idx}
                                            className={`relative flex items-center p-3 rounded-none transition-all overflow-hidden group/event ${
                                              participant?.teamId === 100 ? 'bg-[#5383E8]/5 hover:bg-[#5383E8]/10' : 'bg-[#E84057]/5 hover:bg-[#E84057]/10'
                                            } border-l-2 ${
                                              participant?.teamId === 100 ? 'border-[#5383E8]/30' : 'border-[#E84057]/30'
                                            }`}
                                          >
                                            {/* Scan line effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent opacity-0 group-hover/event:opacity-100 transition-opacity"></div>
                                            
                                            {/* Time */}
                                            <div className="w-16 flex-shrink-0 text-center relative z-10">
                                              <div className="text-sm font-bold font-mono text-cyan-400 drop-shadow-[0_0_5px_rgba(0,255,255,0.5)]">
                                                {event.formattedTime}
                                              </div>
                                            </div>

                                            {/* Event Content */}
                                            <div className="flex-1 flex items-center space-x-3 relative z-10">
                                              {/* Champion Portrait */}
                                              {participant && (
                                                <div className="relative flex-shrink-0">
                                                  <div className={`w-10 h-10 overflow-hidden border ${
                                                    participant.teamId === 100 ? 'border-[#5383E8]/30' : 'border-[#E84057]/30'
                                                  }`}>
                                                    <Image
                                                      src={getChampionImageUrl(participant.championId)}
                                                      alt={participant.championName}
                                                      width={40}
                                                      height={40}
                                                      className="w-full h-full object-cover"
                                                    />
                                                  </div>
                                                </div>
                                              )}

                                              {/* Event Description */}
                                              <div className="flex-1 min-w-0">
                                                <div className="text-sm text-white font-medium">
                                                  {event.type === 'CHAMPION_KILL' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-red-400 mx-2 font-bold">killed</span>
                                                      <span className="font-bold text-gray-300">{victim?.riotIdGameName || 'Enemy'}</span>
                                                      {event.assistingParticipantIds && event.assistingParticipantIds.length > 0 && (
                                                        <span className="text-gray-500 ml-2">({event.assistingParticipantIds.length} assist{event.assistingParticipantIds.length > 1 ? 's' : ''})</span>
                                                      )}
                                                    </>
                                                  )}
                                                  {event.type === 'ELITE_MONSTER_KILL' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-purple-400 mx-2">killed</span>
                                                      <span className="font-bold text-purple-300">{event.monsterType?.replace('_', ' ')}</span>
                                                      {event.monsterSubType && <span className="text-gray-500"> ({event.monsterSubType})</span>}
                                                    </>
                                                  )}
                                                  {event.type === 'BUILDING_KILL' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-orange-400 mx-2">destroyed</span>
                                                      <span className="font-bold text-orange-300">{event.buildingType?.replace(/_/g, ' ').toLowerCase()}</span>
                                                      {event.laneType && <span className="text-gray-500"> ({event.laneType.replace('_', ' ')})</span>}
                                                    </>
                                                  )}
                                                  {event.type === 'WARD_PLACED' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-green-400 mx-2">placed</span>
                                                      <span className="font-bold text-green-300">{event.wardType?.replace('_', ' ')} Ward</span>
                                                    </>
                                                  )}
                                                  {event.type === 'WARD_KILL' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-red-400 mx-2">destroyed</span>
                                                      <span className="font-bold text-gray-300">{event.wardType?.replace('_', ' ')} Ward</span>
                                                    </>
                                                  )}
                                                  {event.type === 'TURRET_PLATE_DESTROYED' && (
                                                    <>
                                                      <span className="font-bold text-cyan-400">{participant.riotIdGameName}</span>
                                                      <span className="text-orange-400 mx-2">destroyed</span>
                                                      <span className="font-bold text-orange-300">Turret Plate</span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Victim Icon for Kills */}
                                              {event.type === 'CHAMPION_KILL' && victim && (
                                                <div className="w-10 h-10 flex-shrink-0">
                                                  <div className="w-full h-full overflow-hidden border border-gray-600/30">
                                                    <Image
                                                      src={getChampionImageUrl(victim.championId)}
                                                      alt={victim.championName}
                                                      width={40}
                                                      height={40}
                                                      className="w-full h-full object-cover opacity-70"
                                                    />
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="flex items-center justify-center py-20 text-gray-500">
                                      <p>No timeline data available</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Item Build Tab Content */}
                              {activeTab[match.metadata.matchId] === 'item-build' && (
                                <div className="space-y-6">
                                  {/* Runes Section */}
                                  <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-6 border border-cyan-400/20 overflow-hidden shadow-[0_0_20px_rgba(83,131,232,0.15)]">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
                                    
                                    <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase mb-6 relative z-10 border-l-4 border-cyan-400 pl-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                      Runes
                                    </h3>
                                    
                                    {!playerData.perks?.styles ? (
                                      <div className="text-gray-500 relative z-10">No rune data available</div>
                                    ) : (
                                    <div className="flex space-x-8 relative z-10">
                                      {/* Primary Runes */}
                                      {(() => {
                                        const primaryStyle = playerData.perks?.styles?.[0];
                                        const primaryTreeId = primaryStyle?.style;
                                        const primarySelections = primaryStyle?.selections || [];
                                        
                                        console.log('[Item Build] Primary Runes:', {
                                          primaryTreeId,
                                          primarySelections,
                                          fullPerks: playerData.perks
                                        });
                                        
                                        const runeTreeNames: any = {
                                          8000: 'Precision',
                                          8100: 'Domination',
                                          8200: 'Sorcery',
                                          8300: 'Inspiration',
                                          8400: 'Resolve'
                                        };
                                        
                                        const runeTreeIcons: any = {
                                          8000: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Precision.png',
                                          8100: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Domination.png',
                                          8200: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Sorcery.png',
                                          8300: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/Inspiration.png',
                                          8400: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Resolve.png'
                                        };
                                        
                                        // Map rune IDs to their image paths
                                        const getRuneImagePath = (runeId: number, treeId: number): string => {
                                          const runePathMap: any = {
                                            // Precision Keystones
                                            8005: 'perk-images/Styles/Precision/PressTheAttack/PressTheAttack.png',
                                            8008: 'perk-images/Styles/Precision/LethalTempo/LethalTempoTemp.png',
                                            8021: 'perk-images/Styles/Precision/FleetFootwork/FleetFootwork.png',
                                            8010: 'perk-images/Styles/Precision/Conqueror/Conqueror.png',
                                            // Precision Slot 1
                                            9101: 'perk-images/Styles/Precision/AbsorbLife/AbsorbLife.png',
                                            9111: 'perk-images/Styles/Precision/Triumph.png',
                                            8009: 'perk-images/Styles/Precision/PresenceOfMind/PresenceOfMind.png',
                                            // Precision Slot 2
                                            9104: 'perk-images/Styles/Precision/LegendAlacrity/LegendAlacrity.png',
                                            9105: 'perk-images/Styles/Precision/LegendHaste/LegendHaste.png',
                                            9103: 'perk-images/Styles/Precision/LegendBloodline/LegendBloodline.png',
                                            // Precision Slot 3
                                            8014: 'perk-images/Styles/Precision/CoupDeGrace/CoupDeGrace.png',
                                            8017: 'perk-images/Styles/Precision/CutDown/CutDown.png',
                                            8299: 'perk-images/Styles/Sorcery/LastStand/LastStand.png',
                                            
                                            // Domination Keystones
                                            8112: 'perk-images/Styles/Domination/Electrocute/Electrocute.png',
                                            8124: 'perk-images/Styles/Domination/Predator/Predator.png',
                                            8128: 'perk-images/Styles/Domination/DarkHarvest/DarkHarvest.png',
                                            9923: 'perk-images/Styles/Domination/HailOfBlades/HailOfBlades.png',
                                            // Domination Slot 1
                                            8126: 'perk-images/Styles/Domination/CheapShot/CheapShot.png',
                                            8139: 'perk-images/Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png',
                                            8143: 'perk-images/Styles/Domination/SuddenImpact/SuddenImpact.png',
                                            // Domination Slot 2
                                            8137: 'perk-images/Styles/Domination/SixthSense/SixthSense.png',
                                            8140: 'perk-images/Styles/Domination/GrislyMementos/GrislyMementos.png',
                                            8141: 'perk-images/Styles/Domination/DeepWard/DeepWard.png',
                                            // Domination Slot 3
                                            8135: 'perk-images/Styles/Domination/TreasureHunter/TreasureHunter.png',
                                            8105: 'perk-images/Styles/Domination/RelentlessHunter/RelentlessHunter.png',
                                            8106: 'perk-images/Styles/Domination/UltimateHunter/UltimateHunter.png',
                                            
                                            // Sorcery Keystones
                                            8214: 'perk-images/Styles/Sorcery/SummonAery/SummonAery.png',
                                            8229: 'perk-images/Styles/Sorcery/ArcaneComet/ArcaneComet.png',
                                            8230: 'perk-images/Styles/Sorcery/PhaseRush/PhaseRush.png',
                                            // Sorcery Slot 1
                                            8224: 'perk-images/Styles/Sorcery/NullifyingOrb/Axiom_Arcanist.png',
                                            8226: 'perk-images/Styles/Sorcery/ManaflowBand/ManaflowBand.png',
                                            8275: 'perk-images/Styles/Sorcery/NimbusCloak/6361.png',
                                            // Sorcery Slot 2
                                            8210: 'perk-images/Styles/Sorcery/Transcendence/Transcendence.png',
                                            8234: 'perk-images/Styles/Sorcery/Celerity/CelerityTemp.png',
                                            8233: 'perk-images/Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png',
                                            // Sorcery Slot 3
                                            8237: 'perk-images/Styles/Sorcery/Scorch/Scorch.png',
                                            8232: 'perk-images/Styles/Sorcery/Waterwalking/Waterwalking.png',
                                            8236: 'perk-images/Styles/Sorcery/GatheringStorm/GatheringStorm.png',
                                            
                                            // Resolve Keystones
                                            8437: 'perk-images/Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
                                            8439: 'perk-images/Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
                                            8465: 'perk-images/Styles/Resolve/Guardian/Guardian.png',
                                            // Resolve Slot 1
                                            8446: 'perk-images/Styles/Resolve/Demolish/Demolish.png',
                                            8463: 'perk-images/Styles/Resolve/FontOfLife/FontOfLife.png',
                                            8401: 'perk-images/Styles/Resolve/MirrorShell/MirrorShell.png',
                                            // Resolve Slot 2
                                            8429: 'perk-images/Styles/Resolve/Conditioning/Conditioning.png',
                                            8444: 'perk-images/Styles/Resolve/SecondWind/SecondWind.png',
                                            8473: 'perk-images/Styles/Resolve/BonePlating/BonePlating.png',
                                            // Resolve Slot 3
                                            8451: 'perk-images/Styles/Resolve/Overgrowth/Overgrowth.png',
                                            8453: 'perk-images/Styles/Resolve/Revitalize/Revitalize.png',
                                            8242: 'perk-images/Styles/Sorcery/Unflinching/Unflinching.png',
                                            
                                            // Inspiration Keystones
                                            8351: 'perk-images/Styles/Inspiration/GlacialAugment/GlacialAugment.png',
                                            8360: 'perk-images/Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
                                            8369: 'perk-images/Styles/Inspiration/FirstStrike/FirstStrike.png',
                                            // Inspiration Slot 1
                                            8306: 'perk-images/Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png',
                                            8304: 'perk-images/Styles/Inspiration/MagicalFootwear/MagicalFootwear.png',
                                            8321: 'perk-images/Styles/Inspiration/CashBack/CashBack2.png',
                                            // Inspiration Slot 2
                                            8313: 'perk-images/Styles/Inspiration/PerfectTiming/AlchemistCabinet.png',
                                            8352: 'perk-images/Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png',
                                            8345: 'perk-images/Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png',
                                            // Inspiration Slot 3
                                            8347: 'perk-images/Styles/Inspiration/CosmicInsight/CosmicInsight.png',
                                            8410: 'perk-images/Styles/Resolve/ApproachVelocity/ApproachVelocity.png',
                                            8316: 'perk-images/Styles/Inspiration/JackOfAllTrades/JackofAllTrades2.png',
                                          };
                                          
                                          return `https://ddragon.leagueoflegends.com/cdn/img/${runePathMap[runeId] || 'perk-images/Styles/RunesIcon.png'}`;
                                        };
                                        
                                        // Map rune IDs to their names
                                        const getRuneName = (runeId: number): string => {
                                          const runeNames: any = {
                                            // Precision
                                            8005: 'Press the Attack', 8008: 'Lethal Tempo', 8021: 'Fleet Footwork', 8010: 'Conqueror',
                                            9101: 'Overheal', 9111: 'Triumph', 8009: 'Presence of Mind',
                                            9104: 'Legend: Alacrity', 9105: 'Legend: Tenacity', 9103: 'Legend: Bloodline',
                                            8014: 'Coup de Grace', 8017: 'Cut Down', 8299: 'Last Stand',
                                            // Domination
                                            8112: 'Electrocute', 8124: 'Predator', 8128: 'Dark Harvest', 9923: 'Hail of Blades',
                                            8126: 'Cheap Shot', 8139: 'Taste of Blood', 8143: 'Sudden Impact',
                                            8137: 'Sixth Sense', 8140: 'Grisly Mementos', 8141: 'Deep Ward',
                                            8135: 'Treasure Hunter', 8105: 'Relentless Hunter', 8106: 'Ultimate Hunter',
                                            // Sorcery
                                            8214: 'Summon Aery', 8229: 'Arcane Comet', 8230: 'Phase Rush',
                                            8224: 'Nullifying Orb', 8226: 'Manaflow Band', 8275: 'Nimbus Cloak',
                                            8210: 'Transcendence', 8234: 'Celerity', 8233: 'Absolute Focus',
                                            8237: 'Scorch', 8232: 'Waterwalking', 8236: 'Gathering Storm',
                                            // Resolve
                                            8437: 'Grasp of the Undying', 8439: 'Aftershock', 8465: 'Guardian',
                                            8446: 'Demolish', 8463: 'Font of Life', 8401: 'Shield Bash',
                                            8429: 'Conditioning', 8444: 'Second Wind', 8473: 'Bone Plating',
                                            8451: 'Overgrowth', 8453: 'Revitalize', 8242: 'Unflinching',
                                            // Inspiration
                                            8351: 'Glacial Augment', 8360: 'Unsealed Spellbook', 8369: 'First Strike',
                                            8306: 'Hextech Flashtraption', 8304: 'Magical Footwear', 8321: 'Futures Market',
                                            8313: 'Perfect Timing', 8352: 'Time Warp Tonic', 8345: 'Biscuit Delivery',
                                            8347: 'Cosmic Insight', 8410: 'Approach Velocity', 8316: 'Jack of All Trades',
                                          };
                                          return runeNames[runeId] || 'Unknown Rune';
                                        };
                                        
                                        return (
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-4">
                                              <span className="text-white font-bold text-sm font-mono uppercase tracking-wider">
                                                {runeTreeNames[primaryTreeId] || 'Primary'}
                                              </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                              {primarySelections.map((selection: any, idx: number) => (
                                                <div key={idx} className="flex items-center space-x-3 group/rune">
                                                  <div className={`relative ${idx === 0 ? 'w-12 h-12' : 'w-10 h-10'}`}>
                                                    {idx === 0 && (
                                                      <div className="absolute inset-0 bg-yellow-400/30 blur-lg"></div>
                                                    )}
                                                    <div className={`relative w-full h-full rounded-full overflow-hidden border-2 ${
                                                      idx === 0 ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-cyan-400/40'
                                                    } bg-[#0a1628] group-hover/rune:border-cyan-400 transition-all`}>
                                                      <img
                                                        src={getRuneImagePath(selection.perk, primaryTreeId)}
                                                        alt="Rune"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                          (e.target as HTMLImageElement).src = getCDNUrl('img/profileicon/29.png');
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                  <span className={`text-xs font-medium ${
                                                    idx === 0 ? 'text-yellow-400' : 'text-cyan-400/80'
                                                  } font-mono`}>
                                                    {getRuneName(selection.perk)}
                                                  </span>
                                                  {idx === 0 && (
                                                    <div className="flex items-center space-x-1 ml-auto">
                                                      <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"></div>
                                                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-400/60"></div>
                                                      <div className="w-1 h-1 rounded-full bg-yellow-400/30"></div>
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                      
                                      {/* Secondary Runes */}
                                      {(() => {
                                        const secondaryStyle = playerData.perks?.styles?.[1];
                                        const secondaryTreeId = secondaryStyle?.style;
                                        const secondarySelections = secondaryStyle?.selections || [];
                                        
                                        const runeTreeNames: any = {
                                          8000: 'Precision',
                                          8100: 'Domination',
                                          8200: 'Sorcery',
                                          8300: 'Inspiration',
                                          8400: 'Resolve'
                                        };
                                        
                                        const runeTreeIcons: any = {
                                          8000: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Precision/Precision.png',
                                          8100: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Domination/Domination.png',
                                          8200: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Sorcery/Sorcery.png',
                                          8300: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Inspiration/Inspiration.png',
                                          8400: 'https://ddragon.leagueoflegends.com/cdn/img/perk-images/Styles/Resolve/Resolve.png'
                                        };
                                        
                                        // Map rune IDs to their image paths using official Riot API paths
                                        const getRuneImagePath = (runeId: number, treeId: number): string => {
                                          const runePathMap: any = {
                                            // Precision Tree (8000)
                                            8005: 'Styles/Precision/PressTheAttack/PressTheAttack.png',
                                            8008: 'Styles/Precision/LethalTempo/LethalTempoTemp.png',
                                            8021: 'Styles/Precision/FleetFootwork/FleetFootwork.png',
                                            8010: 'Styles/Precision/Conqueror/Conqueror.png',
                                            9101: 'Styles/Precision/Overheal.png',
                                            9111: 'Styles/Precision/Triumph.png',
                                            8009: 'Styles/Precision/PresenceOfMind/PresenceOfMind.png',
                                            9104: 'Styles/Precision/LegendAlacrity/LegendAlacrity.png',
                                            9105: 'Styles/Precision/LegendTenacity/LegendTenacity.png',
                                            9103: 'Styles/Precision/LegendBloodline/LegendBloodline.png',
                                            8014: 'Styles/Precision/CoupDeGrace/CoupDeGrace.png',
                                            8017: 'Styles/Precision/CutDown/CutDown.png',
                                            8299: 'Styles/Precision/LastStand/LastStand.png',
                                            // Domination Tree (8100)
                                            8112: 'Styles/Domination/Electrocute/Electrocute.png',
                                            8124: 'Styles/Domination/Predator/Predator.png',
                                            8128: 'Styles/Domination/DarkHarvest/DarkHarvest.png',
                                            9923: 'Styles/Domination/HailOfBlades/HailOfBlades.png',
                                            8126: 'Styles/Domination/CheapShot/CheapShot.png',
                                            8139: 'Styles/Domination/TasteOfBlood/GreenTerror_TasteOfBlood.png',
                                            8143: 'Styles/Domination/SuddenImpact/SuddenImpact.png',
                                            8136: 'Styles/Domination/ZombieWard/ZombieWard.png',
                                            8120: 'Styles/Domination/GhostPoro/GhostPoro.png',
                                            8138: 'Styles/Domination/EyeballCollection/EyeballCollection.png',
                                            8135: 'Styles/Domination/RavenousHunter/RavenousHunter.png',
                                            8134: 'Styles/Domination/IngeniousHunter/IngeniousHunter.png',
                                            8105: 'Styles/Domination/RelentlessHunter/RelentlessHunter.png',
                                            8106: 'Styles/Domination/UltimateHunter/UltimateHunter.png',
                                           
                                            // Sorcery Tree (8200)
                                            8214: 'Styles/Sorcery/SummonAery/SummonAery.png',
                                            8229: 'Styles/Sorcery/ArcaneComet/ArcaneComet.png',
                                            8230: 'Styles/Sorcery/PhaseRush/PhaseRush.png',
                                            8224: 'Styles/Sorcery/NullifyingOrb/Pokeshield.png',
                                            8226: 'Styles/Sorcery/ManaflowBand/ManaflowBand.png',
                                            8275: 'Styles/Sorcery/NimbusCloak/6361.png',
                                            8210: 'Styles/Sorcery/Transcendence/Transcendence.png',
                                            8234: 'Styles/Sorcery/Celerity/CelerityTemp.png',
                                            8233: 'Styles/Sorcery/AbsoluteFocus/AbsoluteFocus.png',
                                            8237: 'Styles/Sorcery/Scorch/Scorch.png',
                                            8232: 'Styles/Sorcery/Waterwalking/Waterwalking.png',
                                            8236: 'Styles/Sorcery/GatheringStorm/GatheringStorm.png',
                                            // Resolve Tree (8400)
                                            8437: 'Styles/Resolve/GraspOfTheUndying/GraspOfTheUndying.png',
                                            8439: 'Styles/Resolve/VeteranAftershock/VeteranAftershock.png',
                                            8465: 'Styles/Resolve/Guardian/Guardian.png',
                                            8446: 'Styles/Resolve/Demolish/Demolish.png',
                                            8463: 'Styles/Resolve/FontOfLife/FontOfLife.png',
                                            8401: 'Styles/Resolve/MirrorShell/MirrorShell.png',
                                            8429: 'Styles/Resolve/Conditioning/Conditioning.png',
                                            8444: 'Styles/Resolve/SecondWind/SecondWind.png',
                                            8473: 'Styles/Resolve/BonePlating/BonePlating.png',
                                            8451: 'Styles/Resolve/Overgrowth/Overgrowth.png',
                                            8453: 'Styles/Resolve/Revitalize/Revitalize.png',
                                            8242: 'Styles/Resolve/Unflinching/Unflinching.png',
                                            // Inspiration Tree (8300)
                                            8351: 'Styles/Inspiration/GlacialAugment/GlacialAugment.png',
                                            8360: 'Styles/Inspiration/UnsealedSpellbook/UnsealedSpellbook.png',
                                            8369: 'Styles/Inspiration/FirstStrike/FirstStrike.png',
                                            8306: 'Styles/Inspiration/HextechFlashtraption/HextechFlashtraption.png',
                                            8304: 'Styles/Inspiration/MagicalFootwear/MagicalFootwear.png',
                                            8313: 'Styles/Inspiration/PerfectTiming/PerfectTiming.png',
                                            8321: 'Styles/Inspiration/FuturesMarket/FuturesMarket.png',
                                            8316: 'Styles/Inspiration/MinionDematerializer/MinionDematerializer.png',
                                            8345: 'Styles/Inspiration/BiscuitDelivery/BiscuitDelivery.png',
                                            8347: 'Styles/Inspiration/CosmicInsight/CosmicInsight.png',
                                            8410: 'Styles/Inspiration/ApproachVelocity/ApproachVelocity.png',
                                            8352: 'Styles/Inspiration/TimeWarpTonic/TimeWarpTonic.png',
                                          };
                                          
                                          return `https://ddragon.leagueoflegends.com/cdn/img/perk-images/${runePathMap[runeId] || 'Styles/RunesIcon.png'}`;
                                        };
                                        
                                        // Map rune IDs to their names (same as primary)
                                        const getRuneName = (runeId: number): string => {
                                          const runeNames: any = {
                                            // Precision
                                            8005: 'Press the Attack', 8008: 'Lethal Tempo', 8021: 'Fleet Footwork', 8010: 'Conqueror',
                                            9101: 'Overheal', 9111: 'Triumph', 8009: 'Presence of Mind',
                                            9104: 'Legend: Alacrity', 9105: 'Legend: Tenacity', 9103: 'Legend: Bloodline',
                                            8014: 'Coup de Grace', 8017: 'Cut Down', 8299: 'Last Stand',
                                            // Domination
                                            8112: 'Electrocute', 8124: 'Predator', 8128: 'Dark Harvest', 9923: 'Hail of Blades',
                                            8126: 'Cheap Shot', 8139: 'Taste of Blood', 8143: 'Sudden Impact',
                                            8137: 'Sixth Sense', 8140: 'Grisly Mementos', 8141: 'Deep Ward',
                                            8135: 'Treasure Hunter', 8105: 'Relentless Hunter', 8106: 'Ultimate Hunter',
                                            // Sorcery
                                            8214: 'Summon Aery', 8229: 'Arcane Comet', 8230: 'Phase Rush',
                                            8224: 'Nullifying Orb', 8226: 'Manaflow Band', 8275: 'Nimbus Cloak',
                                            8210: 'Transcendence', 8234: 'Celerity', 8233: 'Absolute Focus',
                                            8237: 'Scorch', 8232: 'Waterwalking', 8236: 'Gathering Storm',
                                            // Resolve
                                            8437: 'Grasp of the Undying', 8439: 'Aftershock', 8465: 'Guardian',
                                            8446: 'Demolish', 8463: 'Font of Life', 8401: 'Shield Bash',
                                            8429: 'Conditioning', 8444: 'Second Wind', 8473: 'Bone Plating',
                                            8451: 'Overgrowth', 8453: 'Revitalize', 8242: 'Unflinching',
                                            // Inspiration
                                            8351: 'Glacial Augment', 8360: 'Unsealed Spellbook', 8369: 'First Strike',
                                            8306: 'Hextech Flashtraption', 8304: 'Magical Footwear', 8321: 'Futures Market',
                                            8313: 'Perfect Timing', 8352: 'Time Warp Tonic', 8345: 'Biscuit Delivery',
                                            8347: 'Cosmic Insight', 8410: 'Approach Velocity', 8316: 'Jack of All Trades',
                                          };
                                          return runeNames[runeId] || 'Unknown Rune';
                                        };
                                        
                                        return (
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-4">
                                              <span className="text-white font-bold text-sm font-mono uppercase tracking-wider">
                                                {runeTreeNames[secondaryTreeId] || 'Secondary'}
                                              </span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                              {secondarySelections.map((selection: any, idx: number) => (
                                                <div key={idx} className="flex items-center space-x-3 group/rune">
                                                  <div className="relative w-10 h-10">
                                                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-400/40 bg-[#0a1628] group-hover/rune:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                                      <img
                                                        src={getRuneImagePath(selection.perk, secondaryTreeId)}
                                                        alt="Rune"
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                          (e.target as HTMLImageElement).src = getCDNUrl('img/profileicon/29.png');
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                  <span className="text-xs font-medium text-cyan-400/80 font-mono">
                                                    {getRuneName(selection.perk)}
                                                  </span>
                                                  <div className="flex items-center space-x-1 ml-auto">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,255,255,0.8)]"></div>
                                                    <div className="w-1 h-1 rounded-full bg-cyan-400/60"></div>
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                    )}
                                  </div>
                                  
                                  {/* Skill Order Section */}
                                  <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-6 border border-cyan-400/20 overflow-hidden shadow-[0_0_20px_rgba(83,131,232,0.15)]">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
                                    
                                    <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase mb-6 relative z-10 border-l-4 border-cyan-400 pl-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                      Skill Order
                                    </h3>
                                    
                                    {loadingTimeline[match.metadata.matchId] ? (
                                      <div className="flex items-center justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                                      </div>
                                    ) : timelineData[match.metadata.matchId]?.events ? (
                                      (() => {
                                        const skillEvents = timelineData[match.metadata.matchId].events
                                          .filter((event: any) => 
                                            event.type === 'SKILL_LEVEL_UP' && 
                                            event.participantId === playerData.participantId
                                          )
                                          .sort((a: any, b: any) => a.timestamp - b.timestamp);
                                        
                                        const skillSlotMap: any = { 1: 'Q', 2: 'W', 3: 'E', 4: 'R' };
                                        
                                        // Group skill ups by ability
                                        const skillsByAbility: any = { Q: [], W: [], E: [], R: [] };
                                        skillEvents.forEach((event: any, idx: number) => {
                                          const ability = skillSlotMap[event.skillSlot];
                                          skillsByAbility[ability].push(idx + 1); // Champion level (1-18)
                                        });
                                        
                                        return (
                                          <div className="relative z-10">
                                            {/* Grid layout: rows for abilities, columns for levels 1-18 */}
                                            <div className="space-y-2">
                                              {['Q', 'W', 'E', 'R'].map((ability) => (
                                                <div key={ability} className="flex items-center space-x-2">
                                                  {/* Ability Icon and Label */}
                                                  <div className="flex flex-col items-center w-16 flex-shrink-0">
                                                    <div className="relative w-12 h-12 group/ability">
                                                      <div className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover/ability:opacity-100 transition-opacity"></div>
                                                      <div className="relative w-full h-full overflow-hidden border-2 border-cyan-400/40 bg-[#0a1628] group-hover/ability:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                                        <img
                                                          src={getCDNUrl(`img/spell/${playerData.championName}${ability}.png`)}
                                                          alt={ability}
                                                          className="w-full h-full object-cover"
                                                          onError={(e) => {
                                                            (e.target as HTMLImageElement).src = getCDNUrl('img/profileicon/29.png');
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                    <span className="text-white font-bold text-xs font-mono mt-1">{ability}</span>
                                                  </div>
                                                  
                                                  {/* Level indicators (1-18) */}
                                                  <div className="flex flex-wrap gap-2">
                                                    {skillsByAbility[ability].map((level: number, idx: number) => (
                                                      <div
                                                        key={idx}
                                                        className={`relative flex items-center justify-center w-10 h-10 font-bold font-mono text-sm transition-all group/level ${
                                                          ability === 'R'
                                                            ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400/60 text-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.4)]'
                                                            : 'bg-[#5383E8]/20 border-2 border-[#5383E8]/60 text-[#5383E8] shadow-[0_0_10px_rgba(83,131,232,0.3)]'
                                                        } hover:scale-110`}
                                                      >
                                                        <span className="relative z-10">{level}</span>
                                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50"></div>
                                                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50"></div>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <div className="flex items-center justify-center py-10 text-gray-500">
                                        <p>No skill order data available</p>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Items Section */}
                                  <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-6 border border-cyan-400/20 overflow-hidden shadow-[0_0_20px_rgba(83,131,232,0.15)]">
                                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
                                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/40"></div>
                                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400/40"></div>
                                    
                                    <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase mb-6 relative z-10 border-l-4 border-cyan-400 pl-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                      Items
                                    </h3>
                                    
                                    {loadingTimeline[match.metadata.matchId] ? (
                                      <div className="flex items-center justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                                      </div>
                                    ) : timelineData[match.metadata.matchId]?.events ? (
                                      (() => {
                                        const itemEvents = timelineData[match.metadata.matchId].events
                                          .filter((event: any) => 
                                            event.type === 'ITEM_PURCHASED' && 
                                            event.participantId === playerData.participantId
                                          )
                                          .sort((a: any, b: any) => a.timestamp - b.timestamp);
                                        
                                        const itemGroups: any[] = [];
                                        let currentGroup: any = null;
                                        const timeThreshold = 5000;
                                        
                                        itemEvents.forEach((event: any) => {
                                          if (!currentGroup || event.timestamp - currentGroup.timestamp > timeThreshold) {
                                            currentGroup = {
                                              timestamp: event.timestamp,
                                              formattedTime: event.formattedTime,
                                              items: []
                                            };
                                            itemGroups.push(currentGroup);
                                          }
                                          currentGroup.items.push(event.itemId);
                                        });
                                        
                                        return (
                                          <div className="relative z-10 space-y-4">
                                            {itemGroups.map((group, groupIdx) => (
                                              <div key={groupIdx} className="flex items-center space-x-4 group/itemgroup">
                                                <div className="w-16 flex-shrink-0 text-center">
                                                  <div className="text-sm font-bold font-mono text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
                                                    {group.formattedTime}
                                                  </div>
                                                </div>
                                                
                                                <div className="flex space-x-2">
                                                  {group.items.map((itemId: number, itemIdx: number) => (
                                                    <div key={itemIdx} className="relative group/item">
                                                      <div className="absolute inset-0 bg-cyan-400/20 blur-md opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                                                      <div className="relative w-12 h-12 overflow-hidden border-2 border-cyan-400/40 bg-[#0a1628] group-hover/item:border-cyan-400 transition-all shadow-[0_0_10px_rgba(0,255,255,0.2)]">
                                                        <img
                                                          src={getCDNUrl(`img/item/${itemId}.png`)}
                                                          alt={`Item ${itemId}`}
                                                          className="w-full h-full object-cover"
                                                          onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none';
                                                          }}
                                                        />
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()
                                    ) : (
                                      <div className="flex items-center justify-center py-10 text-gray-500">
                                        <p>No item data available</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Metrics Tab Content */}
                              {activeTab[match.metadata.matchId] === 'metrics' && (
                                <div className="space-y-6">
                                  {timelineData[match.metadata.matchId] ? (
                                    (() => {
                                      const timeline = timelineData[match.metadata.matchId];
                                      const matchId = match.metadata.matchId;
                                      const gameDuration = match.info.gameDuration;
                                      
                                      // Debug: log timeline structure
                                      console.log('[Metrics] Timeline data:', timeline);
                                      console.log('[Metrics] Raw timeline:', timeline.rawTimeline);
                                      
                                      // Initialize selected players with current player if not set
                                      if (!selectedPlayers[matchId]) {
                                        setSelectedPlayers({
                                          ...selectedPlayers,
                                          [matchId]: new Set([playerData.participantId])
                                        });
                                      }
                                      
                                      // Initialize active metric if not set
                                      if (!activeMetric[matchId]) {
                                        setActiveMetric({ ...activeMetric, [matchId]: 'gold' });
                                      }
                                      
                                      const currentSelectedPlayers = selectedPlayers[matchId] || new Set([playerData.participantId]);
                                      const currentMetric = activeMetric[matchId] || 'gold';
                                      
                                      // Toggle player selection
                                      const togglePlayer = (participantId: number) => {
                                        const newSet = new Set(currentSelectedPlayers);
                                        if (newSet.has(participantId)) {
                                          if (newSet.size > 1) { // Keep at least one player selected
                                            newSet.delete(participantId);
                                          }
                                        } else {
                                          newSet.add(participantId);
                                        }
                                        setSelectedPlayers({ ...selectedPlayers, [matchId]: newSet });
                                      };
                                      
                                      // Get participant colors
                                      const getParticipantColor = (participantId: number) => {
                                        const participant = match.info.participants.find(p => p.participantId === participantId);
                                        if (!participant) return '#00FFFF';
                                        
                                        const colorPalette = [
                                          '#00FFFF', // Cyan
                                          '#FF6B9D', // Pink
                                          '#C084FC', // Purple
                                          '#FBBF24', // Amber
                                          '#34D399', // Emerald
                                          '#F472B6', // Hot Pink
                                          '#60A5FA', // Blue
                                          '#FB923C', // Orange
                                          '#A78BFA', // Violet
                                          '#22D3EE', // Cyan Light
                                        ];
                                        
                                        return colorPalette[(participantId - 1) % colorPalette.length];
                                      };
                                      
                                      // Process timeline frames to extract metrics at different timestamps
                                      const processMetricsData = () => {
                                        // Use rawTimeline.info.frames instead of timeline.info.frames
                                        const frames = timeline.rawTimeline?.info?.frames || [];
                                        const metricsData: any[] = [];
                                        
                                        console.log('[Metrics] Processing frames:', frames.length);
                                        
                                        frames.forEach((frame: any, index: number) => {
                                          const timestamp = frame.timestamp || (index * 60000); // Default to minute intervals
                                          const minutes = Math.floor(timestamp / 60000);
                                          
                                          const dataPoint: any = {
                                            time: `${minutes} min`,
                                            timestamp: minutes,
                                          };
                                          
                                          frame.participantFrames && Object.keys(frame.participantFrames).forEach((key) => {
                                            const pFrame = frame.participantFrames[key];
                                            const participantId = parseInt(key);
                                            
                                            if (currentMetric === 'gold') {
                                              dataPoint[`player${participantId}`] = pFrame.totalGold || 0;
                                            } else if (currentMetric === 'damage') {
                                              dataPoint[`player${participantId}`] = pFrame.damageStats?.totalDamageDoneToChampions || 0;
                                            } else if (currentMetric === 'cs') {
                                              dataPoint[`player${participantId}`] = (pFrame.minionsKilled || 0) + (pFrame.jungleMinionsKilled || 0);
                                            } else if (currentMetric === 'exp') {
                                              dataPoint[`player${participantId}`] = pFrame.xp || 0;
                                            }
                                          });
                                          
                                          metricsData.push(dataPoint);
                                        });
                                        
                                        console.log('[Metrics] Processed data points:', metricsData.length);
                                        console.log('[Metrics] Sample data:', metricsData[0]);
                                        
                                        return metricsData;
                                      };
                                      
                                      const metricsData = processMetricsData();
                                      
                                      // Calculate max value for Y-axis
                                      const getMaxValue = () => {
                                        let max = 0;
                                        metricsData.forEach(point => {
                                          Array.from(currentSelectedPlayers).forEach(participantId => {
                                            const value = point[`player${participantId}`] || 0;
                                            if (value > max) max = value;
                                          });
                                        });
                                        return Math.ceil(max / 1000) * 1000; // Round up to nearest 1000
                                      };
                                      
                                      const maxValue = getMaxValue();
                                      const yAxisSteps = 5;
                                      const stepValue = maxValue / yAxisSteps;
                                      
                                      return (
                                        <div className="relative bg-gradient-to-br from-[#0a1628]/80 to-[#1a2f4a]/80 rounded-none p-6 border border-cyan-400/20 overflow-hidden shadow-[0_0_20px_rgba(83,131,232,0.15)]">
                                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                                          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"></div>
                                          
                                          {/* Header */}
                                          <div className="flex items-center justify-between mb-6 relative z-10">
                                            <h3 className="text-lg font-bold text-white font-mono tracking-wider uppercase border-l-4 border-cyan-400 pl-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]">
                                              Match Metrics
                                            </h3>
                                            
                                            {/* Metric Selector */}
                                            <div className="flex items-center space-x-2 bg-[#0a1628]/50 rounded-none p-1 border border-cyan-400/20">
                                              {(['gold', 'damage', 'cs', 'exp'] as const).map((metric) => (
                                                <button
                                                  key={metric}
                                                  onClick={() => setActiveMetric({ ...activeMetric, [matchId]: metric })}
                                                  className={`px-4 py-1.5 text-xs font-bold font-mono uppercase transition-all ${
                                                    currentMetric === metric
                                                      ? 'bg-gradient-to-r from-[#5383E8] to-cyan-400 text-white shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                                                      : 'text-gray-500 hover:text-cyan-400'
                                                  }`}
                                                >
                                                  {metric}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                          
                                          {/* Chart */}
                                          <div className="relative bg-[#0a1628]/30 rounded-none p-6 border border-cyan-400/10 mb-6">
                                            <div className="relative h-[400px]">
                                              {/* Y-Axis Labels */}
                                              <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-between text-xs text-gray-500 font-mono">
                                                {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
                                                  <div key={i} className="text-right pr-2">
                                                    {Math.round((maxValue - (i * stepValue)) / 1000)}k
                                                  </div>
                                                ))}
                                              </div>
                                              
                                              {/* Chart Area */}
                                              <div className="absolute left-16 right-0 top-0 bottom-12">
                                                {/* Grid Lines */}
                                                <div className="absolute inset-0">
                                                  {Array.from({ length: yAxisSteps + 1 }, (_, i) => (
                                                    <div
                                                      key={i}
                                                      className="absolute left-0 right-0 border-t border-cyan-400/10"
                                                      style={{ top: `${(i / yAxisSteps) * 100}%` }}
                                                    ></div>
                                                  ))}
                                                </div>
                                                
                                                {/* SVG Chart */}
                                                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                                  {Array.from(currentSelectedPlayers).map((participantId) => {
                                                    const participant = match.info.participants.find(p => p.participantId === participantId);
                                                    if (!participant) return null;
                                                    
                                                    const color = getParticipantColor(participantId);
                                                    
                                                    // Build points with proper scaling
                                                    const points: string[] = [];
                                                    metricsData.forEach((point, index) => {
                                                      const x = (index / (metricsData.length - 1)) * 100;
                                                      const value = point[`player${participantId}`] || 0;
                                                      const y = 100 - ((value / maxValue) * 100);
                                                      points.push(`${x},${y}`);
                                                    });
                                                    
                                                    return (
                                                      <polyline
                                                        key={participantId}
                                                        points={points.join(' ')}
                                                        fill="none"
                                                        stroke={color}
                                                        strokeWidth="0.5"
                                                        vectorEffect="non-scaling-stroke"
                                                        style={{ filter: `drop-shadow(0 0 2px ${color})` }}
                                                      />
                                                    );
                                                  })}
                                                </svg>
                                              </div>
                                              
                                              {/* X-Axis Labels */}
                                              <div className="absolute left-16 right-0 bottom-0 h-12 flex justify-between text-xs text-gray-500 font-mono items-end pb-2">
                                                {metricsData.filter((_, i) => i % Math.ceil(metricsData.length / 10) === 0).map((point, index) => (
                                                  <div key={index}>{point.time}</div>
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Player Selection */}
                                          <div className="relative z-10">
                                            <h4 className="text-sm font-bold text-cyan-400 font-mono uppercase mb-3">Select Players</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                              {/* Blue Team */}
                                              <div className="space-y-2">
                                                <div className="text-xs font-mono text-[#5383E8]/60 tracking-wider mb-2">BLUE TEAM</div>
                                                {match.info.participants
                                                  .filter(p => p.teamId === 100)
                                                  .map((participant) => {
                                                    const isSelected = currentSelectedPlayers.has(participant.participantId);
                                                    const color = getParticipantColor(participant.participantId);
                                                    return (
                                                      <button
                                                        key={participant.participantId}
                                                        onClick={() => togglePlayer(participant.participantId)}
                                                        className={`w-full flex items-center space-x-3 p-2 border transition-all ${
                                                          isSelected
                                                            ? 'bg-cyan-400/10 border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                                                            : 'bg-[#0a1628]/30 border-cyan-400/20 hover:border-cyan-400/40'
                                                        }`}
                                                      >
                                                        <div className="w-8 h-8 overflow-hidden border border-cyan-400/30">
                                                          <Image
                                                            src={getChampionImageUrl(participant.championId)}
                                                            alt={participant.championName}
                                                            width={32}
                                                            height={32}
                                                            className="w-full h-full object-cover"
                                                          />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                          <div className="text-sm font-mono text-white">{participant.riotIdGameName || "Player"}</div>
                                                        </div>
                                                        {isSelected && (
                                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
                                                        )}
                                                      </button>
                                                    );
                                                  })}
                                              </div>
                                              
                                              {/* Red Team */}
                                              <div className="space-y-2">
                                                <div className="text-xs font-mono text-[#E84057]/60 tracking-wider mb-2">RED TEAM</div>
                                                {match.info.participants
                                                  .filter(p => p.teamId === 200)
                                                  .map((participant) => {
                                                    const isSelected = currentSelectedPlayers.has(participant.participantId);
                                                    const color = getParticipantColor(participant.participantId);
                                                    return (
                                                      <button
                                                        key={participant.participantId}
                                                        onClick={() => togglePlayer(participant.participantId)}
                                                        className={`w-full flex items-center space-x-3 p-2 border transition-all ${
                                                          isSelected
                                                            ? 'bg-cyan-400/10 border-cyan-400/50 shadow-[0_0_10px_rgba(0,255,255,0.2)]'
                                                            : 'bg-[#0a1628]/30 border-cyan-400/20 hover:border-cyan-400/40'
                                                        }`}
                                                      >
                                                        <div className="w-8 h-8 overflow-hidden border border-cyan-400/30">
                                                          <Image
                                                            src={getChampionImageUrl(participant.championId)}
                                                            alt={participant.championName}
                                                            width={32}
                                                            height={32}
                                                            className="w-full h-full object-cover"
                                                          />
                                                        </div>
                                                        <div className="flex-1 text-left">
                                                          <div className="text-sm font-mono text-white">{participant.riotIdGameName || "Player"}</div>
                                                        </div>
                                                        {isSelected && (
                                                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}></div>
                                                        )}
                                                      </button>
                                                    );
                                                  })}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()
                                  ) : (
                                    <div className="flex items-center justify-center py-20 text-gray-500">
                                      <p>Loading metrics data...</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* AI Coaching Tab Content */}
                              {activeTab[match.metadata.matchId] === 'ai-coaching' && (
                                <div className="space-y-6">
                                  {loadingCoaching[match.metadata.matchId] ? (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                      <div className="relative">
                                        <Loader2 className="w-12 h-12 text-purple-400 animate-spin drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                                        <div className="absolute inset-0 bg-purple-400/20 blur-xl animate-pulse"></div>
                                      </div>
                                      <p className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">AI Coach analyzing your performance...</p>
                                      <p className="text-sm text-purple-400 font-mono">Reviewing stats, items, and decision-making</p>
                                    </div>
                                  ) : matchCoaching[match.metadata.matchId] ? (
                                    <div className="space-y-6">
                                      {/* Header with Champion */}
                                      <div className="relative bg-gradient-to-br from-purple-900/30 via-indigo-900/30 to-purple-900/30 border-2 border-purple-400/40 p-6 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                                        <div className="flex items-center space-x-6">
                                          {/* Champion Portrait */}
                                          <div className="relative group">
                                            <div className="absolute inset-0 bg-purple-400/30 blur-xl group-hover:bg-purple-400/50 transition-all"></div>
                                            <div className="relative w-24 h-24 border-4 border-purple-400/60 overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.6)]">
                                              {/* eslint-disable-next-line @next/next/no-img-element */}
                                              <img
                                                src={getChampionImageUrl(matchCoaching[match.metadata.matchId].championId)}
                                                alt={matchCoaching[match.metadata.matchId].championName}
                                                className="w-full h-full object-cover"
                                                crossOrigin="anonymous"
                                              />
                                            </div>
                                          </div>
                                          
                                          {/* Match Info */}
                                          <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                              <h3 className="text-2xl font-bold text-white font-mono">{matchCoaching[match.metadata.matchId].championName}</h3>
                                              <span className="px-3 py-1 bg-purple-400/20 border border-purple-400/40 text-purple-300 text-sm font-mono uppercase">{matchCoaching[match.metadata.matchId].role}</span>
                                              <span className={`px-3 py-1 font-bold text-sm font-mono ${matchCoaching[match.metadata.matchId].matchData.win ? 'bg-green-400/20 border border-green-400/40 text-green-300' : 'bg-red-400/20 border border-red-400/40 text-red-300'}`}>
                                                {matchCoaching[match.metadata.matchId].matchData.win ? 'VICTORY' : 'DEFEAT'}
                                              </span>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-400 font-mono">
                                              <span>{matchCoaching[match.metadata.matchId].matchData.gameMode}</span>
                                              <span>•</span>
                                              <span>{Math.floor(matchCoaching[match.metadata.matchId].matchData.gameDuration / 60)}m {matchCoaching[match.metadata.matchId].matchData.gameDuration % 60}s</span>
                                              <span>•</span>
                                              <span className="text-cyan-400">{matchCoaching[match.metadata.matchId].matchData.kda} KDA</span>
                                            </div>
                                            
                                            {/* Quick Stats Bar */}
                                            <div className="grid grid-cols-4 gap-3 mt-3">
                                              <div className="bg-[#0a1628]/60 border border-cyan-400/20 px-3 py-2">
                                                <div className="text-xs text-gray-400 uppercase font-mono">KDA</div>
                                                <div className="text-lg font-bold text-cyan-400 font-mono">{matchCoaching[match.metadata.matchId].matchData.kills}/{matchCoaching[match.metadata.matchId].matchData.deaths}/{matchCoaching[match.metadata.matchId].matchData.assists}</div>
                                              </div>
                                              <div className="bg-[#0a1628]/60 border border-yellow-400/20 px-3 py-2">
                                                <div className="text-xs text-gray-400 uppercase font-mono">CS</div>
                                                <div className="text-lg font-bold text-yellow-400 font-mono">{matchCoaching[match.metadata.matchId].matchData.totalMinionsKilled + matchCoaching[match.metadata.matchId].matchData.neutralMinionsKilled}</div>
                                              </div>
                                              <div className="bg-[#0a1628]/60 border border-green-400/20 px-3 py-2">
                                                <div className="text-xs text-gray-400 uppercase font-mono">Vision</div>
                                                <div className="text-lg font-bold text-green-400 font-mono">{matchCoaching[match.metadata.matchId].matchData.visionScore}</div>
                                              </div>
                                              <div className="bg-[#0a1628]/60 border border-purple-400/20 px-3 py-2">
                                                <div className="text-xs text-gray-400 uppercase font-mono">Damage</div>
                                                <div className="text-lg font-bold text-purple-400 font-mono">{(matchCoaching[match.metadata.matchId].matchData.totalDamageDealtToChampions / 1000).toFixed(1)}k</div>
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {/* Items Display */}
                                          <div className="flex flex-col items-end space-y-2">
                                            <div className="text-xs text-gray-400 uppercase font-mono mb-1">Final Build</div>
                                            <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                                              {matchCoaching[match.metadata.matchId].matchData.items.map((itemId: number, idx: number) => (
                                                <div key={idx} className="relative w-10 h-10 border-2 border-yellow-400/40 bg-[#0a1628] overflow-hidden shadow-[0_0_8px_rgba(250,204,21,0.3)]">
                                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                                  <img
                                                    src={`https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/item/${itemId}.png`}
                                                    alt={`Item ${itemId}`}
                                                    className="w-full h-full object-cover"
                                                    crossOrigin="anonymous"
                                                  />
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Overall Performance */}
                                      <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-400/40 p-6 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-400/60"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400/60"></div>
                                        
                                        <h3 className="text-lg font-bold text-purple-400 mb-3 font-mono uppercase tracking-wider flex items-center space-x-2">
                                          <Sparkles className="w-5 h-5" />
                                          <span>Coach's Assessment</span>
                                        </h3>
                                        <p className="text-white/90 font-mono leading-relaxed text-base">{matchCoaching[match.metadata.matchId].coaching.overallPerformance}</p>
                                      </div>

                                      {/* Strengths & Weaknesses Grid */}
                                      <div className="grid grid-cols-2 gap-6">
                                        {/* Strengths */}
                                        <div className="relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400/60"></div>
                                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-green-400 mb-4 font-mono uppercase flex items-center space-x-2">
                                            <Trophy className="w-5 h-5" />
                                            <span>What You Did Well</span>
                                          </h3>
                                          <div className="space-y-2">
                                            {matchCoaching[match.metadata.matchId].coaching.strengths.map((strength: string, idx: number) => (
                                              <div key={idx} className="flex items-start space-x-2 bg-green-400/10 border border-green-400/30 px-3 py-2">
                                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <span className="text-white/90 text-sm font-mono">{strength}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>

                                        {/* Weaknesses */}
                                        <div className="relative bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400/60"></div>
                                          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-red-400 mb-4 font-mono uppercase flex items-center space-x-2">
                                            <Target className="w-5 h-5" />
                                            <span>Room for Growth</span>
                                          </h3>
                                          <div className="space-y-2">
                                            {matchCoaching[match.metadata.matchId].coaching.weaknesses.map((weakness: string, idx: number) => (
                                              <div key={idx} className="flex items-start space-x-2 bg-red-400/10 border border-red-400/30 px-3 py-2">
                                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                                <span className="text-white/90 text-sm font-mono">{weakness}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Detailed Analysis */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[#0a1628]/60 border border-cyan-400/20 p-4">
                                          <h4 className="text-cyan-400 font-mono font-bold mb-2 uppercase text-sm flex items-center space-x-2">
                                            <span>💰</span>
                                            <span>Gold Management</span>
                                          </h4>
                                          <p className="text-white/80 text-sm font-mono leading-relaxed">{matchCoaching[match.metadata.matchId].coaching.itemBuildAnalysis}</p>
                                        </div>
                                        <div className="bg-[#0a1628]/60 border border-cyan-400/20 p-4">
                                          <h4 className="text-cyan-400 font-mono font-bold mb-2 uppercase text-sm flex items-center space-x-2">
                                            <span>👁️</span>
                                            <span>Vision Game</span>
                                          </h4>
                                          <p className="text-white/80 text-sm font-mono leading-relaxed">{matchCoaching[match.metadata.matchId].coaching.visionControl}</p>
                                        </div>
                                        <div className="bg-[#0a1628]/60 border border-cyan-400/20 p-4">
                                          <h4 className="text-cyan-400 font-mono font-bold mb-2 uppercase text-sm flex items-center space-x-2">
                                            <span>🌾</span>
                                            <span>Farming</span>
                                          </h4>
                                          <p className="text-white/80 text-sm font-mono leading-relaxed">{matchCoaching[match.metadata.matchId].coaching.farmingEfficiency}</p>
                                        </div>
                                        <div className="bg-[#0a1628]/60 border border-cyan-400/20 p-4">
                                          <h4 className="text-cyan-400 font-mono font-bold mb-2 uppercase text-sm flex items-center space-x-2">
                                            <span>⚔️</span>
                                            <span>Fighting</span>
                                          </h4>
                                          <p className="text-white/80 text-sm font-mono leading-relaxed">{matchCoaching[match.metadata.matchId].coaching.fightingStyle}</p>
                                        </div>
                                      </div>

                                      {/* New Detailed Assessments */}
                                      {matchCoaching[match.metadata.matchId].coaching.buildAssessment && (
                                        <div className="relative bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-yellow-400/60"></div>
                                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-yellow-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-yellow-400 mb-4 font-mono uppercase tracking-wider flex items-center space-x-2">
                                            <span>🛠️</span>
                                            <span>Build Assessment</span>
                                          </h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#0a1628]/60 border border-yellow-400/20 p-3">
                                              <h5 className="text-yellow-300 font-mono text-xs uppercase mb-2">Early Game (0-10min)</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.buildAssessment.earlyGame}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-yellow-400/20 p-3">
                                              <h5 className="text-yellow-300 font-mono text-xs uppercase mb-2">Mid Game (10-20min)</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.buildAssessment.midGame}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-yellow-400/20 p-3">
                                              <h5 className="text-yellow-300 font-mono text-xs uppercase mb-2">Late Game (20+min)</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.buildAssessment.lateGame}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-yellow-400/20 p-3">
                                              <h5 className="text-yellow-300 font-mono text-xs uppercase mb-2">Item Timings</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.buildAssessment.itemTimings}</p>
                                            </div>
                                          </div>
                                          <div className="mt-3 bg-yellow-400/10 border border-yellow-400/30 p-3">
                                            <p className="text-white/90 font-mono text-sm">{matchCoaching[match.metadata.matchId].coaching.buildAssessment.overall}</p>
                                          </div>
                                        </div>
                                      )}

                                      {matchCoaching[match.metadata.matchId].coaching.tacticalAssessment && (
                                        <div className="relative bg-gradient-to-br from-blue-900/20 to-indigo-900/20 border-2 border-blue-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400/60"></div>
                                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-blue-400 mb-4 font-mono uppercase tracking-wider flex items-center space-x-2">
                                            <span>⚔️</span>
                                            <span>Tactical Assessment</span>
                                          </h3>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-[#0a1628]/60 border border-blue-400/20 p-3">
                                              <h5 className="text-blue-300 font-mono text-xs uppercase mb-2">Laning Phase</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.tacticalAssessment.laning}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-blue-400/20 p-3">
                                              <h5 className="text-blue-300 font-mono text-xs uppercase mb-2">Teamfighting</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.tacticalAssessment.teamfighting}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-blue-400/20 p-3">
                                              <h5 className="text-blue-300 font-mono text-xs uppercase mb-2">Objective Control</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.tacticalAssessment.objectiveControl}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-blue-400/20 p-3">
                                              <h5 className="text-blue-300 font-mono text-xs uppercase mb-2">Map Awareness</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.tacticalAssessment.mapAwareness}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {matchCoaching[match.metadata.matchId].coaching.skillAssessment && (
                                        <div className="relative bg-gradient-to-br from-purple-900/20 to-fuchsia-900/20 border-2 border-purple-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-purple-400/60"></div>
                                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-purple-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-purple-400 mb-4 font-mono uppercase tracking-wider flex items-center space-x-2">
                                            <span>🎯</span>
                                            <span>Skill Assessment</span>
                                          </h3>
                                          <div className="space-y-3">
                                            <div className="bg-[#0a1628]/60 border border-purple-400/20 p-3">
                                              <h5 className="text-purple-300 font-mono text-xs uppercase mb-2">Mechanics</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.skillAssessment.mechanics}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-purple-400/20 p-3">
                                              <h5 className="text-purple-300 font-mono text-xs uppercase mb-2">Decision Making</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.skillAssessment.decisionMaking}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-purple-400/20 p-3">
                                              <h5 className="text-purple-300 font-mono text-xs uppercase mb-2">Adaptability</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.skillAssessment.adaptability}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {matchCoaching[match.metadata.matchId].coaching.strategicAssessment && (
                                        <div className="relative bg-gradient-to-br from-pink-900/20 to-rose-900/20 border-2 border-pink-400/30 p-6 overflow-hidden">
                                          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pink-400/60"></div>
                                          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pink-400/60"></div>
                                          
                                          <h3 className="text-lg font-bold text-pink-400 mb-4 font-mono uppercase tracking-wider flex items-center space-x-2">
                                            <span>🧠</span>
                                            <span>Strategic Assessment</span>
                                          </h3>
                                          <div className="space-y-3">
                                            <div className="bg-[#0a1628]/60 border border-pink-400/20 p-3">
                                              <h5 className="text-pink-300 font-mono text-xs uppercase mb-2">Game Plan</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.strategicAssessment.gamePlan}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-pink-400/20 p-3">
                                              <h5 className="text-pink-300 font-mono text-xs uppercase mb-2">Tempo Control</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.strategicAssessment.tempo}</p>
                                            </div>
                                            <div className="bg-[#0a1628]/60 border border-pink-400/20 p-3">
                                              <h5 className="text-pink-300 font-mono text-xs uppercase mb-2">Win Conditions</h5>
                                              <p className="text-white/80 text-sm font-mono">{matchCoaching[match.metadata.matchId].coaching.strategicAssessment.winConditions}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Recommendations */}
                                      <div className="relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-400/30 p-6 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60"></div>
                                        
                                        <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase tracking-wider flex items-center space-x-2">
                                          <Lightbulb className="w-5 h-5" />
                                          <span>Your Action Plan</span>
                                        </h3>
                                        <div className="space-y-3">
                                          {matchCoaching[match.metadata.matchId].coaching.recommendations.map((rec: string, idx: number) => (
                                            <div key={idx} className="flex items-start space-x-3 bg-cyan-400/5 border-l-2 border-cyan-400/50 px-4 py-3">
                                              <div className="text-cyan-400 font-bold font-mono text-lg mt-0.5">{idx + 1}.</div>
                                              <span className="text-white/90 font-mono">{rec}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Key Takeaways */}
                                      <div className="relative bg-gradient-to-br from-yellow-900/20 to-amber-900/20 border-2 border-yellow-400/30 p-6 overflow-hidden">
                                        <h3 className="text-lg font-bold text-yellow-400 mb-3 font-mono uppercase tracking-wider">Remember This</h3>
                                        <div className="space-y-2">
                                          {matchCoaching[match.metadata.matchId].coaching.keyTakeaways.map((takeaway: string, idx: number) => (
                                            <div key={idx} className="flex items-center space-x-2 text-yellow-400/90 font-mono text-sm">
                                              <span>⚡</span>
                                              <span>{takeaway}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                      <Sparkles className="w-12 h-12 text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                                      <p className="text-white font-mono">Click the AI Coach tab to get personalized insights!</p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
                )}
              </div>
            )}

            {/* Load More Button */}
            {getCurrentAccount() && matches.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center pt-4"
              >
                <button
                  onClick={loadMoreMatches}
                  disabled={loadingMore || loadMoreCooldown > 0}
                  className="relative bg-gradient-to-r from-[#0a1628] to-[#1a2f4a] hover:from-[#1a2f4a] hover:to-[#0a1628] border-2 border-cyan-400/30 hover:border-cyan-400/50 text-cyan-400 px-8 py-3 rounded-none font-bold font-mono uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)] overflow-hidden group"
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                  
                  {/* Scan line effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {loadingMore ? (
                    <div className="flex items-center space-x-2 relative z-10">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : loadMoreCooldown > 0 ? (
                    <span className="relative z-10">Wait {loadMoreCooldown}s</span>
                  ) : (
                    <span className="relative z-10">Load 10 More</span>
                  )}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights Modal */}
      <AnimatePresence>
        {showAIInsights && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAIInsights(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[75] flex items-center justify-center p-4"
            >
              <div 
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-[#0a1628] via-[#0f1f3a] to-[#0a1628] border-2 border-cyan-400/30 shadow-[0_0_50px_rgba(0,255,255,0.3)] overflow-hidden"
              >
                {/* Tech lines */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-[#5383E8] to-transparent shadow-[0_0_10px_#5383E8]"></div>
                
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/40"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-400/40"></div>
                
                {/* Header */}
                <div className="sticky top-0 z-10 bg-gradient-to-r from-[#0a1628]/95 via-[#0f1f3a]/95 to-[#0a1628]/95 backdrop-blur-sm border-b border-cyan-400/20 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Sparkles className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl"></div>
                      </div>
                      <h2 className="text-2xl font-bold text-white font-mono uppercase tracking-wider drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                        Season Rewind
                      </h2>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Download Button */}
                      {aiInsights && (
                        <button
                          onClick={downloadInsightsImage}
                          className="relative group p-2 border border-green-400/30 hover:border-green-400/60 bg-[#0a1628] hover:bg-[#1a2f4a] transition-all"
                          title="Download as Image"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-green-400"></div>
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-green-400"></div>
                          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-green-400"></div>
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-green-400"></div>
                          
                          <Download className="w-5 h-5 text-green-400 group-hover:text-white transition-colors" />
                        </button>
                      )}
                      
                      {/* Share Button */}
                      {aiInsights && (
                        <button
                          onClick={shareInsights}
                          className="relative group p-2 border border-purple-400/30 hover:border-purple-400/60 bg-[#0a1628] hover:bg-[#1a2f4a] transition-all"
                          title="Share with Friends"
                        >
                          <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-purple-400"></div>
                          <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-purple-400"></div>
                          <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-purple-400"></div>
                          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-purple-400"></div>
                          
                          <Share2 className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                        </button>
                      )}
                      
                      {/* Close Button */}
                      <button
                        onClick={() => setShowAIInsights(false)}
                        className="relative group p-2 border border-cyan-400/30 hover:border-cyan-400/60 bg-[#0a1628] hover:bg-[#1a2f4a] transition-all"
                      >
                        {/* Corner accents */}
                        <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-cyan-400"></div>
                        <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-400"></div>
                        <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-400"></div>
                        <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-cyan-400"></div>
                        
                        <X className="w-5 h-5 text-cyan-400 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Summoner Info */}
                  {getCurrentAccount() && (
                    <div className="flex items-center space-x-3 mt-4 relative">
                      <div className="relative w-12 h-12 overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                        <Image
                          src={getProfileIconUrl(getCurrentAccount()!.profileIconId)}
                          alt="Profile Icon"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white font-mono">
                          {getCurrentAccount()!.gameName}
                          <span className="text-gray-500">#{getCurrentAccount()!.tagLine}</span>
                        </div>
                        <div className="text-sm text-cyan-400 font-mono">
                          {matches.length} matches analyzed
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div id="ai-insights-content" className="p-6 space-y-6 bg-[#0a0f1a]">
                  {loadingInsights ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <Loader2 className="w-12 h-12 text-cyan-400 animate-spin drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl animate-pulse"></div>
                      </div>
                      <p className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Analyzing your journey...</p>
                      <p className="text-sm text-cyan-400 font-mono">Crunching match data with AI magic</p>
                      {matches.length > 50 && (
                        <p className="text-xs text-yellow-400 font-mono max-w-md text-center">
                          Large dataset detected ({matches.length} matches). AI processing may take a moment...
                        </p>
                      )}
                    </div>
                  ) : aiInsights ? (
                    <div className="space-y-6">
                      {/* Hero Stats - Big Visual Impact */}
                      <div className="grid grid-cols-3 gap-4">
                        {/* Total Games */}
                        <div className="relative bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border-2 border-cyan-400/40 p-6 text-center overflow-hidden group hover:border-cyan-400/60 transition-all">
                          <div className="absolute inset-0 bg-cyan-400/5 group-hover:bg-cyan-400/10 transition-all"></div>
                          <div className="relative z-10">
                            <div className="text-6xl font-bold text-cyan-400 font-mono drop-shadow-[0_0_15px_rgba(0,255,255,0.8)] mb-2">
                              {aiInsights.stats.totalGames}
                            </div>
                            <div className="text-sm text-gray-300 uppercase font-mono tracking-wider">Total Games</div>
                          </div>
                        </div>

                        {/* Win Rate */}
                        <div className="relative bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-400/40 p-6 text-center overflow-hidden group hover:border-green-400/60 transition-all">
                          <div className="absolute inset-0 bg-green-400/5 group-hover:bg-green-400/10 transition-all"></div>
                          <div className="relative z-10">
                            <div className="text-6xl font-bold text-green-400 font-mono drop-shadow-[0_0_15px_rgba(34,197,94,0.8)] mb-2">
                              {aiInsights.stats.winRate}%
                            </div>
                            <div className="text-sm text-gray-300 uppercase font-mono tracking-wider">Win Rate</div>
                            <div className="text-xs text-gray-400 font-mono mt-1">{aiInsights.stats.wins}W - {aiInsights.stats.losses}L</div>
                          </div>
                        </div>

                        {/* KDA */}
                        <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-400/40 p-6 text-center overflow-hidden group hover:border-purple-400/60 transition-all">
                          <div className="absolute inset-0 bg-purple-400/5 group-hover:bg-purple-400/10 transition-all"></div>
                          <div className="relative z-10">
                            <div className="text-6xl font-bold text-purple-400 font-mono drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] mb-2">
                              {aiInsights.stats.avgKDA}
                            </div>
                            <div className="text-sm text-gray-300 uppercase font-mono tracking-wider">Avg K/D/A</div>
                            <div className="text-xs text-gray-400 font-mono mt-1">{aiInsights.stats.avgKills}/{aiInsights.stats.avgDeaths}/{aiInsights.stats.avgAssists}</div>
                          </div>
                        </div>
                      </div>

                      {/* AI Tagline - Short & Punchy */}
                      {aiInsights.summary && (
                        <div className="relative bg-gradient-to-r from-cyan-400/10 via-purple-400/10 to-cyan-400/10 border border-cyan-400/30 p-4 overflow-hidden">
                          <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
                          
                          <p className="text-center text-white/90 font-mono text-base leading-relaxed">
                            {aiInsights.summary}
                          </p>
                        </div>
                      )}

                      {/* Secondary Stats - Compact Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Damage */}
                        <div className="relative bg-[#0a1628]/60 border border-red-400/30 p-3 text-center hover:border-red-400/50 transition-all">
                          <div className="text-3xl font-bold text-red-400 font-mono mb-1">
                            {aiInsights.stats.avgDamage?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 uppercase font-mono">Avg Damage</div>
                        </div>

                        {/* Gold */}
                        <div className="relative bg-[#0a1628]/60 border border-yellow-400/30 p-3 text-center hover:border-yellow-400/50 transition-all">
                          <div className="text-3xl font-bold text-yellow-400 font-mono mb-1">
                            {aiInsights.stats.avgGold?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400 uppercase font-mono">Avg Gold</div>
                        </div>

                        {/* CS */}
                        <div className="relative bg-[#0a1628]/60 border border-green-400/30 p-3 text-center hover:border-green-400/50 transition-all">
                          <div className="text-3xl font-bold text-green-400 font-mono mb-1">
                            {aiInsights.stats.avgCS}
                          </div>
                          <div className="text-xs text-gray-400 uppercase font-mono">Avg CS</div>
                        </div>

                        {/* Favorite Role */}
                        <div className="relative bg-[#0a1628]/60 border border-cyan-400/30 p-3 text-center hover:border-cyan-400/50 transition-all">
                          <div className="text-2xl font-bold text-cyan-400 font-mono mb-1 uppercase">
                            {aiInsights.stats.favoriteRole}
                          </div>
                          <div className="text-xs text-gray-400 uppercase font-mono">Favorite Role</div>
                        </div>
                      </div>

                      {/* Epic Moments - Multikills & Streaks */}
                      {aiInsights.stats && (aiInsights.stats.multikills?.penta > 0 || aiInsights.stats.longestWinStreak >= 5 || aiInsights.stats.multikills?.quadra > 0) && (
                        <div className="relative bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f1f3a] border-2 border-yellow-400/40 p-6 overflow-hidden shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                          <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-yellow-400/60"></div>
                          <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-yellow-400/60"></div>
                          
                          <h3 className="text-lg font-bold text-yellow-400 mb-4 font-mono uppercase tracking-wider drop-shadow-[0_0_10px_rgba(250,204,21,0.8)] flex items-center space-x-2">
                            <Sparkles className="w-6 h-6" />
                            <span>Epic Moments</span>
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {aiInsights.stats.multikills?.penta > 0 && (
                              <div className="bg-[#0a1628]/80 border-2 border-yellow-400/50 p-4 text-center">
                                <div className="text-4xl font-bold text-yellow-400 font-mono drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                                  {aiInsights.stats.multikills.penta}
                                </div>
                                <div className="text-sm text-yellow-400/80 font-mono uppercase mt-2">Pentakill{aiInsights.stats.multikills.penta > 1 ? 's' : ''}</div>
                                <div className="text-xs text-gray-400 font-mono mt-1">Legendary!</div>
                              </div>
                            )}
                            
                            {aiInsights.stats.multikills?.quadra > 0 && (
                              <div className="bg-[#0a1628]/80 border border-purple-400/50 p-4 text-center">
                                <div className="text-4xl font-bold text-purple-400 font-mono">
                                  {aiInsights.stats.multikills.quadra}
                                </div>
                                <div className="text-sm text-purple-400/80 font-mono uppercase mt-2">Quadrakill{aiInsights.stats.multikills.quadra > 1 ? 's' : ''}</div>
                              </div>
                            )}
                            
                            {aiInsights.stats.longestWinStreak >= 5 && (
                              <div className="bg-[#0a1628]/80 border border-green-400/50 p-4 text-center">
                                <div className="text-4xl font-bold text-green-400 font-mono">
                                  {aiInsights.stats.longestWinStreak}
                                </div>
                                <div className="text-sm text-green-400/80 font-mono uppercase mt-2">Win Streak</div>
                                <div className="text-xs text-gray-400 font-mono mt-1">On Fire!</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Top Champions */}
                      {aiInsights.topChampions && (
                        <div>
                          <h3 className="text-lg font-bold text-cyan-400 mb-4 font-mono uppercase tracking-wider drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]">
                            Your Legends
                          </h3>
                          <div className="grid grid-cols-3 gap-6">
                            {aiInsights.topChampions.map((champ: any, idx: number) => (
                              <div key={idx} className="relative bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 border-2 border-cyan-400/30 p-6 overflow-hidden hover:border-cyan-400/60 transition-all group shadow-[0_0_15px_rgba(0,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,255,255,0.4)]">
                                {/* Corner brackets */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                                
                                {/* Large champion image */}
                                <div className="relative w-24 h-24 mx-auto mb-4 border-2 border-cyan-400/50 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.3)] group-hover:scale-110 transition-transform">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={`https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/champion/${champ.name}.png`}
                                    alt={champ.name}
                                    className="w-full h-full object-cover"
                                    crossOrigin="anonymous"
                                  />
                                </div>
                                
                                <div className="text-white font-bold font-mono text-center text-lg mb-2">{champ.name}</div>
                                
                                {/* Visual win rate bar */}
                                <div className="mb-3">
                                  <div className="flex justify-between text-xs font-mono mb-1">
                                    <span className="text-gray-400">{champ.games} games</span>
                                    <span className={`font-bold ${champ.winRate >= 55 ? 'text-green-400' : champ.winRate >= 45 ? 'text-yellow-400' : 'text-red-400'}`}>
                                      {champ.winRate}%
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-700/50 overflow-hidden">
                                    <div 
                                      className={`h-full transition-all ${champ.winRate >= 55 ? 'bg-gradient-to-r from-green-500 to-green-400' : champ.winRate >= 45 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                                      style={{ width: `${champ.winRate}%` }}
                                    />
                                  </div>
                                </div>
                                
                                {/* KDA badge */}
                                <div className="text-center">
                                  <span className="inline-block px-3 py-1 bg-cyan-400/20 border border-cyan-400/40 text-cyan-400 text-xs font-mono font-bold">
                                    {champ.avgKDA} KDA
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Best & Worst Teammates */}
                      <div className="grid grid-cols-2 gap-6">
                        {/* Best Teammates - Highest Win Rate */}
                        {aiInsights.bestTeammates && aiInsights.bestTeammates.length > 0 && (
                          <div className="relative bg-gradient-to-br from-[#0a1628] to-[#0f1f3a] border-2 border-green-400/30 p-6 overflow-hidden shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400/60"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400/60"></div>
                            
                            <h3 className="text-lg font-bold text-green-400 mb-4 font-mono uppercase tracking-wider drop-shadow-[0_0_8px_rgba(74,222,128,0.6)] flex items-center space-x-2">
                              <Users className="w-5 h-5" />
                              <span>Victory Squad</span>
                            </h3>
                            <p className="text-xs text-green-400/70 mb-3 font-mono">Highest win rate together (5+ games)</p>
                            <div className="space-y-3">
                              {aiInsights.bestTeammates.slice(0, 3).map((teammate: any, idx: number) => (
                                <div key={idx} className="bg-[#0a1628]/60 border border-green-400/20 p-4 hover:border-green-400/40 transition-colors">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="relative w-12 h-12 border-2 border-green-400/50 overflow-hidden shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={teammate.profileIconId ? `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${teammate.profileIconId}.png` : '/default-icon.png'}
                                        alt={teammate.gameName}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          img.src = `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/29.png`;
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-bold font-mono truncate">
                                        {teammate.gameName}
                                        <span className="text-gray-500 text-sm">#{teammate.tagLine}</span>
                                      </div>
                                      <div className="text-xs text-gray-400 font-mono">
                                        {teammate.gamesPlayed} games • {teammate.wins}W-{teammate.losses}L
                                      </div>
                                    </div>
                                  </div>
                                  {/* Win rate progress bar */}
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 h-3 bg-gray-700/50 overflow-hidden border border-green-400/20">
                                      <div 
                                        className="h-full bg-gradient-to-r from-green-600 to-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]"
                                        style={{ width: `${teammate.winRate}%` }}
                                      />
                                    </div>
                                    <span className="text-green-400 font-mono font-bold text-sm min-w-[45px] text-right">
                                      {teammate.winRate}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Worst Teammates - Lowest Win Rate */}
                        {aiInsights.worstTeammates && aiInsights.worstTeammates.length > 0 && (
                          <div className="relative bg-gradient-to-br from-[#0a1628] to-[#0f1f3a] border-2 border-red-400/30 p-6 overflow-hidden shadow-[0_0_20px_rgba(248,113,113,0.2)]">
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-400/60"></div>
                            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-400/60"></div>
                            
                            <h3 className="text-lg font-bold text-red-400 mb-4 font-mono uppercase tracking-wider drop-shadow-[0_0_8px_rgba(248,113,113,0.6)] flex items-center space-x-2">
                              <UserX className="w-5 h-5" />
                              <span>Cursed Comps</span>
                            </h3>
                            <p className="text-xs text-red-400/70 mb-3 font-mono">Lowest win rate together (5+ games)</p>
                            <div className="space-y-3">
                              {aiInsights.worstTeammates.slice(0, 3).map((teammate: any, idx: number) => (
                                <div key={idx} className="bg-[#0a1628]/60 border border-red-400/20 p-4 hover:border-red-400/40 transition-colors">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="relative w-12 h-12 border-2 border-red-400/50 overflow-hidden shadow-[0_0_10px_rgba(248,113,113,0.2)]">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={teammate.profileIconId ? `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/${teammate.profileIconId}.png` : '/default-icon.png'}
                                        alt={teammate.gameName}
                                        className="w-full h-full object-cover"
                                        crossOrigin="anonymous"
                                        onError={(e) => {
                                          const img = e.target as HTMLImageElement;
                                          img.src = `https://ddragon.leagueoflegends.com/cdn/${LOL_VERSION}/img/profileicon/29.png`;
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-white font-bold font-mono truncate">
                                        {teammate.gameName}
                                        <span className="text-gray-500 text-sm">#{teammate.tagLine}</span>
                                      </div>
                                      <div className="text-xs text-gray-400 font-mono">
                                        {teammate.gamesPlayed} games • {teammate.wins}W-{teammate.losses}L
                                      </div>
                                    </div>
                                  </div>
                                  {/* Win rate progress bar */}
                                  <div className="flex items-center space-x-2">
                                    <div className="flex-1 h-3 bg-gray-700/50 overflow-hidden border border-red-400/20">
                                      <div 
                                        className="h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_8px_rgba(248,113,113,0.4)]"
                                        style={{ width: `${teammate.winRate}%` }}
                                      />
                                    </div>
                                    <span className="text-red-400 font-mono font-bold text-sm min-w-[45px] text-right">
                                      {teammate.winRate}%
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-2 gap-6">
                        {aiInsights.strengths && (
                          <div className="relative bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 border-2 border-green-400/30 p-6 overflow-hidden shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green-400/60"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green-400/60"></div>
                            
                            <h3 className="text-lg font-bold text-green-400 mb-4 font-mono uppercase flex items-center space-x-2 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">
                              <Trophy className="w-5 h-5" />
                              <span>Strengths</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.strengths.map((strength: string, idx: number) => (
                                <div key={idx} className="inline-flex items-center space-x-2 bg-green-400/10 border border-green-400/40 px-3 py-2 hover:bg-green-400/20 hover:border-green-400/60 transition-all group">
                                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full shadow-[0_0_4px_rgba(74,222,128,0.8)] group-hover:shadow-[0_0_8px_rgba(74,222,128,1)]"></div>
                                  <span className="text-white/90 text-sm font-mono">{strength}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {aiInsights.weaknesses && (
                          <div className="relative bg-gradient-to-br from-[#0a1628]/90 to-[#0f1f3a]/90 border-2 border-red-400/30 p-6 overflow-hidden shadow-[0_0_15px_rgba(248,113,113,0.2)]">
                            {/* Corner brackets */}
                            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-400/60"></div>
                            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-400/60"></div>
                            
                            <h3 className="text-lg font-bold text-red-400 mb-4 font-mono uppercase flex items-center space-x-2 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)]">
                              <Target className="w-5 h-5" />
                              <span>Areas to Improve</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {aiInsights.weaknesses.map((weakness: string, idx: number) => (
                                <div key={idx} className="inline-flex items-center space-x-2 bg-red-400/10 border border-red-400/40 px-3 py-2 hover:bg-red-400/20 hover:border-red-400/60 transition-all group">
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full shadow-[0_0_4px_rgba(248,113,113,0.8)] group-hover:shadow-[0_0_8px_rgba(248,113,113,1)]"></div>
                                  <span className="text-white/90 text-sm font-mono">{weakness}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                      <div className="relative">
                        <Sparkles className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(0,255,255,0.8)]" />
                        <div className="absolute inset-0 bg-cyan-400/20 blur-xl"></div>
                      </div>
                      <p className="text-white font-mono drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">Ready to discover your story?</p>
                      <button
                        onClick={fetchAIInsights}
                        className="relative group bg-gradient-to-br from-[#0a1628] to-[#1a2f4a] hover:from-[#1a2f4a] hover:to-[#0a1628] border-2 border-cyan-400/30 hover:border-cyan-400/60 px-6 py-3 transition-all duration-300 overflow-hidden shadow-[0_0_20px_rgba(0,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,255,255,0.4)]"
                      >
                        {/* Corner brackets */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400 group-hover:w-4 group-hover:h-4 transition-all"></div>
                        
                        {/* Scan line */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        <span className="relative text-cyan-400 font-mono font-bold uppercase tracking-wider">
                          Generate Insights
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
