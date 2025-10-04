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

  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
