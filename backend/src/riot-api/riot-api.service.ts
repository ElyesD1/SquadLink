import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Observable, map, switchMap, catchError, throwError, forkJoin, of } from 'rxjs';
import { AxiosResponse } from 'axios';
import { 
  RiotAccount, 
  Summoner, 
  RankedInfo, 
  SummonerProfile, 
  ClusterRegion, 
  PlatformRegion 
} from './interfaces/riot-api.interface';

@Injectable()
export class RiotApiService {
  private readonly apiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    const apiKey = this.configService.get<string>('RIOT_API_KEY');
    if (!apiKey) {
      throw new Error('RIOT_API_KEY is not configured');
    }
    this.apiKey = apiKey;
  }

  /**
   * Get cluster region URL for Account API
   * Account API uses cluster regions (americas, europe, asia)
   */
  private getAccountRegionalUrl(region?: string): string {
    const clusterToUrl: { [key: string]: string } = {
      // Cluster regions (used by account API)
      'americas': 'https://americas.api.riotgames.com',
      'europe': 'https://europe.api.riotgames.com',
      'asia': 'https://asia.api.riotgames.com',
      
      // Platform regions (fallback mapping to clusters)
      'na1': 'https://americas.api.riotgames.com',
      'br1': 'https://americas.api.riotgames.com',
      'la1': 'https://americas.api.riotgames.com',
      'la2': 'https://americas.api.riotgames.com',
      'oc1': 'https://americas.api.riotgames.com',
      'euw1': 'https://europe.api.riotgames.com',
      'eun1': 'https://europe.api.riotgames.com',
      'tr1': 'https://europe.api.riotgames.com',
      'ru': 'https://europe.api.riotgames.com',
      'kr': 'https://asia.api.riotgames.com',
      'jp1': 'https://asia.api.riotgames.com',
      'ph2': 'https://asia.api.riotgames.com',
      'sg2': 'https://asia.api.riotgames.com',
      'th2': 'https://asia.api.riotgames.com',
      'tw2': 'https://asia.api.riotgames.com',
      'vn2': 'https://asia.api.riotgames.com',
    };

    const normalizedRegion = region?.toLowerCase() || 'americas';
    return clusterToUrl[normalizedRegion] || clusterToUrl['americas'];
  }

  /**
   * Get platform region URL for Summoner/Ranked APIs
   * These APIs use platform-specific regions (na1, euw1, kr, etc.)
   */
  private getRegionalUrl(region?: string): string {
    const platformToUrl: { [key: string]: string } = {
      'na1': 'https://na1.api.riotgames.com',
      'br1': 'https://br1.api.riotgames.com',
      'la1': 'https://la1.api.riotgames.com',
      'la2': 'https://la2.api.riotgames.com',
      'oc1': 'https://oc1.api.riotgames.com',
      'euw1': 'https://euw1.api.riotgames.com',
      'eun1': 'https://eun1.api.riotgames.com',
      'tr1': 'https://tr1.api.riotgames.com',
      'ru': 'https://ru.api.riotgames.com',
      'kr': 'https://kr.api.riotgames.com',
      'jp1': 'https://jp1.api.riotgames.com',
      'ph2': 'https://ph2.api.riotgames.com',
      'sg2': 'https://sg2.api.riotgames.com',
      'th2': 'https://th2.api.riotgames.com',
      'tw2': 'https://tw2.api.riotgames.com',
      'vn2': 'https://vn2.api.riotgames.com',
    };

    const normalizedRegion = region?.toLowerCase() || 'na1';
    return platformToUrl[normalizedRegion] || platformToUrl['na1'];
  }

  /**
   * Get default region mapping for platform regions
   */
  private getDefaultRegion(region?: string): string {
    const regionMap: { [key: string]: string } = {
      'americas': 'na1',
      'europe': 'euw1',
      'asia': 'kr',
    };

    if (!region) return 'na1';
    
    const lowerRegion = region.toLowerCase();
    return regionMap[lowerRegion] || lowerRegion || 'na1';
  }

  /**
   * Get account by Riot ID (gameName#tagline)
   * Uses Account-V1 API with cluster regions
   */
  getAccountByRiotId(gameName: string, tagline: string, region?: string): Observable<RiotAccount> {
    const baseUrl = this.getAccountRegionalUrl(region);
    const url = `${baseUrl}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagline)}`;

    return this.httpService.get<RiotAccount>(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    }).pipe(
      map((response: AxiosResponse<RiotAccount>) => response.data),
      catchError(error => {
        if (error.response?.status === 404) {
          throw new NotFoundException(`Summoner ${gameName}#${tagline} not found in region ${region}`);
        }
        throw new BadRequestException(`Failed to fetch account: ${error.message}`);
      })
    );
  }

  /**
   * Get summoner by PUUID
   * Uses Summoner-V4 API with platform regions
   */
  getSummonerByPuuid(puuid: string, region?: string): Observable<Summoner> {
    const baseUrl = this.getRegionalUrl(region);
    const url = `${baseUrl}/lol/summoner/v4/summoners/by-puuid/${puuid}`;

    return this.httpService.get<Summoner>(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    }).pipe(
      map((response: AxiosResponse<Summoner>) => response.data),
      catchError(error => {
        if (error.response?.status === 404) {
          throw new NotFoundException(`Summoner with PUUID ${puuid} not found in region ${region}`);
        }
        throw new BadRequestException(`Failed to fetch summoner: ${error.message}`);
      })
    );
  }

  /**
   * Get ranked information by PUUID
   * Uses League-V4 API with platform regions and by-puuid endpoint
   */
  getRankedInfo(puuid: string, region?: string): Observable<RankedInfo[]> {
    const baseUrl = this.getRegionalUrl(region);
    const url = `${baseUrl}/lol/league/v4/entries/by-puuid/${puuid}`;

    console.log(`Ranked API Request - PUUID: ${puuid}, Region: ${region}, URL: ${url}`);

    return this.httpService.get<RankedInfo[]>(url, {
      headers: {
        'X-Riot-Token': this.apiKey,
      },
    }).pipe(
      map((response: AxiosResponse<RankedInfo[]>) => response.data || []),
      catchError(error => {
        console.log(`Ranked API Error - Status: ${error.response?.status}, Message:`, error.response?.data);
        if (error.response?.status === 404) {
          return of([]); // Return empty array if no ranked data found
        }
        throw new BadRequestException(`Failed to fetch ranked info: ${error.message}`);
      })
    );
  }

  /**
   * Complete summoner search - combines account, summoner, and ranked data
   * This is the main method that orchestrates the full search flow
   */
  searchSummoner(gameName: string, tagline: string, region?: string): Observable<SummonerProfile> {
    const platformRegion = this.getDefaultRegion(region);

    return this.getAccountByRiotId(gameName, tagline, region).pipe(
      switchMap(account => {
        // Use PUUID for both summoner and ranked data
        return forkJoin({
          account: of(account),
          summoner: this.getSummonerByPuuid(account.puuid, platformRegion),
          rankedData: this.getRankedInfo(account.puuid, platformRegion), // Use PUUID directly
        });
      }),
      map(({ account, summoner, rankedData }) => ({
        account,
        summoner,
        rankedData,
        region: platformRegion,
      })),
      catchError(error => {
        console.error('Error in searchSummoner:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get available regions list
   */
  getAvailableRegions(): { platform: PlatformRegion[], cluster: ClusterRegion[] } {
    return {
      platform: ['na1', 'br1', 'la1', 'la2', 'oc1', 'euw1', 'eun1', 'tr1', 'ru', 'kr', 'jp1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2'],
      cluster: ['americas', 'europe', 'asia']
    };
  }
}