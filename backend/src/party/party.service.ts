import { Injectable, NotFoundException, BadRequestException, ForbiddenException, forwardRef, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Party, PartyDocument, GameMode, PartyStatus, PartyMember, JoinRequest, Position } from './entities/party.entity';
import { CreatePartyDto, UpdatePartyDto, JoinPartyRequestDto, HandleJoinRequestDto, PartyFiltersDto, KickMemberDto, UpdateMemberStatusDto } from './dto/party.dto';
import { User } from '../users/entities/user.entity';
import { DiscordService } from '../discord/discord.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PartyService {
  private gateway: any; // Will be injected later to avoid circular dependency

  constructor(
    @InjectModel(Party.name) private partyModel: Model<PartyDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    private discordService: DiscordService,
  ) {}

  // Method to set gateway reference (called from module)
  setGateway(gateway: any) {
    this.gateway = gateway;
  }

  async create(createPartyDto: CreatePartyDto, creatorId: string): Promise<Party> {
    const creator = await this.userModel.findById(creatorId);
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    // Check if user is already in a party
    const existingParty = await this.findUserActiveParty(creatorId);
    if (existingParty) {
      throw new BadRequestException('You are already in a party. Leave your current party first.');
    }

    // Determine max players based on game mode
    const maxPlayers = this.getMaxPlayersForGameMode(createPartyDto.gameMode);

    // Create the party
    const party = new this.partyModel({
      ...createPartyDto,
      maxPlayers,
      creatorId: new Types.ObjectId(creatorId),
      creatorUsername: `${creator.firstName} ${creator.lastName}`,
      members: [{
        userId: creatorId,
        username: `${creator.firstName} ${creator.lastName}`,
        profilePicture: creator.profilePicture,
        joinedAt: new Date(),
        isReady: true,
        lolAccount: creator.lolAccount ? {
          gameName: creator.lolAccount.gameName,
          tagLine: creator.lolAccount.tagLine,
          rank: creator.lolAccount.rankedData?.[0]?.rank,
          tier: creator.lolAccount.rankedData?.[0]?.tier,
        } : undefined,
      }],
      inviteCode: createPartyDto.isPrivate ? uuidv4().slice(0, 8) : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    const savedParty = await party.save();
    
    // Auto-create Discord voice channel
    try {
      const voiceChannel = await this.discordService.createVoiceChannelForParty(
        (savedParty._id as any).toString(),
        savedParty.name,
      );
      
      savedParty.discordVoiceChannel = {
        channelId: voiceChannel.channelId,
        channelName: voiceChannel.channelName,
        inviteUrl: voiceChannel.inviteUrl,
        createdAt: new Date(),
      };
      
      await savedParty.save();
    } catch (error) {
      console.error('Failed to create Discord voice channel:', error);
      // Continue without Discord channel if it fails
    }
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyPartyCreated(savedParty);
    }
    
    return savedParty;
  }

  async createByEmail(createPartyDto: CreatePartyDto): Promise<Party> {
    const creator = await this.userModel.findOne({ email: createPartyDto.creatorEmail });
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }

    const creatorId = (creator as any)._id.toString();

    // Check if user is already in a party
    const existingParty = await this.findUserActiveParty(creatorId);
    if (existingParty) {
      throw new BadRequestException('You are already in a party. Leave your current party first.');
    }

    // Determine max players based on game mode
    const maxPlayers = this.getMaxPlayersForGameMode(createPartyDto.gameMode);

    // Validate position for non-ARAM modes
    if (createPartyDto.gameMode !== GameMode.ARAM && !createPartyDto.creatorPosition) {
      throw new BadRequestException('Position is required for this game mode');
    }

    // Validate position not allowed for ARAM
    if (createPartyDto.gameMode === GameMode.ARAM && createPartyDto.creatorPosition) {
      throw new BadRequestException('Position selection is not allowed for ARAM mode');
    }

    // Create the party
    const party = new this.partyModel({
      ...createPartyDto,
      maxPlayers,
      creatorId: new Types.ObjectId(creatorId),
      creatorUsername: `${creator.firstName} ${creator.lastName}`,
      members: [{
        userId: creatorId,
        username: `${creator.firstName} ${creator.lastName}`,
        profilePicture: creator.profilePicture,
        joinedAt: new Date(),
        isReady: true,
        position: createPartyDto.creatorPosition,
        lolAccount: creator.lolAccount ? {
          gameName: creator.lolAccount.gameName,
          tagLine: creator.lolAccount.tagLine,
          profileIconId: creator.lolAccount.profileIconId,
          rank: creator.lolAccount.rankedData?.[0]?.rank,
          tier: creator.lolAccount.rankedData?.[0]?.tier,
          rankedData: creator.lolAccount.rankedData,
        } : undefined,
      }],
      inviteCode: createPartyDto.isPrivate ? uuidv4().slice(0, 8) : undefined,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    });

    const savedParty = await party.save();
    
    // Auto-create Discord voice channel
    try {
      const voiceChannel = await this.discordService.createVoiceChannelForParty(
        (savedParty._id as any).toString(),
        savedParty.name,
      );
      
      savedParty.discordVoiceChannel = {
        channelId: voiceChannel.channelId,
        channelName: voiceChannel.channelName,
        inviteUrl: voiceChannel.inviteUrl,
        createdAt: new Date(),
      };
      
      await savedParty.save();
    } catch (error) {
      console.error('Failed to create Discord voice channel:', error);
      // Continue without Discord channel if it fails
    }
    
    // Populate creator information
    const populatedParty = await this.partyModel
      .findById(savedParty._id)
      .populate('creatorId', 'firstName lastName email profilePicture lolAccount')
      .exec();
    
    if (!populatedParty) {
      throw new Error('Failed to retrieve created party');
    }
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyPartyCreated(populatedParty);
    }
    
    // Transform to include creator object
    const partyObj = populatedParty.toObject();
    const creatorData = partyObj.creatorId as any;
    const result = {
      ...partyObj,
      creator: creatorData ? {
        _id: creatorData._id,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        email: creatorData.email,
        profilePicture: creatorData.profilePicture,
        lolAccount: creatorData.lolAccount,
      } : null
    };
    
    return result as any;
  }

  async findAll(filters: PartyFiltersDto = {}): Promise<{ parties: Party[], total: number }> {
    const query: any = {};

    if (filters.gameMode) {
      query.gameMode = filters.gameMode;
    }

    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { creatorUsername: { $regex: filters.search, $options: 'i' } },
      ];
    }

    // Build visibility query
    let finalQuery: any = { ...query };

    if (filters.userId) {
      // If userId is provided, show:
      // 1. All open parties (public)
      // 2. Closed parties where the user is a member
      finalQuery.$or = [
        { status: PartyStatus.OPEN },
        {
          status: PartyStatus.CLOSED,
          'members.userId': filters.userId
        }
      ];
    } else {
      // If no userId, only show open parties
      finalQuery.status = PartyStatus.OPEN;
    }

    // Don't show private parties in public listing (unless user is a member)
    if (!filters.userId) {
      finalQuery.isPrivate = { $ne: true };
    }

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    const [parties, total] = await Promise.all([
      this.partyModel
        .find(finalQuery)
        .populate('creatorId', 'firstName lastName email profilePicture lolAccount')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset)
        .exec(),
      this.partyModel.countDocuments(finalQuery),
    ]);

    // Transform parties to include creator object
    const transformedParties = parties.map(party => {
      const partyObj = party.toObject();
      const creator = partyObj.creatorId as any;
      return {
        ...partyObj,
        creator: creator ? {
          _id: creator._id,
          firstName: creator.firstName,
          lastName: creator.lastName,
          email: creator.email,
          profilePicture: creator.profilePicture,
          lolAccount: creator.lolAccount,
        } : null
      };
    });

    return { parties: transformedParties as any, total };
  }

  async findOne(id: string): Promise<Party> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid party ID');
    }

    const party = await this.partyModel
      .findById(id)
      .populate('creatorId', 'firstName lastName email profilePicture lolAccount')
      .exec();
      
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    // Transform to include creator object
    const partyObj = party.toObject();
    const creatorData = partyObj.creatorId as any;
    const result = {
      ...partyObj,
      creator: creatorData ? {
        _id: creatorData._id,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        email: creatorData.email,
        profilePicture: creatorData.profilePicture,
        lolAccount: creatorData.lolAccount,
      } : null
    };

    return result as any;
  }

  // Helper method to get raw Mongoose document (for operations that need .save())
  private async findOneRaw(id: string): Promise<PartyDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid party ID');
    }

    const party = await this.partyModel.findById(id);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    return party;
  }

  async findByInviteCode(inviteCode: string): Promise<Party> {
    const party = await this.partyModel.findOne({ inviteCode, status: PartyStatus.OPEN });
    if (!party) {
      throw new NotFoundException('Invalid invite code or party no longer available');
    }

    return party;
  }

  async update(id: string, updatePartyDto: UpdatePartyDto, userId: string): Promise<Party> {
    const party = await this.findOneRaw(id);

    if (party.creatorId.toString() !== userId) {
      throw new ForbiddenException('Only the party creator can update the party');
    }

    Object.assign(party, updatePartyDto);
    const updatedParty = await party.save();
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyPartyUpdated(updatedParty);
    }
    
    return updatedParty;
  }

  async updateByEmail(id: string, updatePartyDto: UpdatePartyDto, userEmail: string): Promise<Party> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid party ID');
    }

    const party = await this.partyModel.findById(id).populate('creatorId', 'email').exec();
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    const creator = party.creatorId as any;
    if (creator.email !== userEmail) {
      throw new ForbiddenException('Only the party creator can update the party');
    }

    Object.assign(party, updatePartyDto);
    const updatedParty = await party.save();
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyPartyUpdated(updatedParty);
    }

    // Populate and transform the response
    const populatedParty = await this.partyModel
      .findById(updatedParty._id)
      .populate('creatorId', 'firstName lastName email profilePicture lolAccount')
      .exec();
    
    if (!populatedParty) {
      throw new Error('Failed to retrieve updated party');
    }

    const partyObj = populatedParty.toObject();
    const creatorData = partyObj.creatorId as any;
    const result = {
      ...partyObj,
      creator: creatorData ? {
        _id: creatorData._id,
        firstName: creatorData.firstName,
        lastName: creatorData.lastName,
        email: creatorData.email,
        profilePicture: creatorData.profilePicture,
        lolAccount: creatorData.lolAccount,
      } : null
    };
    
    return result as any;
  }

  async delete(id: string, userId: string): Promise<void> {
    const party = await this.findOneRaw(id);

    if (party.creatorId.toString() !== userId) {
      throw new ForbiddenException('Only the party creator can delete the party');
    }

    await this.partyModel.findByIdAndDelete(id);
  }

  async deleteByEmail(id: string, userEmail: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid party ID');
    }

    const party = await this.partyModel.findById(id).populate('creatorId', 'email').exec();
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    const creator = party.creatorId as any;
    if (creator.email !== userEmail) {
      throw new ForbiddenException('Only the party creator can delete the party');
    }

    await this.partyModel.findByIdAndDelete(id);
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyPartyDeleted(id);
    }
  }

  async requestToJoin(partyId: string, userId: string, requestDto: JoinPartyRequestDto): Promise<Party> {
    if (!Types.ObjectId.isValid(partyId)) {
      throw new BadRequestException('Invalid party ID');
    }

    // Get the actual Mongoose document (not transformed)
    const party = await this.partyModel.findById(partyId);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Validate request
    this.validateJoinRequest(party as any, userId);

    // Check if user already has a pending request
    if (party.joinRequests.some(request => request.userId === userId)) {
      throw new BadRequestException('You already have a pending request for this party');
    }

    // Check rank requirements for ranked game modes
    const rankCheck = this.checkRankRequirement(user, party as any);
    if (!rankCheck.meets) {
      throw new BadRequestException(rankCheck.message);
    }

    // Validate position for non-ARAM modes
    if (party.gameMode !== GameMode.ARAM) {
      if (!requestDto.requestedPosition) {
        throw new BadRequestException('Position is required for this game mode');
      }

      // Check if position is already taken
      const isPositionTaken = party.members.some(
        member => member.position === requestDto.requestedPosition
      );

      if (isPositionTaken) {
        throw new BadRequestException(`Position ${requestDto.requestedPosition} is already taken`);
      }

      // Check if another request already claimed this position
      const isPositionRequestedByOthers = party.joinRequests.some(
        request => request.requestedPosition === requestDto.requestedPosition
      );

      if (isPositionRequestedByOthers) {
        throw new BadRequestException(`Position ${requestDto.requestedPosition} is already requested by another player`);
      }
    }

    // Validate position not allowed for ARAM
    if (party.gameMode === GameMode.ARAM && requestDto.requestedPosition) {
      throw new BadRequestException('Position selection is not allowed for ARAM mode');
    }

    // Add join request
    const joinRequest: JoinRequest = {
      userId,
      username: `${user.firstName} ${user.lastName}`,
      profilePicture: user.profilePicture,
      requestedAt: new Date(),
      message: requestDto.message,
      requestedPosition: requestDto.requestedPosition,
      lolAccount: user.lolAccount ? {
        gameName: user.lolAccount.gameName,
        tagLine: user.lolAccount.tagLine,
        rank: user.lolAccount.rankedData?.[0]?.rank,
        tier: user.lolAccount.rankedData?.[0]?.tier,
      } : undefined,
    };

    party.joinRequests.push(joinRequest);
    const savedParty = await party.save();

    // Send notification to party creator
    if (this.gateway) {
      const displayName = user.lolAccount 
        ? `${user.lolAccount.gameName}#${user.lolAccount.tagLine}`
        : `${user.firstName} ${user.lastName}`;
      
      await this.gateway.sendNotificationToUser(party.creatorId.toString(), {
        type: 'party_join_request',
        title: 'New Party Join Request',
        message: `${displayName} wants to join your party "${party.name}"${requestDto.requestedPosition ? ` as ${requestDto.requestedPosition.toUpperCase()}` : ''}`,
        data: {
          partyId: partyId,
          requesterId: userId,
          requesterName: displayName,
          message: requestDto.message,
          requestedPosition: requestDto.requestedPosition,
          requester: {
            profilePicture: user.profilePicture,
            lolAccount: user.lolAccount ? {
              gameName: user.lolAccount.gameName,
              tagLine: user.lolAccount.tagLine,
              rankedData: user.lolAccount.rankedData,
              profileIconId: user.lolAccount.profileIconId,
            } : null,
          },
        },
      });
    }

    return savedParty;
  }

  async requestToJoinByEmail(partyId: string, requestDto: JoinPartyRequestDto & { userEmail: string }): Promise<Party> {
    const user = await this.userModel.findOne({ email: requestDto.userEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userId = (user as any)._id.toString();
    return await this.requestToJoin(partyId, userId, requestDto);
  }

  async handleJoinRequest(partyId: string, requestDto: HandleJoinRequestDto, creatorId: string): Promise<Party> {
    const party = await this.findOneRaw(partyId);

    if (party.creatorId.toString() !== creatorId) {
      throw new ForbiddenException('Only the party creator can handle join requests');
    }

    const requestIndex = party.joinRequests.findIndex(req => req.userId === requestDto.userId);
    if (requestIndex === -1) {
      throw new NotFoundException('Join request not found');
    }

    const joinRequest = party.joinRequests[requestIndex];

    if (requestDto.accept) {
      if (requestDto.accept) {
      // Accept the request - add user to party
      if (party.members.length >= party.maxPlayers) {
        throw new BadRequestException('Party is full');
      }

      const user = await this.userModel.findById(requestDto.userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Double-check position availability for non-ARAM modes
      if (party.gameMode !== GameMode.ARAM && joinRequest.requestedPosition) {
        const isPositionTaken = party.members.some(
          member => member.position === joinRequest.requestedPosition
        );

        if (isPositionTaken) {
          throw new BadRequestException(`Position ${joinRequest.requestedPosition} is no longer available`);
        }
      }

      const member: PartyMember = {
        userId: requestDto.userId,
        username: `${user.firstName} ${user.lastName}`,
        profilePicture: user.profilePicture,
        joinedAt: new Date(),
        isReady: false,
        position: joinRequest.requestedPosition,
        lolAccount: user.lolAccount ? {
          gameName: user.lolAccount.gameName,
          tagLine: user.lolAccount.tagLine,
          profileIconId: user.lolAccount.profileIconId,
          rank: user.lolAccount.rankedData?.[0]?.rank,
          tier: user.lolAccount.rankedData?.[0]?.tier,
          rankedData: user.lolAccount.rankedData,
        } : undefined,
      };

      party.members.push(member);

      // Check if party is now full and close it
      if (party.members.length >= party.maxPlayers) {
        party.status = PartyStatus.CLOSED;
      }
    }

      // Check if party is now full and close it
      if (party.members.length >= party.maxPlayers) {
        party.status = PartyStatus.CLOSED;
      }
    }

    // Remove the request (whether accepted or rejected)
    party.joinRequests.splice(requestIndex, 1);

    const savedParty = await party.save();
    
    // Notify via WebSocket
    if (this.gateway && requestDto.accept && party.members.length > 0) {
      const newMember = party.members[party.members.length - 1];
      await this.gateway.notifyMemberJoined(savedParty._id, newMember);
    }
    
    return savedParty;
  }

  async leaveParty(partyId: string, userId: string): Promise<Party | null> {
    const party = await this.findOneRaw(partyId);

    if (!party.members.some(member => member.userId === userId)) {
      throw new BadRequestException('You are not a member of this party');
    }

    // If creator leaves, delete the party
    if (party.creatorId.toString() === userId) {
      await this.partyModel.findByIdAndDelete(partyId);
      
      // Notify via WebSocket about party deletion
      if (this.gateway) {
        await this.gateway.notifyPartyDeleted(partyId);
      }
      
      return null;
    }

    // Get the member info before removing them
    const leavingMember = party.members.find(member => member.userId === userId);

    // Remove member from party
    party.members = party.members.filter(member => member.userId !== userId);
    
    // Also remove any pending join request from this user
    party.joinRequests = party.joinRequests.filter(request => request.userId !== userId);

    // If party was closed and is no longer full, reopen it
    if (party.status === PartyStatus.CLOSED && party.members.length < party.maxPlayers) {
      party.status = PartyStatus.OPEN;
    }

    const savedParty = await party.save();
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyMemberLeft(partyId, userId);
      
      // Notify the owner that a member left
      if (leavingMember) {
        const owner = await this.userModel.findById(party.creatorId);
        if (owner && owner.email) {
          await this.gateway.sendNotificationToUser(owner.email, {
            type: 'member_left',
            title: 'Member Left Party',
            message: leavingMember.lolAccount 
              ? `${leavingMember.lolAccount.gameName}#${leavingMember.lolAccount.tagLine} left your party "${party.name}"`
              : `${leavingMember.username} left your party "${party.name}"`,
            data: {
              partyId: party._id,
              partyName: party.name,
              member: {
                userId: leavingMember.userId,
                username: leavingMember.username,
                profilePicture: leavingMember.profilePicture,
                lolAccount: leavingMember.lolAccount,
              }
            }
          });
        }
      }
    }
    
    return savedParty;
  }

  async leavePartyByEmail(partyId: string, userEmail: string): Promise<Party | null> {
    const user = await this.userModel.findOne({ email: userEmail });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userId = (user as any)._id.toString();
    return await this.leaveParty(partyId, userId);
  }

  async kickMember(partyId: string, kickDto: KickMemberDto, creatorId: string): Promise<Party> {
    const party = await this.findOneRaw(partyId);

    if (party.creatorId.toString() !== creatorId) {
      throw new ForbiddenException('Only the party creator can kick members');
    }

    if (kickDto.userId === creatorId) {
      throw new BadRequestException('Cannot kick the party creator');
    }

    if (!party.members.some(member => member.userId === kickDto.userId)) {
      throw new BadRequestException('User is not a member of this party');
    }

    party.members = party.members.filter(member => member.userId !== kickDto.userId);
    
    // If party was closed and is no longer full, reopen it
    if (party.status === PartyStatus.CLOSED && party.members.length < party.maxPlayers) {
      party.status = PartyStatus.OPEN;
    }
    
    const savedParty = await party.save();
    
    // Notify via WebSocket
    if (this.gateway) {
      await this.gateway.notifyMemberKicked(partyId, kickDto.userId, creatorId);
    }
    
    return savedParty;
  }

  async updateMemberStatus(partyId: string, statusDto: UpdateMemberStatusDto, userId: string): Promise<Party> {
    const party = await this.findOneRaw(partyId);

    if (!party.members.some(member => member.userId === userId)) {
      throw new BadRequestException('You are not a member of this party');
    }

    const member = party.members.find(m => m.userId === userId);
    if (member) {
      member.isReady = statusDto.isReady;
    }

    return await party.save();
  }

  async findUserActiveParty(userId: string): Promise<Party | null> {
    return await this.partyModel.findOne({
      'members.userId': userId,
      status: { $in: [PartyStatus.OPEN, PartyStatus.IN_GAME] }
    });
  }

  async findUserParties(userId: string): Promise<Party[]> {
    return await this.partyModel.find({
      $or: [
        { creatorId: new Types.ObjectId(userId) },
        { 'members.userId': userId }
      ]
    }).sort({ createdAt: -1 });
  }

  async findUserActivePartyByEmail(email: string): Promise<Party | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return null;
    }
    return await this.findUserActiveParty((user as any)._id.toString());
  }

  async findUserPartiesByEmail(email: string): Promise<Party[]> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      return [];
    }
    return await this.findUserParties((user as any)._id.toString());
  }

  async cleanupExpiredParties(): Promise<void> {
    await this.partyModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }

  async getAvailablePositions(partyId: string): Promise<Position[]> {
    const party = await this.partyModel.findById(partyId);
    if (!party) {
      throw new NotFoundException('Party not found');
    }

    // For ARAM, positions are not applicable
    if (party.gameMode === GameMode.ARAM) {
      return [];
    }

    const allPositions = [Position.TOP, Position.JUNGLE, Position.MID, Position.BOT, Position.SUPPORT];
    
    // Get positions already taken by members
    const takenPositions = party.members
      .map(member => member.position)
      .filter(pos => pos !== undefined) as Position[];

    // Get positions already requested
    const requestedPositions = party.joinRequests
      .map(request => request.requestedPosition)
      .filter(pos => pos !== undefined) as Position[];

    // Combine taken and requested positions
    const unavailablePositions = [...takenPositions, ...requestedPositions];

    // Return available positions
    return allPositions.filter(pos => !unavailablePositions.includes(pos));
  }

  private validateJoinRequest(party: Party, userId: string): void {
    if (party.status !== PartyStatus.OPEN) {
      throw new BadRequestException('Party is not accepting new members');
    }

    if (party.members.length >= party.maxPlayers) {
      throw new BadRequestException('Party is full');
    }

    if (party.members.some(member => member.userId === userId)) {
      throw new BadRequestException('You are already a member of this party');
    }

    if (party.creatorId.toString() === userId) {
      throw new BadRequestException('You are the creator of this party');
    }
  }

  private getMaxPlayersForGameMode(gameMode: GameMode): number {
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
  }

  private getRankValue(tier: string, rank: string): number {
    // Define rank hierarchy
    const tierValues: { [key: string]: number } = {
      'IRON': 0,
      'BRONZE': 400,
      'SILVER': 800,
      'GOLD': 1200,
      'PLATINUM': 1600,
      'EMERALD': 2000,
      'DIAMOND': 2400,
      'MASTER': 2800,
      'GRANDMASTER': 2900,
      'CHALLENGER': 3000,
    };

    const rankValues: { [key: string]: number } = {
      'IV': 0,
      'III': 100,
      'II': 200,
      'I': 300,
    };

    const tierValue = tierValues[tier.toUpperCase()] || 0;
    const rankValue = rankValues[rank.toUpperCase()] || 0;

    return tierValue + rankValue;
  }

  private checkRankRequirement(user: any, party: Party): { meets: boolean; message?: string } {
    // If no minimum rank requirement, allow join
    if (!party.preferences?.minRank) {
      return { meets: true };
    }

    // User must have LoL account linked
    if (!user.lolAccount || !user.lolAccount.rankedData || user.lolAccount.rankedData.length === 0) {
      return { 
        meets: false, 
        message: 'You must have a League of Legends account linked with ranked data to join this party' 
      };
    }

    // Parse minimum rank requirement
    // Handle both formats: "Platinum" (tier only) or "PLATINUM IV" (tier + division)
    const minRankParts = party.preferences.minRank.trim().split(' ');
    let minTier: string;
    let minRank: string;

    if (minRankParts.length === 1) {
      // Just tier provided (e.g., "Platinum") - assume IV (lowest division)
      minTier = minRankParts[0];
      minRank = 'IV';
    } else if (minRankParts.length === 2) {
      // Tier and division provided (e.g., "PLATINUM II")
      [minTier, minRank] = minRankParts;
    } else {
      // Invalid format, allow join
      return { meets: true };
    }

    const minRankValue = this.getRankValue(minTier, minRank);

    // Check appropriate queue type based on game mode
    let queueType: string;
    let queueLabel: string;

    if (party.gameMode === GameMode.RANKED_SOLO_DUO) {
      queueType = 'RANKED_SOLO_5x5';
      queueLabel = 'Solo/Duo';
    } else if (party.gameMode === GameMode.RANKED_FLEX) {
      queueType = 'RANKED_FLEX_SR';
      queueLabel = 'Flex';
    } else {
      // For non-ranked modes, no rank check needed
      return { meets: true };
    }

    // Find user's rank for the appropriate queue
    const userRankData = user.lolAccount.rankedData.find(
      (data: any) => data.queueType === queueType
    );

    if (!userRankData) {
      return { 
        meets: false, 
        message: `You must have a ${queueLabel} rank to join this party. Minimum required: ${party.preferences.minRank}` 
      };
    }

    const userRankValue = this.getRankValue(userRankData.tier, userRankData.rank);

    if (userRankValue < minRankValue) {
      return { 
        meets: false, 
        message: `Your ${queueLabel} rank (${userRankData.tier} ${userRankData.rank}) does not meet the minimum requirement: ${party.preferences.minRank}` 
      };
    }

    return { meets: true };
  }
}