import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/entities/user.entity';
import axios from 'axios';

const DISCORD_API_URL = 'https://discord.com/api/v10';

interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}

export interface VoiceChannelAllocation {
  channelId: string;
  channelName: string;
  inviteUrl: string;
  partyId: string;
}

@Injectable()
export class DiscordService {
  constructor(
    private configService: ConfigService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  /**
   * Generate Discord OAuth2 authorization URL
   */
  getAuthorizationUrl(state?: string): string {
    const clientId = this.configService.get('DISCORD_CLIENT_ID');
    const redirectUri = this.configService.get('DISCORD_REDIRECT_URI');
    const scopes = ['identify', 'email', 'guilds.join'];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
    });

    if (state) {
      params.append('state', state);
    }

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async getAccessToken(code: string): Promise<DiscordTokenResponse> {
    const clientId = this.configService.get('DISCORD_CLIENT_ID');
    const clientSecret = this.configService.get('DISCORD_CLIENT_SECRET');
    const redirectUri = this.configService.get('DISCORD_REDIRECT_URI');

    try {
      const response = await axios.post(
        `${DISCORD_API_URL}/oauth2/token`,
        new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to exchange code for token');
    }
  }

  /**
   * Get Discord user information
   */
  async getDiscordUser(accessToken: string): Promise<DiscordUser> {
    try {
      const response = await axios.get(`${DISCORD_API_URL}/users/@me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new BadRequestException('Failed to fetch Discord user');
    }
  }

  /**
   * Add user to Discord guild and move to voice channel if party has one
   */
  async addUserToGuild(accessToken: string, discordUserId: string, partyVoiceChannelId?: string): Promise<void> {
    const guildId = this.configService.get('DISCORD_GUILD_ID');
    const botToken = this.configService.get('DISCORD_BOT_TOKEN');

    try {
      const requestBody: any = {
        access_token: accessToken,
      };

      // If party has a voice channel, auto-move user to it
      if (partyVoiceChannelId) {
        requestBody.channel_id = partyVoiceChannelId;
      }

      await axios.put(
        `${DISCORD_API_URL}/guilds/${guildId}/members/${discordUserId}`,
        requestBody,
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      // User might already be in the guild, which is fine
      if (error.response?.status !== 204) {
        console.error('Failed to add user to guild:', error.response?.data);
      }
    }
  }

  /**
   * Create a voice channel for a party
   */
  async createVoiceChannelForParty(
    partyId: string,
    partyName: string,
  ): Promise<VoiceChannelAllocation> {
    const guildId = this.configService.get('DISCORD_GUILD_ID');
    const botToken = this.configService.get('DISCORD_BOT_TOKEN');

    try {
      // Create voice channel
      const channelResponse = await axios.post(
        `${DISCORD_API_URL}/guilds/${guildId}/channels`,
        {
          name: `🎮 ${partyName}`,
          type: 2, // Voice channel
          user_limit: 5, // Max users (adjust based on party game mode)
        },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const channelId = channelResponse.data.id;

      // Create invite link that opens the voice channel
      const inviteResponse = await axios.post(
        `${DISCORD_API_URL}/channels/${channelId}/invites`,
        {
          max_age: 86400, // 24 hours (matches party expiration)
          max_uses: 0, // Unlimited uses
          unique: true,
          target_type: 1, // Voice channel activity
        },
        {
          headers: {
            Authorization: `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        channelId,
        channelName: channelResponse.data.name,
        inviteUrl: `https://discord.gg/${inviteResponse.data.code}`,
        partyId,
      };
    } catch (error) {
      console.error('Failed to create voice channel:', error.response?.data);
      throw new BadRequestException('Failed to create Discord voice channel');
    }
  }

  /**
   * Delete a voice channel
   */
  async deleteVoiceChannel(channelId: string): Promise<void> {
    const botToken = this.configService.get('DISCORD_BOT_TOKEN');

    try {
      await axios.delete(`${DISCORD_API_URL}/channels/${channelId}`, {
        headers: {
          Authorization: `Bot ${botToken}`,
        },
      });
    } catch (error) {
      console.error('Failed to delete voice channel:', error.response?.data);
    }
  }

  /**
   * Link Discord account to user
   */
  async linkDiscordAccount(
    userEmail: string,
    discordData: {
      discordId: string;
      discordUsername: string;
      discordAvatar: string | null;
    },
  ): Promise<User> {
    const user = await this.userModel.findOne({ email: userEmail });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    user.discordId = discordData.discordId;
    user.discordUsername = discordData.discordUsername;
    user.discordAvatar = discordData.discordAvatar ?? undefined;

    return await user.save();
  }
}
