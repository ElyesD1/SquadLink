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
   * Cache summoner data with optional gameName and tagLine
   */
  async cacheSummoner(
    puuid: string,
    region: string,
    summonerData: Summoner,
    gameName?: string,
    tagLine?: string,
  ): Promise<void> {
    try {
      const updateData: any = {
        puuid,
        region,
        summonerData,
        cachedAt: new Date(),
        lastAccessed: new Date(),
      };

      // Add gameName and tagLine if provided
      if (gameName) updateData.gameName = gameName;
      if (tagLine) updateData.tagLine = tagLine;
      
      await this.summonerCacheModel.findOneAndUpdate(
        { puuid, region },
        updateData,
        { upsert: true, new: true }
      );

      this.logger.log(`Cached summoner ${gameName}#${tagLine} (${puuid}) in ${region}`);
    } catch (error) {
      this.logger.error(`Error caching summoner ${puuid}: ${error.message}`);
    }
  }

  /**
   * Cache multiple summoners in batch
   */
  async cacheSummonersBatch(
    summoners: Array<{ puuid: string; region: string; data: Summoner; gameName?: string; tagLine?: string }>,
  ): Promise<void> {
    try {
      const operations = summoners.map(({ puuid, region, data, gameName, tagLine }) => {
        const updateData: any = {
          puuid,
          region,
          summonerData: data,
          cachedAt: new Date(),
          lastAccessed: new Date(),
        };

        // Add gameName and tagLine if provided
        if (gameName) updateData.gameName = gameName;
        if (tagLine) updateData.tagLine = tagLine;

        return {
          updateOne: {
            filter: { puuid, region },
            update: { $set: updateData },
            upsert: true,
          }
        };
      });

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
   * Get all cached summoners (for social network building)
   */
  async getAllCachedSummoners(limit?: number): Promise<SummonerCache[]> {
    try {
      const query = this.summonerCacheModel.find().sort({ lastAccessed: -1 });
      
      if (limit) {
        query.limit(limit);
      }
      
      const summoners = await query.exec();
      this.logger.log(`Retrieved ${summoners.length} cached summoners`);
      return summoners;
    } catch (error) {
      this.logger.error(`Error getting all cached summoners: ${error.message}`);
      return [];
    }
  }

  /**
   * Search summoners by gameName and tagLine with smart prioritization
   * Prioritizes: 1) Exact match, 2) Starts with, 3) Contains
   */
  async searchSummonersByName(
    searchQuery: string, 
    limit: number = 10,
    region?: string
  ): Promise<SummonerCache[]> {
    try {
      // Use anchored regex for "starts with" - much more efficient
      const startsWithRegex = new RegExp(`^${searchQuery}`, 'i');
      const containsRegex = new RegExp(searchQuery, 'i');

      const baseQuery: any = region ? { region } : {};

      // First: Try to find summoners that START WITH the query (most relevant)
      const startsWithQuery = {
        ...baseQuery,
        $or: [
          { gameName: startsWithRegex },
          { tagLine: startsWithRegex },
        ]
      };

      let summoners = await this.summonerCacheModel
        .find(startsWithQuery)
        .limit(limit)
        .sort({ lastAccessed: -1 })
        .exec();

      // If we got enough results, return them
      if (summoners.length >= limit) {
        this.logger.log(`Found ${summoners.length} summoners starting with "${searchQuery}"${region ? ` in ${region}` : ''}`);
        return summoners.slice(0, limit);
      }

      // If not enough, supplement with "contains" matches
      const existingPuuids = summoners.map(s => s.puuid);
      const containsQuery = {
        ...baseQuery,
        puuid: { $nin: existingPuuids }, // Exclude already found summoners
        $or: [
          { gameName: containsRegex },
          { tagLine: containsRegex },
        ]
      };

      const additionalSummoners = await this.summonerCacheModel
        .find(containsQuery)
        .limit(limit - summoners.length)
        .sort({ lastAccessed: -1 })
        .exec();

      summoners = [...summoners, ...additionalSummoners];
      
      this.logger.log(`Found ${summoners.length} summoners matching "${searchQuery}"${region ? ` in ${region}` : ''}`);
      return summoners.slice(0, limit);
    } catch (error) {
      this.logger.error(`Error searching summoners: ${error.message}`);
      return [];
    }
  }

  /**
   * Update player tags for a summoner
   */
  async updatePlayerTags(
    puuid: string,
    region: string,
    tags: string[],
    metadata: any,
  ): Promise<void> {
    try {
      await this.summonerCacheModel.updateOne(
        { puuid, region },
        { 
          $set: { 
            tags,
            tagMetadata: metadata,
            tagsLastUpdated: new Date(),
          } 
        },
      );
      this.logger.log(`Updated tags for summoner ${puuid}: ${tags.join(', ')}`);
    } catch (error) {
      this.logger.error(`Error updating player tags: ${error.message}`);
    }
  }

  /**
   * Get player tags for a summoner
   */
  async getPlayerTags(puuid: string, region: string): Promise<{ tags: string[]; metadata: any } | null> {
    try {
      const cached = await this.summonerCacheModel
        .findOne({ puuid, region })
        .select('tags tagMetadata tagsLastUpdated')
        .exec();

      if (cached && cached.tags && cached.tags.length > 0) {
        return {
          tags: cached.tags,
          metadata: cached.tagMetadata || {},
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Error getting player tags: ${error.message}`);
      return null;
    }
  }
}

