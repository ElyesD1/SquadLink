// SquadLink Backend API Service for LoL eSports
// Connects to our NestJS backend that serves real 2025 LoL eSports data

const API_BASE_URL = 'http://localhost:3001/riot-esports';

export interface League {
  id: string;
  name: string;
  slug: string;
  region: string;
}

export interface Tournament {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  leagueId: string;
  format: string;
  description?: string; // For backward compatibility
}

export interface Team {
  id: string;
  name: string;
  code: string;
  slug?: string;
  region?: string;
  league?: string;
  status?: string; // For backward compatibility
  logoUrl?: string;
  homeLeague?: {
    name: string;
    region: string;
  };
  roster?: {
    top: string;
    jungle: string;
    mid: string;
    adc: string;
    support: string;
    headCoach?: string;
    assistantCoach?: string;
    strategicCoach?: string;
  };
}

export interface Match {
  id: string;
  tournamentId: string;
  date: string;
  split?: string;
  teams: {
    name: string;
    code: string;
    id: string;
    result?: {
      gameWins: number;
      outcome: 'win' | 'loss';
    };
  }[];
  result: {
    winner: string;
    score: string;
  };
  state: string;
  type: string;
  startTime?: string;
  league?: {
    name: string;
    slug: string;
  };
  blockName?: string;
}

export interface Standing {
  id?: string; // For backward compatibility
  teamId: string;
  teamName: string;
  name?: string; // Alias for teamName
  code?: string; // Team code
  wins: number;
  losses: number;
  winRate: number;
  record?: {
    wins: number;
    losses: number;
  };
}

