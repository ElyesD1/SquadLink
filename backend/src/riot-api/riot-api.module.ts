import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RiotApiController } from './riot-api.controller';
import { RiotApiService } from './riot-api.service';
import { MatchCacheService } from './match-cache.service';
import { SummonerCacheService } from './summoner-cache.service';
import { MatchCache, MatchCacheSchema } from './entities/match-cache.entity';
import { SummonerCache, SummonerCacheSchema } from './entities/summoner-cache.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    MongooseModule.forFeature([
      { name: MatchCache.name, schema: MatchCacheSchema },
      { name: SummonerCache.name, schema: SummonerCacheSchema }
    ]),
  ],
  controllers: [RiotApiController],
  providers: [RiotApiService, MatchCacheService, SummonerCacheService],
  exports: [RiotApiService, MatchCacheService, SummonerCacheService],
})
export class RiotApiModule {}