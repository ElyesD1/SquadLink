import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SummonerCache extends Document {
  @Prop({ required: true, unique: true, index: true })
  puuid: string;

  @Prop({ required: true, index: true })
  region: string;

  @Prop({ type: Object, required: true })
  summonerData: any; // Full summoner data from Riot API

  @Prop({ default: Date.now })
  cachedAt: Date;

  @Prop({ default: Date.now })
  lastAccessed: Date;

  // Cache expiration (24 hours by default)
  @Prop({ default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) })
  expiresAt: Date;
}

export const SummonerCacheSchema = SchemaFactory.createForClass(SummonerCache);

// Create compound index for efficient queries
SummonerCacheSchema.index({ puuid: 1, region: 1 });
SummonerCacheSchema.index({ expiresAt: 1 }); // For automatic cleanup of expired entries