class RiotEsportsService {
  private async fetchAPI(endpoint: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API fetch error:', error);
      throw error;
    }
  }

  async getLeagues(): Promise<League[]> {
    return this.fetchAPI('/leagues');
  }

  async getTournaments(leagueId?: string): Promise<Tournament[]> {
    const endpoint = leagueId ? `/tournaments?leagueId=${leagueId}` : '/tournaments';
    return this.fetchAPI(endpoint);
  }

  // Alias for backward compatibility
  async getTournamentsForLeague(leagueId: string): Promise<Tournament[]> {
    return this.getTournaments(leagueId);
  }

  async getMatches(leagueId?: string): Promise<Match[]> {
    const endpoint = leagueId ? `/schedule?leagueId=${leagueId}` : '/schedule';
    const matches = await this.fetchAPI(endpoint);
    
    // Transform matches to add missing properties for frontend compatibility
    return matches.map((match: any) => ({
      ...match,
      startTime: match.date, // Use date as startTime for compatibility
      teams: match.teams.map((team: any, index: number) => ({
        ...team,
        result: this.getTeamResultFromMatch(match, team.name, index)
      })),
      league: leagueId ? { name: this.getLeagueName(leagueId), slug: leagueId } : undefined,
      blockName: match.type, // Use type as blockName
      split: match.split // Pass through split data from backend
    }));
  }

  // Helper method to extract team result from match result
  private getTeamResultFromMatch(match: any, teamName: string, teamIndex: number): any {
    if (!match.result || !match.result.score) return null;
    
    const [score1, score2] = match.result.score.split('-').map((s: string) => parseInt(s.trim()));
    const isWinner = match.result.winner === teamName;
    
    return {
      gameWins: teamIndex === 0 ? score1 : score2,
      outcome: isWinner ? 'win' : 'loss'
    };
  }

  // Helper method to get league name by ID
  private getLeagueName(leagueId: string): string {
    const leagueNames: { [key: string]: string } = {
      'lol-emea-championship': 'LoL EMEA Championship',
      'lol-champions-korea': 'LoL Champions Korea',
      'tencent-lol-pro-league': 'Tencent LoL Pro League',
      'league-of-legends-championship-of-the-americas': 'League of Legends Championship of The Americas'
    };
    return leagueNames[leagueId] || leagueId;
  }

  // Alias for backward compatibility
  async getSchedule(leagueId?: string): Promise<Match[]> {
    return this.getMatches(leagueId);
  }

  async getTeams(leagueId?: string): Promise<Team[]> {
    const endpoint = leagueId ? `/teams?leagueId=${leagueId}` : '/teams';
    const teams = await this.fetchAPI(endpoint);
    
    // Transform teams to add missing properties for frontend compatibility
    return teams.map((team: any) => ({
      ...team,
      status: 'active', // Default status
      homeLeague: {
        name: this.getLeagueName(team.league),
        region: team.region
      }
    }));
  }

  async getStandings(tournamentId: string): Promise<Standing[]> {
    const standings = await this.fetchAPI(`/standings/${tournamentId}`);
    
    // Transform standings to add missing properties for frontend compatibility
    return standings.map((standing: any) => ({
      ...standing,
      teamId: standing.id || standing.teamId,
      teamName: standing.name || standing.teamName || 'Unknown Team',
      teamCode: standing.code || standing.teamCode,
      wins: standing.record?.wins || standing.wins || 0,
      losses: standing.record?.losses || standing.losses || 0,
      winRate: standing.record?.wins && standing.record?.losses ? 
        standing.record.wins / (standing.record.wins + standing.record.losses) : 0
    }));
  }

  async getRegularSeasonStandings(leagueId?: string, year?: string, split?: string): Promise<any> {
    let endpoint = '/regular-standings';
    const params = new URLSearchParams();
    
    if (leagueId) params.append('leagueId', leagueId);
    if (year) params.append('year', year);
    if (split) params.append('split', split);
    
    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }
    
    return await this.fetchAPI(endpoint);
  }

  // Helper methods for filtering and formatting
  getRecentMatches(matches: Match[], limit: number = 10): Match[] {
    return matches
      .filter(match => match.state === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  getUpcomingMatches(matches: Match[], limit: number = 10): Match[] {
    return matches
      .filter(match => match.state === 'upcoming')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  formatMatchDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  formatMatchTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

// Team Logo URLs - Using local assets for LEC, fallback for other leagues
// Team Logo URLs - Using local assets for LEC, LTA, LCK, and LPL, fallback for other leagues
// Name to code mapping for standings data
export const getTeamCodeFromName = (teamName: string): string => {
  const nameToCodeMap: { [key: string]: string } = {
    // LEC Teams
    'Fnatic': 'FNC',
    'G2 Esports': 'G2',
    'Movistar KOI': 'KOI',
    'Karmine Corp': 'KC',
    'GIANTX': 'GX',
    'Team Vitality': 'VIT',
    'NAVI': 'NAVI',
    'SK Gaming': 'SK',
    'MAD Lions KOI': 'KOI',
    'Team BDS': 'BDS',
    
    // LTA Teams
    '100 Thieves': '100T',
    'Cloud9': 'C9',
    'Dignitas': 'DIG',
    'FlyQuest': 'FLY',
    'Shopify Rebellion': 'SR',
    'Team Liquid': 'TL',
    'paiN Gaming': 'PNG',
    'Isurus': 'ISU',
    'Disguised Toast': 'DT',
    'FURIA Esports': 'FUR',
    'Red Canids': 'RED',
    
    // LCK Teams  
    'T1': 'T1',
    'Gen.G': 'GEN',
    'DPlus KIA': 'DK',
    'Hanwha Life Esports': 'HLE',
    'KT Rolster': 'KT',
    'DRX': 'DRX',
    'Nongshim RedForce': 'NS',
    'FearX': 'BNK',
    'Dplus KIA': 'DK', // Alternative name
    'Kwangdong Freecs': 'KDF',
    'BRION': 'BRO',
    
    // LPL Teams
    "Anyone's Legend": 'AL',
    'Bilibili Gaming': 'BLG',
    'Edward Gaming': 'EDG',
    'FunPlus Phoenix': 'FPX',
    'Invictus Gaming': 'IG',
    'JD Gaming': 'JDG',
    'LGD Gaming': 'LGD',
    'LNG Esports': 'LNG',
    'Ninjas in Pyjamas': 'NIP',
    'Royal Never Give Up': 'RNG',
    'Team WE': 'WE',
    'ThunderTalk Gaming': 'TT',
    'Top Esports': 'TES',
    'Ultra Prime': 'UP',
    'Weibo Gaming': 'WBG',
    'Oh My God': 'OMG',
  };
  
  return nameToCodeMap[teamName] || teamName.substring(0, 3).toUpperCase();
};

export const getTeamLogoUrl = (teamId: string, teamCode: string): string => {
  // If teamCode is actually a team name (contains spaces or special chars), convert it
  let actualTeamCode = teamCode;
  if (teamCode.includes(' ') || teamCode.length > 4) {
    actualTeamCode = getTeamCodeFromName(teamCode);
  }
  
  // LEC Teams - Using local assets
  const lecLogoMap: { [key: string]: string } = {
    'FNC': '/fnatic.png',
    'G2': '/g2.png', 
    'KOI': '/MKOI.png',
    'KC': '/Karmine_Corp_logo.svg.png',
    'GX': '/GiantX.png',
    'VIT': '/Team_Vitality_logo.svg.png',
    'NAVI': '/NAVI-Logo.svg.png',
    'SK': '/SK_Gaming_logo.svg.png',
  };

  // LTA Teams - Using local assets
  const ltaLogoMap: { [key: string]: string } = {
    '100T': '/100_Thieves_logo.svg.png',
    'C9': '/Cloud9_logo_c._2023.svg.png',
    'DIG': '/Dignitas_logo.svg.png',
    'FLY': '/Flyquest_logo_2021.svg.png', // Fixed: was 'FQ', should be 'FLY'
    'SR': '/Shopify_Rebellion.svg.png',
    'TL': '/Team_Liquid_logo.svg.png',
    'PNG': '/PaiN_Gaming_logo.svg.png',
    'ISU': '/Isurus_Gaming_logo.png',
    // LYN, KS, RED don't have assets yet - will use fallback
  };

  // LCK Teams - Using local assets
  const lckLogoMap: { [key: string]: string } = {
    'T1': '/T1_logo.svg.png',
    'GEN': '/Gen.G_Logo.svg.png',
    'DK': '/DPlus_KIA_Logo.svg.png',
    'HLE': '/Hanwha_Life_Esports_logo.svg.png',
    'KT': '/KT_Rolster_logo.png',
    'DRX': '/DRX_logo_2023.png',
    'NS': '/Nongshim_RedForce_logo.png',
    'BNK': '/FearX_logo.png',
    // BRO and DN don't have assets yet - will use fallback
  };

  // LPL Teams - Using local assets
  const lplLogoMap: { [key: string]: string } = {
    'AL': '/Anyones_Legend_logo.png',
    'BLG': '/Bilibili_Gaming_logo_(2021).png',
    'EDG': '/Edward_Gaming_logo.png',
    'FPX': '/FPX_Esports_logo.svg.png',
    'IG': '/Invictus_Gaming_logo.png',
    'JDG': '/JD_Gaming_logo.png',
    'LGD': '/LGD_Gaming_logo.png',
    'LNG': '/LNG_Esports_logo.png',
    'NIP': '/Ninjas_in_Pyjamas_logo.svg.png',
    'RNG': '/RNG_logo.svg.png',
    'WE': '/Team_WE_logo.png',
    'TT': '/TT_(esports)_logo.png',
    'TES': '/Top_Esports_logo.png',
    'UP': '/Ultra_Prime_logo.png',
    'WBG': '/Weibo_Gaming_logo.png',
    // OMG doesn't have assets yet - will use fallback
  };

  // Check if it's an LEC team by code first
  if (lecLogoMap[actualTeamCode]) {
    return lecLogoMap[actualTeamCode];
  }

  // Check if it's an LTA team by code
  if (ltaLogoMap[actualTeamCode]) {
    return ltaLogoMap[actualTeamCode];
  }

  // Check if it's an LCK team by code
  if (lckLogoMap[actualTeamCode]) {
    return lckLogoMap[actualTeamCode];
  }

  // Check if it's an LPL team by code
  if (lplLogoMap[actualTeamCode]) {
    return lplLogoMap[actualTeamCode];
  }

  // For teams without logos, use placeholder
  return `https://ui-avatars.com/api/?name=${actualTeamCode}&size=72&background=6366f1&color=fff&format=png&rounded=true`;
};

export const riotEsportsService = new RiotEsportsService();