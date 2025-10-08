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
}

export interface Team {
  id: string;
  name: string;
  code: string;
  slug: string;
  region: string;
  league: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  date: string;
  teams: {
    name: string;
    code: string;
    id: string;
  }[];
  result: {
    winner: string;
    score: string;
  };
  state: string;
  type: string;
}

export interface Standing {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  winRate: number;
}
      gameWins: number;
    };
  }[];
  strategy: {
    type: string;
    count: number;
  };
  startTime: string;
  state: 'upcoming' | 'unstarted' | 'inProgress' | 'completed';
  type: string;
  blockName?: string;
  league: {
    name: string;
    slug: string;
  };
  tournament?: {
    id: string;
    slug: string;
  };
}

export interface Standing {
  id: string;
  slug: string;
  name: string;
  code: string;
  image?: string;
  record: {
    wins: number;
    losses: number;
    ties?: number;
  };
  ordinals: {
    [key: string]: number;
  };
}

export interface EventDetails {
  id: string;
  startTime: string;
  state: string;
  type: string;
  blockName?: string;
  league: {
    name: string;
    slug: string;
  };
  tournament?: {
    id: string;
    slug: string;
  };
  match: {
    id: string;
    flags?: string[];
    teams: Array<{
      id: string;
      name: string;
      code: string;
      image?: string;
      record?: {
        wins: number;
        losses: number;
      };
      result?: {
        outcome: 'win' | 'loss' | null;
        gameWins: number;
      };
    }>;
    strategy: {
      type: string;
      count: number;
    };
  };
  games?: Array<{
    id: string;
    state: string;
    number: number;
    vods?: Array<{
      id: string;
      parameter: string;
      locale: string;
      mediaLocale: {
        locale: string;
        englishName: string;
        translatedName: string;
      };
      provider: string;
      offset: number;
    }>;
  }>;
}

class RiotEsportsService {
  private baseUrl = 'http://localhost:3001/riot-esports'; // Our backend API
  private language = 'en-US';

  private async fetchFromBackend(endpoint: string): Promise<any> {
    console.log(`Fetching from backend: ${endpoint}`);
    
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Backend API URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Backend response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Backend API success, data:', data);
      return data;
    } catch (error) {
      console.error('Error fetching from backend API:', error);
      throw error;
    }
  }

  async getLeagues(): Promise<League[]> {
    try {
      const endpoint = `/leagues`;
      const data = await this.fetchFromBackend(endpoint);
      
      if (data?.data?.leagues) {
        return data.data.leagues.map((league: any) => ({
          id: league.id,
          name: league.name,
          slug: league.slug,
          region: league.region,
          image: league.image
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch leagues:', error);
      return [];
    }
  }

  async getSchedule(leagueId?: string): Promise<Match[]> {
    try {
      const endpoint = leagueId ? `/schedule?leagueId=${leagueId}` : `/schedule`;
      const data = await this.fetchFromBackend(endpoint);
      
      // Our backend returns an array directly, not nested in data.schedule.events
      if (Array.isArray(data)) {
        return data.map((event: any) => ({
          id: event.id,
          flags: event.flags || [],
          teams: event.teams || [],
          strategy: event.strategy || { type: 'bestOf', count: 1 },
          startTime: event.startTime,
          state: event.state,
          type: event.type,
          blockName: event.blockName,
          league: event.league,
          tournament: event.tournament
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch schedule for league ${leagueId}:`, error);
      return [];
    }
  }

  async getTournamentsForLeague(leagueId: string): Promise<Tournament[]> {
    try {
      const endpoint = `/tournaments/${leagueId}`;
      const data = await this.fetchFromBackend(endpoint);
      
      if (data?.data?.leagues?.[0]?.tournaments) {
        return data.data.leagues[0].tournaments.map((tournament: any) => ({
          id: tournament.id,
          slug: tournament.slug,
          startDate: tournament.startDate,
          endDate: tournament.endDate,
          title: tournament.title,
          description: tournament.description,
          leagueId: leagueId
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch tournaments for league ${leagueId}:`, error);
      return [];
    }
  }

  async getStandings(tournamentId: string): Promise<Standing[]> {
    try {
      const endpoint = `/standings/${tournamentId}`;
      const data = await this.fetchFromBackend(endpoint);
      
      if (data?.data?.standings) {
        return data.data.standings.map((standing: any) => ({
          id: standing.id,
          slug: standing.slug,
          name: standing.name,
          code: standing.code,
          image: standing.image,
          record: standing.record,
          ordinals: standing.ordinals
        }));
      }
      
      return [];
    } catch (error) {
      console.error(`Failed to fetch standings for tournament ${tournamentId}:`, error);
      return [];
    }
  }

  async getTeams(): Promise<Team[]> {
    try {
      const endpoint = `/teams`;
      const data = await this.fetchFromBackend(endpoint);
      
      if (data?.data?.teams) {
        return data.data.teams.map((team: any) => ({
          id: team.id,
          slug: team.slug,
          name: team.name,
          code: team.code,
          image: team.image,
          alternativeImage: team.alternativeImage,
          backgroundImage: team.backgroundImage,
          status: team.status,
          homeLeague: team.homeLeague
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      return [];
    }
  }

  async getEventDetails(eventId: string): Promise<EventDetails | null> {
    try {
      const endpoint = `/event/${eventId}`;
      const data = await this.fetchFromBackend(endpoint);
      
      if (data?.data?.event) {
        const event = data.data.event;
        return {
          id: event.id,
          startTime: event.startTime,
          state: event.state,
          type: event.type,
          blockName: event.blockName,
          league: event.league,
          tournament: event.tournament,
          match: {
            id: event.match.id,
            flags: event.match.flags,
            teams: event.match.teams,
            strategy: event.match.strategy
          },
          games: event.games
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Failed to fetch event details for ${eventId}:`, error);
      return null;
    }
  }

  // Helper methods for filtering data
  getLiveMatches(matches: Match[]): Match[] {
    return matches.filter(match => match.state === 'inProgress');
  }

  getUpcomingMatches(matches: Match[], limit: number = 10): Match[] {
    return matches
      .filter(match => match.state === 'unstarted')
      .slice(0, limit);
  }

  getCompletedMatches(matches: Match[], limit: number = 10): Match[] {
    return matches
      .filter(match => match.state === 'completed')
      .slice(0, limit);
  }
}

export const riotEsportsService = new RiotEsportsService();