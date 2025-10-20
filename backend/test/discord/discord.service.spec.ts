import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException } from '@nestjs/common';
import { DiscordService, VoiceChannelAllocation } from '../../src/discord/discord.service';
import { ConfigService } from '@nestjs/config';
import { User } from '../../src/users/entities/user.entity';
import axios from 'axios';
import sinon from 'sinon';

describe('DiscordService', () => {
  let service: DiscordService;
  let configService: sinon.SinonStubbedInstance<ConfigService>;
  let userModel: sinon.SinonStubbedInstance<any>;
  let axiosPostStub: sinon.SinonStub;
  let axiosGetStub: sinon.SinonStub;
  let axiosPutStub: sinon.SinonStub;
  let axiosDeleteStub: sinon.SinonStub;

  const mockUser = {
    _id: 'userId123',
    email: 'test@example.com',
    discordId: null,
    discordUsername: null,
    discordAvatar: null,
    save: sinon.stub(),
  };

  beforeEach(async () => {
    const mockConfigService = {
      get: sinon.stub(),
    };

    const mockUserModel = {
      findOne: sinon.stub(),
    };

    // Mock axios methods individually
    axiosPostStub = sinon.stub(axios, 'post');
    axiosGetStub = sinon.stub(axios, 'get');
    axiosPutStub = sinon.stub(axios, 'put');
    axiosDeleteStub = sinon.stub(axios, 'delete');

    (mockConfigService.get as sinon.SinonStub)
      .withArgs('DISCORD_CLIENT_ID').returns('test-client-id')
      .withArgs('DISCORD_CLIENT_SECRET').returns('test-client-secret')
      .withArgs('DISCORD_REDIRECT_URI').returns('http://localhost:3000/auth/discord/callback')
      .withArgs('DISCORD_GUILD_ID').returns('test-guild-id')
      .withArgs('DISCORD_BOT_TOKEN').returns('test-bot-token');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DiscordService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<DiscordService>(DiscordService);
    configService = mockConfigService as any;
    userModel = mockUserModel as any;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(DiscordService);
  });

  describe('getAuthorizationUrl', () => {
    it('should generate authorization URL without state', () => {
      const url = service.getAuthorizationUrl();

      expect(url).to.include('https://discord.com/oauth2/authorize');
      expect(url).to.include('client_id=test-client-id');
      expect(url).to.include('redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fdiscord%2Fcallback');
      expect(url).to.include('scope=identify+email+guilds.join');
      expect(url).to.include('response_type=code');
    });

    it('should generate authorization URL with state', () => {
      const url = service.getAuthorizationUrl('test-state');

      expect(url).to.include('state=test-state');
    });
  });

  describe('getAccessToken', () => {
    it('should exchange code for access token successfully', async () => {
      const mockTokenResponse = {
        access_token: 'test-access-token',
        token_type: 'Bearer',
        expires_in: 604800,
        refresh_token: 'test-refresh-token',
        scope: 'identify email guilds.join',
      };

      axiosPostStub.resolves({ data: mockTokenResponse });

      const result = await service.getAccessToken('test-code');

      expect(result).to.deep.equal(mockTokenResponse);
      expect(axiosPostStub.calledOnce).to.be.true;
      expect(axiosPostStub.calledWith(
        'https://discord.com/api/v10/oauth2/token',
        sinon.match.instanceOf(URLSearchParams),
        sinon.match.object
      )).to.be.true;
    });

    it('should handle token exchange errors', async () => {
      axiosPostStub.rejects({ response: { status: 400 } });

      try {
        await service.getAccessToken('invalid-code');
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).to.be.instanceof(BadRequestException);
        expect(error.message).to.equal('Failed to exchange code for token');
      }
    });
  });

  describe('getDiscordUser', () => {
    it('should fetch Discord user successfully', async () => {
      const mockDiscordUser = {
        id: '123456789',
        username: 'testuser',
        discriminator: '1234',
        avatar: 'avatar-hash',
        email: 'test@example.com',
      };

      axiosGetStub.resolves({ data: mockDiscordUser });

      const result = await service.getDiscordUser('test-access-token');

      expect(result).to.deep.equal(mockDiscordUser);
      expect(axiosGetStub.calledWith(
        'https://discord.com/api/v10/users/@me',
        sinon.match.object
      )).to.be.true;
    });

    it('should handle user fetch errors', async () => {
      axiosGetStub.rejects({ response: { status: 401 } });

      try {
        await service.getDiscordUser('invalid-token');
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).to.be.instanceof(BadRequestException);
        expect(error.message).to.equal('Failed to fetch Discord user');
      }
    });
  });

  describe('addUserToGuild', () => {
    it('should add user to guild without voice channel', async () => {
      axiosPutStub.resolves({ status: 204 });

      await service.addUserToGuild('test-access-token', '123456789');

      expect(axiosPutStub.calledWith(
        'https://discord.com/api/v10/guilds/test-guild-id/members/123456789',
        { access_token: 'test-access-token' },
        sinon.match.object
      )).to.be.true;
    });

    it('should add user to guild with voice channel', async () => {
      axiosPutStub.resolves({ status: 204 });

      await service.addUserToGuild('test-access-token', '123456789', 'voice-channel-123');

      expect(axiosPutStub.calledWith(
        'https://discord.com/api/v10/guilds/test-guild-id/members/123456789',
        {
          access_token: 'test-access-token',
          channel_id: 'voice-channel-123'
        },
        sinon.match.object
      )).to.be.true;
    });

    it('should handle errors gracefully (except 204)', async () => {
      axiosPutStub.rejects({ response: { status: 400, data: 'Error' } });

      // Should not throw for non-204 errors
      await service.addUserToGuild('test-access-token', '123456789');
    });
  });

  describe('createVoiceChannelForParty', () => {
    it('should create voice channel and invite successfully', async () => {
      const mockChannelResponse = {
        id: 'channel-123',
        name: '🎮 Test Party',
      };

      const mockInviteResponse = {
        code: 'invite-code-123',
      };

      axiosPostStub.onFirstCall().resolves({ data: mockChannelResponse });
      axiosPostStub.onSecondCall().resolves({ data: mockInviteResponse });

      const result = await service.createVoiceChannelForParty('party-123', 'Test Party');

      const expected: VoiceChannelAllocation = {
        channelId: 'channel-123',
        channelName: '🎮 Test Party',
        inviteUrl: 'https://discord.gg/invite-code-123',
        partyId: 'party-123',
      };

      expect(result).to.deep.equal(expected);
    });

    it('should handle channel creation errors', async () => {
      axiosPostStub.rejects({ response: { status: 400, data: 'Error' } });

      try {
        await service.createVoiceChannelForParty('party-123', 'Test Party');
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).to.be.instanceof(BadRequestException);
        expect(error.message).to.equal('Failed to create Discord voice channel');
      }
    });
  });

  describe('deleteVoiceChannel', () => {
    it('should delete voice channel successfully', async () => {
      axiosDeleteStub.resolves({ status: 204 });

      await service.deleteVoiceChannel('channel-123');

      expect(axiosDeleteStub.calledWith(
        'https://discord.com/api/v10/channels/channel-123',
        sinon.match.object
      )).to.be.true;
    });

    it('should handle deletion errors gracefully', async () => {
      axiosDeleteStub.rejects({ response: { status: 400, data: 'Error' } });

      // Should not throw
      await service.deleteVoiceChannel('channel-123');
    });
  });

  describe('linkDiscordAccount', () => {
    it('should link Discord account to user successfully', async () => {
      const updatedUser = { ...mockUser };
      updatedUser.save.resolves(updatedUser);

      userModel.findOne.resolves(mockUser);

      const discordData = {
        discordId: '123456789',
        discordUsername: 'testuser#1234',
        discordAvatar: 'avatar-hash',
      };

      const result = await service.linkDiscordAccount('test@example.com', discordData);

      expect(userModel.findOne.calledWith({ email: 'test@example.com' })).to.be.true;
      expect(mockUser.discordId).to.equal('123456789');
      expect(mockUser.discordUsername).to.equal('testuser#1234');
      expect(mockUser.discordAvatar).to.equal('avatar-hash');
      expect(mockUser.save.calledOnce).to.be.true;
      expect(result).to.equal(updatedUser);
    });

    it('should handle null avatar', async () => {
      const updatedUser = { ...mockUser };
      updatedUser.save.resolves(updatedUser);

      userModel.findOne.resolves(mockUser);

      const discordData = {
        discordId: '123456789',
        discordUsername: 'testuser#1234',
        discordAvatar: null,
      };

      await service.linkDiscordAccount('test@example.com', discordData);

      expect(mockUser.discordAvatar).to.be.undefined;
    });

    it('should throw error if user not found', async () => {
      userModel.findOne.resolves(null);

      try {
        await service.linkDiscordAccount('nonexistent@example.com', {
          discordId: '123',
          discordUsername: 'user',
          discordAvatar: null,
        });
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error).to.be.instanceof(BadRequestException);
        expect(error.message).to.equal('User not found');
      }
    });
  });
});