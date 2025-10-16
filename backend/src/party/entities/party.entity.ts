import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PartyDocument = Party & Document;

export enum GameMode {
  ARAM = 'aram',
  RANKED_FLEX = 'ranked_flex',
  DRAFT_PICK = 'draft_pick',
  RANKED_SOLO_DUO = 'ranked_solo_duo',
}

export enum PartyStatus {
  OPEN = 'open',
  IN_GAME = 'in_game',
  CLOSED = 'closed',
}

export enum Position {
  TOP = 'top',
  JUNGLE = 'jungle',
  MID = 'mid',
  BOT = 'bot',
  SUPPORT = 'support',
}

export interface PartyMember {
  userId: string;
  username: string;
  profilePicture?: string;
  joinedAt: Date;
  isReady: boolean;
  position?: Position;
  lolAccount?: {
    gameName: string;
    tagLine: string;
    profileIconId?: number;
    rank?: string;
    tier?: string;
    rankedData?: Array<{
      queueType: string;
      tier: string;
      rank: string;
    }>;
  };
}

export interface JoinRequest {
  userId: string;
  username: string;
  profilePicture?: string;
  requestedAt: Date;
  message?: string;
  requestedPosition?: Position;
  lolAccount?: {
    gameName: string;
    tagLine: string;
    rank?: string;
    tier?: string;
  };
}

@Schema({ timestamps: true })
export class Party {
  @Prop({ required: true, trim: true, maxlength: 50 })
  name: string;

  @Prop({ required: true, enum: GameMode })
  gameMode: GameMode;

  @Prop({ required: true })
  maxPlayers: number;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  creatorId: Types.ObjectId;

  @Prop({ required: true })
  creatorUsername: string;

  @Prop({ type: [Object], default: [] })
  members: PartyMember[];

  @Prop({ type: [Object], default: [] })
  joinRequests: JoinRequest[];

  @Prop({ enum: PartyStatus, default: PartyStatus.OPEN })
  status: PartyStatus;

  @Prop({ maxlength: 200 })
  description?: string;

  @Prop({ default: false })
  isPrivate: boolean;

  @Prop()
  inviteCode?: string;

  @Prop({ type: Object })
  preferences?: {
    minRank?: string;
    maxRank?: string;
    voiceChat?: boolean;
    language?: string;
    playstyle?: string[];
  };

  @Prop({ type: Date })
  scheduledFor?: Date;

  @Prop({ type: Date })
  expiresAt?: Date;

  @Prop({ type: Object })
  discordVoiceChannel?: {
    channelId: string;
    channelName: string;
    inviteUrl: string;
    createdAt: Date;
  };

  createdAt: Date;
  updatedAt: Date;
}

export const PartySchema = SchemaFactory.createForClass(Party);

// Add indexes for better query performance
PartySchema.index({ status: 1, gameMode: 1 });
PartySchema.index({ creatorId: 1 });
PartySchema.index({ 'members.userId': 1 });
PartySchema.index({ createdAt: -1 });
PartySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Helper method to get max players based on game mode
PartySchema.methods.getMaxPlayersForGameMode = function(gameMode: GameMode): number {
  switch (gameMode) {
    case GameMode.RANKED_SOLO_DUO:
      return 2;
    case GameMode.ARAM:
    case GameMode.RANKED_FLEX:
    case GameMode.DRAFT_PICK:
      return 5;
    default:
      return 5;
  }
};

// Helper method to check if party is full
PartySchema.methods.isFull = function(): boolean {
  return this.members.length >= this.maxPlayers;
};

// Helper method to check if user is a member
PartySchema.methods.hasMember = function(userId: string): boolean {
  return this.members.some(member => member.userId === userId);
};

// Helper method to check if user has pending request
PartySchema.methods.hasPendingRequest = function(userId: string): boolean {
  return this.joinRequests.some(request => request.userId === userId);
};