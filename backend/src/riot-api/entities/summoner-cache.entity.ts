import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class SummonerCache extends Document {
  @Prop({ required: true, unique: true, index: true })
  puuid: string;

  @Prop({ required: true, index: true })
  region: string;

  @Prop({ index: true })
  gameName: string;

  @Prop({ index: true })
  tagLine: string;

  @Prop({ type: Object, required: true })
  summonerData: any; // Full summoner data from Riot API

  @Prop({ type: [String], default: [] })
  tags: string[]; // Player insights tags (e.g., "Good Laner", "Pacifist", etc.)

  @Prop({ type: Object, default: {} })
  tagMetadata: any; // Additional metadata for tags (stats used to generate them)

  @Prop({ default: Date.now })
  cachedAt: Date;

  @Prop({ default: Date.now })
  lastAccessed: Date;

  @Prop({ default: Date.now })
  tagsLastUpdated: Date;
}

export const SummonerCacheSchema = SchemaFactory.createForClass(SummonerCache);

// Create compound index for efficient queries
SummonerCacheSchema.index({ puuid: 1, region: 1 });
SummonerCacheSchema.index({ gameName: 1, tagLine: 1 }); // For searching by Riot ID
