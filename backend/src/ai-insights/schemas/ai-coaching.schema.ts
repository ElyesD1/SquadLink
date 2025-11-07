import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AICoachingDocument = AICoaching & Document;

@Schema({ timestamps: true })
export class AICoaching {
  @Prop({ required: true, index: true })
  matchId: string;

  @Prop({ required: true, index: true })
  puuid: string;

  @Prop({ required: true })
  summonerName: string;

  @Prop({ required: true })
  championName: string;

  @Prop({ required: true })
  championId: number;

  @Prop({ required: true })
  role: string;

  @Prop({ type: Object, required: true })
  matchData: {
    gameMode: string;
    queueId: number;
    gameDuration: number;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    championLevel: number;
    totalDamageDealt: number;
    totalDamageDealtToChampions: number;
    totalDamageTaken: number;
    goldEarned: number;
    goldSpent: number;
    totalMinionsKilled: number;
    neutralMinionsKilled: number;
    visionScore: number;
    wardsPlaced: number;
    wardsKilled: number;
    controlWardsPlaced: number;
    items: number[];
    summoner1Id: number;
    summoner2Id: number;
    perks: any;
    challenges?: any;
  };

  @Prop({ type: Object, required: true })
  coaching: {
    overallPerformance: string;
    strengths: string[];
    weaknesses: string[];
    
    // Detailed Assessments
    buildAssessment: {
      earlyGame: string;
      midGame: string;
      lateGame: string;
      itemTimings: string;
      overall: string;
    };
    tacticalAssessment: {
      laning: string;
      teamfighting: string;
      objectiveControl: string;
      mapAwareness: string;
    };
    skillAssessment: {
      mechanics: string;
      decisionMaking: string;
      adaptability: string;
    };
    strategicAssessment: {
      gamePlan: string;
      tempo: string;
      winConditions: string;
    };
    
    // Legacy fields for backwards compatibility
    itemBuildAnalysis: string;
    visionControl: string;
    farmingEfficiency: string;
    fightingStyle: string;
    
    recommendations: string[];
    keyTakeaways: string[];
  };

  @Prop({ type: Object })
  timelineData?: {
    itemPurchases: Array<{ timestamp: number; itemId: number }>;
    kills: Array<{ timestamp: number; victimId: number }>;
    deaths: Array<{ timestamp: number; killerId: number }>;
    levelProgression: Array<{ timestamp: number; level: number }>;
    goldProgression: Array<{ timestamp: number; gold: number }>;
  };

  @Prop({ default: Date.now, expires: 604800 }) // 7 days TTL
  createdAt: Date;
}

export const AICoachingSchema = SchemaFactory.createForClass(AICoaching);

// Compound index for efficient lookups
AICoachingSchema.index({ matchId: 1, puuid: 1 }, { unique: true });
