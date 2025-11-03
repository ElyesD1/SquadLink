import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MatchCache extends Document {
  @Prop({ required: true, index: true })
  puuid: string;

  @Prop({ required: true, index: true })
  region: string;

  @Prop({ required: true, unique: true, index: true })
  matchId: string;

  @Prop({ type: Object, required: true })
  matchData: any; // Full match data from Riot API

  @Prop({ default: Date.now })
  cachedAt: Date;

  @Prop({ default: Date.now })
  lastAccessed: Date;
}

export const MatchCacheSchema = SchemaFactory.createForClass(MatchCache);

// Create compound index for efficient queries
MatchCacheSchema.index({ puuid: 1, region: 1, cachedAt: -1 });
MatchCacheSchema.index({ 'matchData.info.gameCreation': -1 }); // Index for sorting by game time
MatchCacheSchema.index({ matchId: 1 }, { unique: true }); // Ensure unique match IDs
