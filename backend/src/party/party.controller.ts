import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  Request,
  HttpCode,
  HttpStatus,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PartyService } from './party.service';
import { 
  CreatePartyDto, 
  UpdatePartyDto, 
  JoinPartyRequestDto, 
  HandleJoinRequestDto, 
  PartyFiltersDto,
  KickMemberDto,
  UpdateMemberStatusDto
} from './dto/party.dto';
import { User } from '../users/entities/user.entity';

@Controller('party')
export class PartyController {
  constructor(
    private readonly partyService: PartyService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Post()
  async create(@Body() createPartyDto: CreatePartyDto) {
    const party = await this.partyService.createByEmail(createPartyDto);
    return {
      success: true,
      message: 'Party created successfully',
      data: party,
    };
  }

  @Get()
  async findAll(@Query() filters: PartyFiltersDto, @Request() req?: any) {
    // If user is authenticated, include their userId to show their closed parties
    let userId = req?.user?.userId;

    // Also check for userId in query params (for frontend calls)
    if (!userId && filters.userId) {
      userId = filters.userId;
    }

    const enhancedFilters = { ...filters, userId };

    const result = await this.partyService.findAll(enhancedFilters);
    return {
      success: true,
      data: result.parties,
      meta: {
        total: result.total,
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      },
    };
  }

  @Post('my-parties')
  async findMyParties(@Body('email') email: string) {
    const parties = await this.partyService.findUserPartiesByEmail(email);
    return {
      success: true,
      data: parties,
    };
  }

  @Post('my-active-party')
  async findMyActiveParty(@Body('email') email: string) {
    const party = await this.partyService.findUserActivePartyByEmail(email);
    return {
      success: true,
      data: party,
    };
  }

  @Get('invite/:inviteCode')
  async findByInviteCode(@Param('inviteCode') inviteCode: string) {
    const party = await this.partyService.findByInviteCode(inviteCode);
    return {
      success: true,
      data: party,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const party = await this.partyService.findOne(id);
    return {
      success: true,
      data: party,
    };
  }

  @Get(':id/available-positions')
  async getAvailablePositions(@Param('id') id: string) {
    const positions = await this.partyService.getAvailablePositions(id);
    return {
      success: true,
      data: positions,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string, 
    @Body() updatePartyDto: UpdatePartyDto, 
    @Request() req
  ) {
    const party = await this.partyService.update(id, updatePartyDto, req.user.userId);
    return {
      success: true,
      message: 'Party updated successfully',
      data: party,
    };
  }

  @Put(':id/by-email')
  async updateByEmail(
    @Param('id') id: string, 
    @Body() body: UpdatePartyDto & { userEmail: string }
  ) {
    const { userEmail, ...updatePartyDto } = body;
    const party = await this.partyService.updateByEmail(id, updatePartyDto, userEmail);
    return {
      success: true,
      message: 'Party updated successfully',
      data: party,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req) {
    await this.partyService.delete(id, req.user.userId);
    return {
      success: true,
      message: 'Party deleted successfully',
    };
  }

  @Delete(':id/by-email')
  async deleteByEmail(
    @Param('id') id: string,
    @Body('userEmail') userEmail: string
  ) {
    await this.partyService.deleteByEmail(id, userEmail);
    return {
      success: true,
      message: 'Party deleted successfully',
    };
  }

  @Post(':id/request-join')
  async requestToJoin(
    @Param('id') id: string,
    @Body() requestDto: JoinPartyRequestDto & { userEmail: string }
  ) {
    const party = await this.partyService.requestToJoinByEmail(id, requestDto);
    return {
      success: true,
      message: 'Join request sent successfully',
      data: party,
    };
  }

  @Post(':id/handle-request')
  async handleJoinRequest(
    @Param('id') id: string,
    @Body() handleDto: HandleJoinRequestDto & { userEmail?: string },
    @Request() req
  ) {
    // Use email-based auth if provided, otherwise use JWT
    let creatorId: string;
    if (handleDto.userEmail) {
      const user = await this.partyService['userModel'].findOne({ email: handleDto.userEmail });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      creatorId = (user as any)._id.toString();
    } else {
      creatorId = req.user.userId;
    }

    const party = await this.partyService.handleJoinRequest(id, handleDto, creatorId);
    const message = handleDto.accept ? 'Request accepted successfully' : 'Request rejected successfully';
    return {
      success: true,
      message,
      data: party,
    };
  }

  @Post(':id/leave')
  @HttpCode(HttpStatus.OK)
  async leaveParty(
    @Param('id') id: string, 
    @Body() body: { userEmail?: string },
    @Request() req
  ) {
    // Use email-based auth if provided, otherwise use JWT
    let result;
    if (body.userEmail) {
      result = await this.partyService.leavePartyByEmail(id, body.userEmail);
    } else {
      result = await this.partyService.leaveParty(id, req.user.userId);
    }
    
    return {
      success: true,
      message: result ? 'Left party successfully' : 'Party disbanded',
      data: result,
    };
  }

  @Post(':id/kick')
  async kickMember(
    @Param('id') id: string,
    @Body() kickDto: KickMemberDto & { userEmail?: string },
    @Request() req
  ) {
    // Use email-based auth if provided, otherwise use JWT
    let creatorId: string;
    if (kickDto.userEmail) {
      const user = await this.userModel.findOne({ email: kickDto.userEmail });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      creatorId = (user as any)._id.toString();
    } else {
      creatorId = req.user.userId;
    }
    
    const party = await this.partyService.kickMember(id, kickDto, creatorId);
    return {
      success: true,
      message: 'Member kicked successfully',
      data: party,
    };
  }

  @Put(':id/member-status')
  async updateMemberStatus(
    @Param('id') id: string,
    @Body() statusDto: UpdateMemberStatusDto,
    @Request() req
  ) {
    const party = await this.partyService.updateMemberStatus(id, statusDto, req.user.userId);
    return {
      success: true,
      message: 'Member status updated successfully',
      data: party,
    };
  }
}