import { LOL_VERSION, getCDNUrl } from './constants';

const API_BASE_URL = 'http://localhost:3001';

export interface LolAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  summonerLevel: number;
  profileIconId: number;
  rankedData: Array<{
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
    wins: number;
    losses: number;
  }>;
  lastUpdated: string;
}

export interface SearchSummonerRequest {
  gameName: string;
  tagline: string;
  region?: string;
}

export interface LinkLolAccountRequest {
  email: string;
  gameName: string;
  tagline: string;
  region?: string;
}

class LoLService {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  // Search for a summoner (for validation before linking)
  async searchSummoner(request: SearchSummonerRequest) {
    const { gameName, tagline, region } = request;
    const queryParams = region ? `?region=${region}` : '';
    
    const response = await fetch(
      `${API_BASE_URL}/api/v1/riot/summoner/search/${encodeURIComponent(gameName)}/${encodeURIComponent(tagline)}${queryParams}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search summoner: ${response.statusText}`);
    }

    return response.json();
  }

  // Link LoL account to user profile
  async linkLolAccount(request: LinkLolAccountRequest) {
    const response = await fetch(`${API_BASE_URL}/users/lol-account/link`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to link LoL account: ${response.statusText}`);
    }

    return response.json();
  }

  // Unlink LoL account from user profile
  async unlinkLolAccount(email: string) {
    const response = await fetch(`${API_BASE_URL}/users/lol-account/unlink`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to unlink LoL account: ${response.statusText}`);
    }

    return response.json();
  }

  // Refresh LoL account data
  async refreshLolAccount(email: string) {
    const response = await fetch(`${API_BASE_URL}/users/lol-account/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh LoL account: ${response.statusText}`);
    }

    return response.json();
  }

  // Get available regions
  getAvailableRegions() {
    return [
      { value: 'na1', label: 'North America', cluster: 'americas' },
      { value: 'euw1', label: 'Europe West', cluster: 'europe' },
      { value: 'eun1', label: 'Europe Nordic & East', cluster: 'europe' },
      { value: 'kr', label: 'Korea', cluster: 'asia' },
      { value: 'jp1', label: 'Japan', cluster: 'asia' },
      { value: 'br1', label: 'Brazil', cluster: 'americas' },
      { value: 'la1', label: 'Latin America North', cluster: 'americas' },
      { value: 'la2', label: 'Latin America South', cluster: 'americas' },
      { value: 'oc1', label: 'Oceania', cluster: 'americas' },
      { value: 'tr1', label: 'Turkey', cluster: 'europe' },
      { value: 'ru', label: 'Russia', cluster: 'europe' },
      { value: 'ph2', label: 'Philippines', cluster: 'asia' },
      { value: 'sg2', label: 'Singapore', cluster: 'asia' },
      { value: 'th2', label: 'Thailand', cluster: 'asia' },
      { value: 'tw2', label: 'Taiwan', cluster: 'asia' },
      { value: 'vn2', label: 'Vietnam', cluster: 'asia' },
    ];
  }

  // Get rank image URL
  getRankImageUrl(tier: string): string {
    if (!tier) return '/Rank=Iron.png'; // Default rank
    
    const tierLower = tier.toLowerCase();
    const tierCapitalized = tierLower.charAt(0).toUpperCase() + tierLower.slice(1);
    
    return `/Rank=${tierCapitalized}.png`;
  }

  // Get summoner icon URL (from Riot's CDN)
  getSummonerIconUrl(profileIconId: number): string {
    return getCDNUrl(`img/profileicon/${profileIconId}.png`);
  }

  // Format queue type for display
  formatQueueType(queueType: string): string {
    const queueTypeMap: { [key: string]: string } = {
      'RANKED_SOLO_5x5': 'Solo/Duo',
      'RANKED_FLEX_SR': 'Flex',
      'RANKED_FLEX_TT': 'Flex 3v3',
    };

    return queueTypeMap[queueType] || queueType;
  }

  // Get rank display string
  getRankDisplayString(tier: string, rank: string): string {
    if (!tier) return 'Unranked';
    
    const masterTiers = ['MASTER', 'GRANDMASTER', 'CHALLENGER'];
    if (masterTiers.includes(tier.toUpperCase())) {
      return tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase();
    }

    return `${tier.charAt(0).toUpperCase() + tier.slice(1).toLowerCase()} ${rank}`;
  }
}

export const lolService = new LoLService();