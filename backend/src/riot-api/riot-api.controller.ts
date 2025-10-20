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
import { Observable } from 'rxjs';
import { RiotApiService } from './riot-api.service';
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
  constructor(private readonly riotApiService: RiotApiService) {}

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
}