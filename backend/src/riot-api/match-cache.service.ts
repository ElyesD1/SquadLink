import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchCache } from './entities/match-cache.entity';

@Injectable()
export class MatchCacheService {
  private readonly logger = new Logger(MatchCacheService.name);

  constructor(
    @InjectModel(MatchCache.name)
    private matchCacheModel: Model<MatchCache>,
  ) {}

  /**
   * Get cached matches for a user (sorted by game creation time)
   */
  async getCachedMatches(
    puuid: string,
    region: string,
    limit: number = 20,
  ): Promise<any[]> {
    try {
      const cachedMatches = await this.matchCacheModel
        .find({ puuid, region })
        .sort({ 'matchData.info.gameCreation': -1 }) // Sort by actual game time, not cache time
        .limit(limit)
        .exec();

      // Update last accessed time
      if (cachedMatches.length > 0) {
        const matchIds = cachedMatches.map(m => m.matchId);
        await this.matchCacheModel.updateMany(
          { matchId: { $in: matchIds } },
          { $set: { lastAccessed: new Date() } }
        );
      }

      return cachedMatches.map(match => match.matchData);
    } catch (error) {
      this.logger.error(`Error getting cached matches: ${error.message}`);
      return [];
    }
  }

  /**
   * Get count of cached matches for a user
   */
  async getCachedMatchCount(puuid: string, region: string): Promise<number> {
    try {
      return await this.matchCacheModel.countDocuments({ puuid, region });
    } catch (error) {
      this.logger.error(`Error counting cached matches: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get the most recent cached match ID for a user
   */
  async getLatestCachedMatchId(puuid: string, region: string): Promise<string | null> {
    try {
      const latestMatch = await this.matchCacheModel
        .findOne({ puuid, region })
        .sort({ 'matchData.info.gameCreation': -1 })
        .select('matchId')
        .exec();
      
      return latestMatch ? latestMatch.matchId : null;
    } catch (error) {
      this.logger.error(`Error getting latest match ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Cache a single match
   */
  async cacheMatch(
    puuid: string,
    region: string,
    matchId: string,
    matchData: any,
  ): Promise<void> {
    try {
      await this.matchCacheModel.findOneAndUpdate(
        { matchId },
        {
          puuid,
          region,
          matchId,
          matchData,
          cachedAt: new Date(),
          lastAccessed: new Date(),
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      this.logger.error(`Error caching match ${matchId}: ${error.message}`);
    }
  }

  /**
   * Cache multiple matches
   */
  async cacheMatches(
    puuid: string,
    region: string,
    matches: any[],
  ): Promise<void> {
    try {
      const operations = matches.map(match => ({
        updateOne: {
          filter: { matchId: match.metadata.matchId },
          update: {
            $set: {
              puuid,
              region,
              matchId: match.metadata.matchId,
              matchData: match,
              cachedAt: new Date(),
              lastAccessed: new Date(),
            }
          },
          upsert: true,
        }
      }));

      if (operations.length > 0) {
        await this.matchCacheModel.bulkWrite(operations);
        this.logger.log(`Cached ${operations.length} matches for ${puuid}`);
      }
    } catch (error) {
      this.logger.error(`Error caching matches: ${error.message}`);
    }
  }

  /**
   * Get match IDs that are already cached
   */
  async getExistingMatchIds(matchIds: string[]): Promise<string[]> {
    try {
      const cachedMatches = await this.matchCacheModel
        .find({ matchId: { $in: matchIds } })
        .select('matchId')
        .exec();
      
      return cachedMatches.map(m => m.matchId);
    } catch (error) {
      this.logger.error(`Error getting existing match IDs: ${error.message}`);
      return [];
    }
  }

  /**
   * Get new matches that need to be fetched
   */
  async getNewMatchIds(
    puuid: string,
    region: string,
    allMatchIds: string[],
  ): Promise<string[]> {
    try {
      const existingIds = await this.getExistingMatchIds(allMatchIds);
      return allMatchIds.filter(id => !existingIds.includes(id));
    } catch (error) {
      this.logger.error(`Error getting new match IDs: ${error.message}`);
      return allMatchIds;
    }
  }

  /**
   * Clean up old cached matches (keep last 100 per user)
   */
  async cleanupOldMatches(puuid: string, region: string): Promise<void> {
    try {
      const allMatches = await this.matchCacheModel
        .find({ puuid, region })
        .sort({ cachedAt: -1 })
        .select('_id')
        .exec();

      if (allMatches.length > 100) {
        const idsToDelete = allMatches.slice(100).map(m => m._id);
        await this.matchCacheModel.deleteMany({ _id: { $in: idsToDelete } });
        this.logger.log(`Cleaned up ${idsToDelete.length} old matches for ${puuid}`);
      }
    } catch (error) {
      this.logger.error(`Error cleaning up old matches: ${error.message}`);
    }
  }

  /**
   * Clear all cached matches for a user
   */
  async clearUserCache(puuid: string, region: string): Promise<void> {
    try {
      await this.matchCacheModel.deleteMany({ puuid, region });
      this.logger.log(`Cleared cache for ${puuid}`);
    } catch (error) {
      this.logger.error(`Error clearing user cache: ${error.message}`);
    }
  }
}
