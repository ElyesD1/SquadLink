import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  password?: string;

  @Prop({ required: true })
  age: number;

  @Prop()
  googleId?: string;

  @Prop()
  profilePicture?: string;

  @Prop({ default: 'local' })
  provider: string; // 'local' or 'google'

  @Prop({ type: [String], default: [] })
  gamePreferences: string[];

  @Prop({ default: 'dark' })
  themePreference: string; // 'light' or 'dark'

  // League of Legends account data
  @Prop({
    type: {
      puuid: String,
      gameName: String,
      tagLine: String,
      region: String,
      summonerLevel: Number,
      profileIconId: Number,
      rankedData: [{
        queueType: String,
        tier: String,
        rank: String,
        leaguePoints: Number,
        wins: Number,
        losses: Number,
      }],
      lastUpdated: Date,
    }
  })
  lolAccount?: {
    puuid: string;
    gameName: string;
    tagLine: string;
    region: string;
    summonerLevel: number;
    profileIconId: number;
    rankedData: Array<{
      queueType: string;
      tier: string;
      rank: string;
      leaguePoints: number;
      wins: number;
      losses: number;
    }>;
    lastUpdated: Date;
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
