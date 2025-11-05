import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { RiotApiService } from '../riot-api/riot-api.service';
import { firstValueFrom } from 'rxjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private riotApiService: RiotApiService,
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

  // League of Legends Account Management
  async linkLolAccount(email: string, gameName: string, tagline: string, region?: string): Promise<User | null> {
    try {
      // Search for the summoner to validate the account exists
      const summonerProfile = await firstValueFrom(
        this.riotApiService.searchSummoner(gameName, tagline, region)
      );

      if (!summonerProfile) {
        throw new NotFoundException('Summoner not found');
      }

      // Prepare the LoL account data
      const lolAccount = {
        puuid: summonerProfile.account.puuid,
        gameName: summonerProfile.account.gameName,
        tagLine: summonerProfile.account.tagLine,
        region: summonerProfile.region,
        summonerLevel: summonerProfile.summoner.summonerLevel,
        profileIconId: summonerProfile.summoner.profileIconId,
        rankedData: summonerProfile.rankedData.map(rank => ({
          queueType: rank.queueType,
          tier: rank.tier,
          rank: rank.rank,
          leaguePoints: rank.leaguePoints,
          wins: rank.wins,
          losses: rank.losses,
        })),
        lastUpdated: new Date(),
      };

      // Update the user with the LoL account data
      return this.userModel.findOneAndUpdate(
        { email },
        { lolAccount },
        { new: true }
      ).select('-password').exec();

    } catch (error) {
      throw new BadRequestException(`Failed to link LoL account: ${error.message}`);
    }
  }

  async unlinkLolAccount(email: string): Promise<User | null> {
    return this.userModel.findOneAndUpdate(
      { email },
      { $unset: { lolAccount: 1 } },
      { new: true }
    ).select('-password').exec();
  }

  async refreshLolAccount(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    
    if (!user || !user.lolAccount) {
      throw new NotFoundException('No linked LoL account found');
    }

    try {
      console.log('[UsersService] Refreshing LoL account for:', email);
      console.log('[UsersService] Current account data:', user.lolAccount);
      
      // Re-fetch the summoner data using stored account info
      const summonerProfile = await firstValueFrom(
        this.riotApiService.searchSummoner(
          user.lolAccount.gameName, 
          user.lolAccount.tagLine, 
          user.lolAccount.region
        )
      );

      if (!summonerProfile) {
        throw new NotFoundException('Summoner not found during refresh');
      }

      console.log('[UsersService] Fetched summoner profile:', summonerProfile);

      // Update the LoL account data
      const updatedLolAccount = {
        puuid: user.lolAccount.puuid,
        gameName: user.lolAccount.gameName,
        tagLine: user.lolAccount.tagLine,
        region: user.lolAccount.region,
        summonerLevel: summonerProfile.summoner.summonerLevel,
        profileIconId: summonerProfile.summoner.profileIconId,
        rankedData: summonerProfile.rankedData.map(rank => ({
          queueType: rank.queueType,
          tier: rank.tier,
          rank: rank.rank,
          leaguePoints: rank.leaguePoints,
          wins: rank.wins,
          losses: rank.losses,
        })),
        lastUpdated: new Date(),
      };

      console.log('[UsersService] Updated account data:', updatedLolAccount);

      const updatedUser = await this.userModel.findOneAndUpdate(
        { email },
        { lolAccount: updatedLolAccount },
        { new: true }
      ).select('-password').exec();

      console.log('[UsersService] User after update:', updatedUser?.lolAccount);

      return updatedUser;

    } catch (error) {
      console.error('[UsersService] Refresh error:', error);
      throw new BadRequestException(`Failed to refresh LoL account: ${error.message}`);
    }
  }
}
