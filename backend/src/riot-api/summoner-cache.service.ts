import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SummonerCache } from './entities/summoner-cache.entity';
import { Summoner } from './interfaces/riot-api.interface';

@Injectable()
export class SummonerCacheService {
  private readonly logger = new Logger(SummonerCacheService.name);

  constructor(
    @InjectModel(SummonerCache.name)
    private summonerCacheModel: Model<SummonerCache>,
  ) {}

  /**
   * Get cached summoner data by PUUID
   */
  async getCachedSummoner(
    puuid: string,
    region: string,
  ): Promise<Summoner | null> {
    try {
      const cached = await this.summonerCacheModel
        .findOne({ 
          puuid, 
          region,
          expiresAt: { $gt: new Date() } // Only return non-expired entries
        })
        .exec();

      if (cached) {
        // Update last accessed time
        await this.summonerCacheModel.updateOne(
          { _id: cached._id },
          { $set: { lastAccessed: new Date() } }
        );
        
        this.logger.log(`Cache HIT for summoner ${puuid} in ${region}`);
        return cached.summonerData as Summoner;
      }

      this.logger.log(`Cache MISS for summoner ${puuid} in ${region}`);
      return null;
    } catch (error) {
      this.logger.error(`Error getting cached summoner: ${error.message}`);
      return null;
    }
  }

  /**
   * Get multiple cached summoners in batch
   */
  async getCachedSummonersBatch(
    requests: Array<{ puuid: string; region: string }>
  ): Promise<Map<string, Summoner>> {
    try {
      const puuids = requests.map(r => r.puuid);
      const regions = [...new Set(requests.map(r => r.region))];

      const cached = await this.summonerCacheModel
        .find({
          puuid: { $in: puuids },
          region: { $in: regions },
          expiresAt: { $gt: new Date() }
        })
        .exec();

      const resultMap = new Map<string, Summoner>();
      
      for (const item of cached) {
        const key = `${item.puuid}-${item.region}`;
        resultMap.set(key, item.summonerData as Summoner);
      }

      // Update last accessed time for all found entries
      if (cached.length > 0) {
        const ids = cached.map(c => c._id);
        await this.summonerCacheModel.updateMany(
          { _id: { $in: ids } },
          { $set: { lastAccessed: new Date() } }
        );
      }

      this.logger.log(`Batch cache: ${cached.length}/${puuids.length} summoners found`);
      return resultMap;
    } catch (error) {
      this.logger.error(`Error getting cached summoners batch: ${error.message}`);
      return new Map();
    }
  }

  /**
   * Cache summoner data
   */
  async cacheSummoner(
    puuid: string,
    region: string,
    summonerData: Summoner,
    ttlHours: number = 24,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
      
      await this.summonerCacheModel.findOneAndUpdate(
        { puuid, region },
        {
          puuid,
          region,
          summonerData,
          cachedAt: new Date(),
          lastAccessed: new Date(),
          expiresAt,
        },
        { upsert: true, new: true }
      );

      this.logger.log(`Cached summoner ${puuid} in ${region}`);
    } catch (error) {
      this.logger.error(`Error caching summoner ${puuid}: ${error.message}`);
    }
  }

  /**
   * Cache multiple summoners in batch
   */
  async cacheSummonersBatch(
    summoners: Array<{ puuid: string; region: string; data: Summoner }>,
    ttlHours: number = 24,
  ): Promise<void> {
    try {
      const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);
      
      const operations = summoners.map(({ puuid, region, data }) => ({
        updateOne: {
          filter: { puuid, region },
          update: {
            $set: {
              puuid,
              region,
              summonerData: data,
              cachedAt: new Date(),
              lastAccessed: new Date(),
              expiresAt,
            }
          },
          upsert: true,
        }
      }));

      if (operations.length > 0) {
        await this.summonerCacheModel.bulkWrite(operations);
        this.logger.log(`Batch cached ${summoners.length} summoners`);
      }
    } catch (error) {
      this.logger.error(`Error batch caching summoners: ${error.message}`);
    }
  }

  /**
   * Invalidate cache for a specific summoner
   */
  async invalidateCache(puuid: string, region: string): Promise<void> {
    try {
      await this.summonerCacheModel.deleteOne({ puuid, region });
      this.logger.log(`Invalidated cache for summoner ${puuid} in ${region}`);
    } catch (error) {
      this.logger.error(`Error invalidating cache: ${error.message}`);
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpired(): Promise<void> {
    try {
      const result = await this.summonerCacheModel.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      this.logger.log(`Cleaned up ${result.deletedCount} expired summoner cache entries`);
    } catch (error) {
      this.logger.error(`Error cleaning up expired cache: ${error.message}`);
    }
  }
}
