import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = new this.userModel(userData);
    return user.save();
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    return this.userModel.findByIdAndUpdate(id, userData, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.userModel.findByIdAndDelete(id).exec();
  }

  async updateGamePreferences(email: string, gamePreferences: string[]): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { gamePreferences },
      { new: true }
    ).select('-password').exec();
  }

  async addGamePreference(email: string, game: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $addToSet: { gamePreferences: game } },
      { new: true }
    ).select('-password').exec();
  }

  async removeGamePreference(email: string, game: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $pull: { gamePreferences: game } },
      { new: true }
    ).select('-password').exec();
  }

  async updateProfilePicture(email: string, profilePicture: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { profilePicture },
      { new: true }
    ).select('-password').exec();
  }

  async updateThemePreference(email: string, theme: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { themePreference: theme },
      { new: true }
    ).select('-password').exec();
  }

  async getFullProfile(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('-password').exec();
  }
}
