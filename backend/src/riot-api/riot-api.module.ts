import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RiotApiController } from './riot-api.controller';
import { RiotApiService } from './riot-api.service';
import { MatchCacheService } from './match-cache.service';
import { MatchCache, MatchCacheSchema } from './entities/match-cache.entity';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    ConfigModule,
    MongooseModule.forFeature([
      { name: MatchCache.name, schema: MatchCacheSchema }
    ]),
  ],
  controllers: [RiotApiController],
  providers: [RiotApiService, MatchCacheService],
  exports: [RiotApiService, MatchCacheService],
})
export class RiotApiModule {}