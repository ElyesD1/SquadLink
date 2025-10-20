import { Controller, Get, Query, Res, HttpStatus, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { DiscordService } from './discord.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Party } from '../party/entities/party.entity';

@Controller('discord')
export class DiscordController {
  constructor(
    private readonly discordService: DiscordService,
    @InjectModel(Party.name) private partyModel: Model<Party>,
  ) {}

  /**
   * Initiates Discord OAuth flow
   * GET /discord/auth?userEmail=user@example.com&partyId=123
   */
  @Get('auth')
  async initiateOAuth(
    @Query('userEmail') userEmail: string,
    @Query('partyId') partyId: string,
    @Res() res: Response,
  ) {
    if (!userEmail) {
      throw new BadRequestException('userEmail is required');
    }

    // Store userEmail and partyId in state parameter (encode as base64)
    const state = Buffer.from(JSON.stringify({ userEmail, partyId })).toString('base64');
    
    const authUrl = this.discordService.getAuthorizationUrl(state);
    
    return res.redirect(authUrl);
  }

  /**
   * Discord OAuth callback
   * GET /discord/callback?code=CODE&state=STATE
   */
  @Get('callback')
  async handleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      if (!code) {
        throw new BadRequestException('Authorization code is required');
      }

      // Decode state to get userEmail and partyId
      const { userEmail, partyId } = JSON.parse(
        Buffer.from(state, 'base64').toString('utf-8'),
      );

      // Get party to find voice channel
      const party = await this.partyModel.findById(partyId);
      const voiceChannelId = party?.discordVoiceChannel?.channelId;

      // Exchange code for access token
      const tokenData = await this.discordService.getAccessToken(code);

      // Get Discord user info
      const discordUser = await this.discordService.getDiscordUser(tokenData.access_token);

      // Add user to Discord guild and auto-move to voice channel if party has one
      await this.discordService.addUserToGuild(
        tokenData.access_token, 
        discordUser.id,
        voiceChannelId,
      );

      // Link Discord account to user
      await this.discordService.linkDiscordAccount(userEmail, {
        discordId: discordUser.id,
        discordUsername: `${discordUser.username}#${discordUser.discriminator}`,
        discordAvatar: discordUser.avatar,
      });

      // Redirect back to frontend with success
      return res.redirect(
        `http://localhost:3000/parties?discord=success`,
      );
    } catch (error) {
      console.error('Discord OAuth error:', error);
      return res.redirect(
        `http://localhost:3000/parties?discord=error`,
      );
    }
  }

  /**
   * Create voice channel for party
   * POST /discord/voice-channel?partyId=123&partyName=My Party
   */
  @Get('voice-channel')
  async createVoiceChannel(
    @Query('partyId') partyId: string,
    @Query('partyName') partyName: string,
  ) {
    if (!partyId || !partyName) {
      throw new BadRequestException('partyId and partyName are required');
    }

    const allocation = await this.discordService.createVoiceChannelForParty(
      partyId,
      partyName,
    );

    return {
      success: true,
      data: allocation,
    };
  }
}
