// Account API Response (from Account-V1 API)
export interface RiotAccount {
    puuid: string;
    gameName: string;
    tagLine: string;
}

// Summoner API Response (from Summoner-V4 API)
export interface Summoner {
    accountId: string;
    profileIconId: number;
    revisionDate: number;
    name: string;
    id: string;
    puuid: string;
    summonerLevel: number;
}

// Ranked API Response (from League-V4 API)
export interface RankedInfo {
    leagueId: string;
    queueType: string;
    tier: string;
    rank: string;
    summonerId: string;
    summonerName: string;
    leaguePoints: number;
    wins: number;
    losses: number;
    veteran: boolean;
    inactive: boolean;
    freshBlood: boolean;
    hotStreak: boolean;
    miniSeries?: {
        target: number;
        wins: number;
        losses: number;
        progress: string;
    };
}

// Combined response for complete summoner profile
export interface SummonerProfile {
    account: RiotAccount;
    summoner: Summoner;
    rankedData: RankedInfo[];
    region: string;
}

// Region mapping types
export type ClusterRegion = 'americas' | 'europe' | 'asia';
export type PlatformRegion = 'na1' | 'br1' | 'la1' | 'la2' | 'oc1' | 'euw1' | 'eun1' | 'tr1' | 'ru' | 'kr' | 'jp1' | 'ph2' | 'sg2' | 'th2' | 'tw2' | 'vn2';