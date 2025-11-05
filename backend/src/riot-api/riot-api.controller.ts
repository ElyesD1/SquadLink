import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Query, 
  Body, 
  BadRequestException,
  ValidationPipe 
} from '@nestjs/common';
import { Observable, forkJoin, from, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { RiotApiService } from './riot-api.service';
import { MatchCacheService } from './match-cache.service';
import { SummonerCacheService } from './summoner-cache.service';
import { SearchSummonerDto } from './dto/search-summoner.dto';
import { 
  RiotAccount, 
  Summoner, 
  RankedInfo, 
  SummonerProfile, 
  ClusterRegion, 
  PlatformRegion 
} from './interfaces/riot-api.interface';

@Controller('api/v1/riot')
export class RiotApiController {
  constructor(
    private readonly riotApiService: RiotApiService,
    private readonly matchCacheService: MatchCacheService,
    private readonly summonerCacheService: SummonerCacheService,
  ) {}

  /**
   * Main endpoint for summoner search
   * POST /api/v1/riot/summoner/search
   */
  @Post('summoner/search')
  searchSummoner(
    @Body(ValidationPipe) searchDto: SearchSummonerDto
  ): Observable<SummonerProfile> {
    const { gameName, tagline, region } = searchDto;
    
    if (!gameName || !tagline) {
      throw new BadRequestException('Game name and tagline are required');
    }

    return this.riotApiService.searchSummoner(gameName, tagline, region);
  }

  /**
   * Get account by Riot ID (gameName#tagline)
   * GET /api/v1/riot/account/{gameName}/{tagline}?region={region}
   */
  @Get('account/:gameName/:tagline')
  getAccountByRiotId(
    @Param('gameName') gameName: string,
    @Param('tagline') tagline: string,
    @Query('region') region?: string
  ): Observable<RiotAccount> {
    if (!gameName || !tagline) {
      throw new BadRequestException('Game name and tagline are required');
    }

    return this.riotApiService.getAccountByRiotId(gameName, tagline, region);
  }

  /**
   * Get summoner by PUUID
   * GET /api/v1/riot/summoner/puuid/{puuid}?region={region}
   */
  @Get('summoner/puuid/:puuid')
  getSummonerByPuuid(
    @Param('puuid') puuid: string,
    @Query('region') region?: string
  ): Observable<Summoner> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    return this.riotApiService.getSummonerByPuuid(puuid, region);
  }

  /**
   * Get summoner by PUUID with caching
   * GET /api/v1/riot/summoner/puuid/{puuid}/cached?region={region}
   */
  @Get('summoner/puuid/:puuid/cached')
  async getSummonerByPuuidCached(
    @Param('puuid') puuid: string,
    @Query('region') region?: string
  ): Promise<Summoner> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    const regionToUse = region || 'na1';

    // Try cache first
    const cached = await this.summonerCacheService.getCachedSummoner(puuid, regionToUse);
    if (cached) {
      return cached;
    }

    // Cache miss - fetch from API and cache
    return new Promise((resolve, reject) => {
      this.riotApiService.getSummonerByPuuid(puuid, regionToUse).subscribe({
        next: async (summoner) => {
          await this.summonerCacheService.cacheSummoner(puuid, regionToUse, summoner);
          resolve(summoner);
        },
        error: (error) => reject(error)
      });
    });
  }

  /**
   * Get multiple summoners by PUUID in batch (with caching)
   * POST /api/v1/riot/summoner/batch
   * Body: { summoners: [{ puuid: string, region: string }] }
   */
  @Post('summoner/batch')
  async getSummonersBatch(
    @Body() body: { summoners: Array<{ puuid: string; region: string }> }
  ): Promise<{ summoners: Summoner[]; cached: number; fetched: number }> {
    if (!body.summoners || !Array.isArray(body.summoners)) {
      throw new BadRequestException('Summoners array is required');
    }

    const requests = body.summoners;
    const results: Summoner[] = [];
    let cachedCount = 0;
    let fetchedCount = 0;

    // Try to get from cache first
    const cachedMap = await this.summonerCacheService.getCachedSummonersBatch(requests);

    const toFetch: Array<{ puuid: string; region: string }> = [];
    
    // Identify which summoners need to be fetched
    for (const req of requests) {
      const key = `${req.puuid}-${req.region}`;
      const cached = cachedMap.get(key);
      
      if (cached) {
        results.push(cached);
        cachedCount++;
      } else {
        toFetch.push(req);
      }
    }

    // Fetch missing summoners from API
    if (toFetch.length > 0) {
      const fetchPromises = toFetch.map(({ puuid, region }) => 
        new Promise<{ puuid: string; region: string; data: Summoner | null }>((resolve, reject) => {
          this.riotApiService.getSummonerByPuuid(puuid, region).subscribe({
            next: (summoner) => resolve({ puuid, region, data: summoner }),
            error: (error) => {
              console.error(`Failed to fetch summoner ${puuid}:`, error.message);
              resolve({ puuid, region, data: null });
            }
          });
        })
      );

      const fetchedData = await Promise.all(fetchPromises);
      
      // Cache the fetched summoners
      const toCache = fetchedData.filter(item => item.data !== null) as Array<{ puuid: string; region: string; data: Summoner }>;
      if (toCache.length > 0) {
        await this.summonerCacheService.cacheSummonersBatch(toCache);
      }

      // Add to results
      fetchedData.forEach(item => {
        if (item.data) {
          results.push(item.data);
          fetchedCount++;
        }
      });
    }

    return {
      summoners: results,
      cached: cachedCount,
      fetched: fetchedCount
    };
  }

  /**
   * Get ranked information by summoner ID (PUUID)
   * GET /api/v1/riot/summoner/{summonerId}/ranked?region={region}
   */
  @Get('summoner/:summonerId/ranked')
  getRankedInfo(
    @Param('summonerId') summonerId: string,
    @Query('region') region?: string
  ): Observable<RankedInfo[]> {
    if (!summonerId) {
      throw new BadRequestException('Summoner ID is required');
    }

    return this.riotApiService.getRankedInfo(summonerId, region);
  }

  /**
   * Get available regions
   * GET /api/v1/riot/regions
   */
  @Get('regions')
  getAvailableRegions(): { platform: PlatformRegion[], cluster: ClusterRegion[] } {
    return this.riotApiService.getAvailableRegions();
  }

    /**
   * Alternative GET endpoint for summoner search (for convenience)
   * GET /api/v1/riot/summoner/search/{gameName}/{tagline}?region={region}
   */
  @Get('summoner/search/:gameName/:tagline')
  searchSummonerGet(
    @Param('gameName') gameName: string,
    @Param('tagline') tagline: string,
    @Query('region') region?: string
  ): Observable<SummonerProfile> {
    if (!gameName || !tagline) {
      throw new BadRequestException('Game name and tagline are required');
    }

    return this.riotApiService.searchSummoner(gameName, tagline, region);
  }

  /**
   * Get match history by PUUID
   * GET /api/v1/riot/matches/{puuid}/history?region={region}&start={start}&count={count}
   */
  @Get('matches/:puuid/history')
  getMatchHistory(
    @Param('puuid') puuid: string,
    @Query('region') region?: string,
    @Query('start') start: string = '0',
    @Query('count') count: string = '20',
  ): Observable<string[]> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    return this.riotApiService.getMatchHistory(
      puuid,
      region,
      parseInt(start),
      parseInt(count)
    );
  }

  /**
   * Get match details by match ID
   * GET /api/v1/riot/match/{matchId}?region={region}
   */
  @Get('match/:matchId')
  getMatchDetails(
    @Param('matchId') matchId: string,
    @Query('region') region?: string
  ): Observable<any> {
    if (!matchId) {
      throw new BadRequestException('Match ID is required');
    }

    return this.riotApiService.getMatchDetails(matchId, region);
  }

  /**
   * Get cached matches with intelligent loading
   * GET /api/v1/riot/matches/{puuid}/cached?region={region}&count={count}
   */
  @Get('matches/:puuid/cached')
  async getCachedMatches(
    @Param('puuid') puuid: string,
    @Query('region') region: string = 'americas',
    @Query('count') count: string = '20',
  ): Promise<any> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    const requestedCount = parseInt(count);
    
    // Get cached matches
    const cachedMatches = await this.matchCacheService.getCachedMatches(
      puuid,
      region,
      requestedCount
    );

    return {
      matches: cachedMatches,
      fromCache: true,
      count: cachedMatches.length,
    };
  }

  /**
   * Fetch and cache new matches
   * POST /api/v1/riot/matches/{puuid}/fetch-and-cache
   * Body: { region, start, count }
   */
  @Post('matches/:puuid/fetch-and-cache')
  fetchAndCacheMatches(
    @Param('puuid') puuid: string,
    @Body() body: { region?: string; start?: number; count?: number }
  ): Observable<any> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    const { region = 'americas', start = 0, count = 20 } = body;

    // Get match IDs from Riot API
    return this.riotApiService.getMatchHistory(puuid, region, start, count).pipe(
      switchMap(matchIds => {
        if (!matchIds || matchIds.length === 0) {
          return from(
            this.matchCacheService.getCachedMatches(puuid, region, count)
          ).pipe(
            map(matches => ({ matches, newMatches: 0, fromCache: true }))
          );
        }

        // Check which matches are new (not in cache)
        return from(this.matchCacheService.getExistingMatchIds(matchIds)).pipe(
          switchMap(existingIds => {
            const newMatchIds = matchIds.filter(id => !existingIds.includes(id));

            if (newMatchIds.length === 0) {
              // All matches are cached, return from cache
              return from(
                this.matchCacheService.getCachedMatches(puuid, region, count)
              ).pipe(
                map(matches => ({
                  matches,
                  newMatches: 0,
                  fromCache: true,
                  message: 'All matches already cached'
                }))
              );
            }

            // Fetch only new matches
            console.log(`[Cache] Found ${newMatchIds.length} new matches to fetch`);
            const matchRequests = newMatchIds.map(matchId =>
              this.riotApiService.getMatchDetails(matchId, region).pipe(
                catchError(err => {
                  console.error(`Error fetching match ${matchId}:`, err.message);
                  return of(null);
                })
              )
            );

            return forkJoin(matchRequests).pipe(
              switchMap(matches => {
                const validMatches = matches.filter(m => m !== null);
                
                // Cache the new matches
                return from(
                  this.matchCacheService.cacheMatches(puuid, region, validMatches)
                ).pipe(
                  switchMap(() => 
                    from(this.matchCacheService.cleanupOldMatches(puuid, region))
                  ),
                  switchMap(() =>
                    from(this.matchCacheService.getCachedMatches(puuid, region, count))
                  ),
                  map(allMatches => ({
                    matches: allMatches,
                    newMatches: validMatches.length,
                    fromCache: false,
                    message: `Cached ${validMatches.length} new matches`
                  }))
                );
              })
            );
          })
        );
      }),
      catchError(err => {
        console.error('Error in fetch-and-cache:', err);
        return of({ matches: [], newMatches: 0, error: err.message });
      })
    );
  }

  /**
   * Load more matches (5 at a time)
   * POST /api/v1/riot/matches/{puuid}/load-more
   * Body: { region, offset }
   */
  @Post('matches/:puuid/load-more')
  loadMoreMatches(
    @Param('puuid') puuid: string,
    @Body() body: { region?: string; offset?: number }
  ): Observable<any> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    const { region = 'americas', offset = 0 } = body;
    const count = 10; // Load 10 matches at a time

    console.log(`[Load More Backend] Fetching matches from offset ${offset}`);

    // Fetch match IDs from Riot API
    return this.riotApiService.getMatchHistory(puuid, region, offset, count).pipe(
      switchMap(matchIds => {
        console.log(`[Load More Backend] Riot API returned ${matchIds?.length || 0} match IDs`);
        
        if (!matchIds || matchIds.length === 0) {
          console.log('[Load More Backend] ✅ No more matches available');
          return of({ matches: [] });
        }

        // Check which matches are already cached for this PUUID
        return from(
          this.matchCacheService.getCachedMatches(puuid, region, 10000)
        ).pipe(
          switchMap(cachedMatches => {
            const cachedMatchIds = new Set(cachedMatches.map(m => m.metadata.matchId));
            const newMatchIds = matchIds.filter(id => !cachedMatchIds.has(id));
            
            console.log(`[Load More Backend] ${matchIds.length} requested, ${cachedMatchIds.size} total in cache, ${newMatchIds.length} new to fetch`);

            if (newMatchIds.length === 0) {
              // All matches already cached, return them in Riot's order
              const matchMap = new Map(cachedMatches.map(m => [m.metadata.matchId, m]));
              const orderedMatches = matchIds
                .map(id => matchMap.get(id))
                .filter(m => m !== undefined);
              
              console.log(`[Load More Backend] ✅ All ${matchIds.length} matches already cached`);
              return of({ matches: orderedMatches });
            }

            // Fetch only new matches
            console.log(`[Load More Backend] Fetching ${newMatchIds.length} new matches from Riot API`);
            const matchRequests = newMatchIds.map(matchId =>
              this.riotApiService.getMatchDetails(matchId, region).pipe(
                catchError(error => {
                  console.error(`[Load More Backend] Error fetching match ${matchId}:`, error.message);
                  return of(null);
                })
              )
            );

            return forkJoin(matchRequests).pipe(
              switchMap(matches => {
                const validMatches = matches.filter(m => m !== null);
                console.log(`[Load More Backend] Fetched ${validMatches.length}/${newMatchIds.length} matches successfully`);
                
                if (validMatches.length === 0) {
                  // Failed to fetch any new matches, return cached ones
                  const matchMap = new Map(cachedMatches.map(m => [m.metadata.matchId, m]));
                  const orderedMatches = matchIds
                    .map(id => matchMap.get(id))
                    .filter(m => m !== undefined);
                  
                  return of({ matches: orderedMatches });
                }

                // Cache the new matches
                return from(
                  this.matchCacheService.cacheMatches(puuid, region, validMatches)
                ).pipe(
                  switchMap(() => {
                    console.log(`[Load More Backend] ✅ Cached ${validMatches.length} new matches`);
                    
                    // Get updated cache and return matches in Riot's order
                    return from(
                      this.matchCacheService.getCachedMatches(puuid, region, 10000)
                    ).pipe(
                      map(allCached => {
                        const matchMap = new Map(allCached.map(m => [m.metadata.matchId, m]));
                        const orderedMatches = matchIds
                          .map(id => matchMap.get(id))
                          .filter(m => m !== undefined);
                        
                        return { matches: orderedMatches };
                      })
                    );
                  })
                );
              })
            );
          })
        );
      })
    );
  }

  /**
   * Clear cache for a user
   * POST /api/v1/riot/matches/{puuid}/clear-cache
   */
  @Post('matches/:puuid/clear-cache')
  async clearCache(
    @Param('puuid') puuid: string,
    @Body() body: { region?: string }
  ): Promise<any> {
    if (!puuid) {
      throw new BadRequestException('PUUID is required');
    }

    const { region = 'americas' } = body;
    await this.matchCacheService.clearUserCache(puuid, region);
    
    return { success: true, message: 'Cache cleared successfully' };
  }

  /**
   * Get match timeline with processed events
   * GET /api/v1/riot/matches/{matchId}/timeline?region={region}
   */
  @Get('matches/:matchId/timeline')
  getMatchTimeline(
    @Param('matchId') matchId: string,
    @Query('region') region?: string
  ): Observable<any> {
    if (!matchId) {
      throw new BadRequestException('Match ID is required');
    }

    return this.riotApiService.getMatchTimeline(matchId, region).pipe(
      map(timelineData => {
        // Process timeline events into a sorted event log
        const events = this.processTimelineEvents(timelineData);
        return {
          matchId,
          events,
          rawTimeline: timelineData
        };
      })
    );
  }

  /**
   * Process timeline data into sorted event log
   */
  private processTimelineEvents(timelineData: any): any[] {
    const allEvents: any[] = [];

    for (const frame of timelineData.info.frames) {
      for (const event of frame.events) {
        // Filter relevant events
        if (this.isRelevantEvent(event.type)) {
          allEvents.push({
            ...event,
            timestampMinutes: Math.floor(event.timestamp / 60000),
            timestampSeconds: Math.floor((event.timestamp % 60000) / 1000),
            formattedTime: this.formatTimestamp(event.timestamp)
          });
        }
      }
    }

    // Sort by timestamp
    return allEvents.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Check if event type should be included in timeline
   */
  private isRelevantEvent(eventType: string): boolean {
    const relevantEvents = [
      'CHAMPION_KILL',
      'CHAMPION_SPECIAL_KILL',
      'BUILDING_KILL',
      'ELITE_MONSTER_KILL',
      'TURRET_PLATE_DESTROYED',
      'WARD_PLACED',
      'WARD_KILL',
      'SKILL_LEVEL_UP',
      'ITEM_PURCHASED',
      'ITEM_SOLD',
      'ITEM_DESTROYED',
      'ITEM_UNDO',
    ];
    return relevantEvents.includes(eventType);
  }

  /**
   * Format timestamp to MM:SS
   */
  private formatTimestamp(ms: number): string {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
