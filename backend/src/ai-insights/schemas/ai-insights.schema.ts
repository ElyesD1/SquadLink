import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AIInsightsDocument = AIInsights & Document;

@Schema({ timestamps: true })
export class AIInsights {
  @Prop({ required: true, index: true })
  puuid: string;

  @Prop({ required: true })
  gameName: string;

  @Prop({ required: true })
  tagLine: string;

  @Prop({ required: true })
  region: string;

  @Prop({ required: true })
  matchCount: number;

  @Prop({ required: true, index: true })
  matchDataHash: string; // Hash of match data to enable cache matching

  @Prop({ type: Object })
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
    winRate: string;
    avgKDA: string;
    avgKills: string;
    avgDeaths: string;
    avgAssists: string;
    avgDamage: number;
    avgGold: number;
    avgCS: string;
    longestWinStreak: number;
    longestLossStreak: number;
    currentStreak: number;
    favoriteRole: string;
    favoriteGameMode: string;
    multikills: {
      double: number;
      triple: number;
      quadra: number;
      penta: number;
    };
    pentaKillGames: Array<{
      matchId: string;
      champion: string;
      championId: number;
    }>;
  };

  @Prop({ type: Array })
  topChampions: Array<{
    championId: number;
    name: string;
    games: number;
    wins: number;
    losses: number;
    winRate: string;
    avgKDA: string;
  }>;

  @Prop({ type: Array })
  worstChampions: Array<{
    championId: number;
    name: string;
    games: number;
    wins: number;
    losses: number;
    winRate: string;
    avgKDA: string;
  }>;

  @Prop({ type: Array })
  bestTeammates: Array<{
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: string;
  }>;

  @Prop({ type: Array })
  worstTeammates: Array<{
    puuid: string;
    gameName: string;
    tagLine: string;
    profileIconId: number;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: string;
  }>;

  @Prop({ type: Array })
  strengths: string[];

  @Prop({ type: Array })
  weaknesses: string[];

  @Prop({ type: String })
  summary: string; // AI-generated narrative summary

  @Prop({ type: Object })
  gameModeStats: {
    [queueId: string]: {
      games: number;
      wins: number;
      winRate: string;
    };
  };

  @Prop()
  expiresAt: Date; // Cache expiration (e.g., 7 days)
}

export const AIInsightsSchema = SchemaFactory.createForClass(AIInsights);

// Create indexes
AIInsightsSchema.index({ puuid: 1, matchDataHash: 1 });
AIInsightsSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for automatic deletion
