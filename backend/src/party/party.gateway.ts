import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { PartyService } from './party.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

interface AuthenticatedSocket extends Socket {
  user?: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/party',
})
export class PartyGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('PartyGateway');
  private userSockets: Map<string, AuthenticatedSocket> = new Map();

  constructor(
    private readonly partyService: PartyService,
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Party WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // For now, allow connections without authentication
      // Join global parties room for receiving party list updates
      client.join('global:parties');
      
      this.logger.log(`Client ${client.id} connected to party gateway`);
      
      // Try email-based authentication first (NextAuth)
      const email = client.handshake.auth.email;
      if (email) {
        try {
          const user = await this.userModel.findOne({ email });
          if (user) {
            client.user = {
              userId: (user as any)._id.toString(),
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
            };

            this.userSockets.set(client.user.userId, client);
            this.logger.log(`User ${client.user.userId} authenticated via email and connected`);

            // Join user to their active party room if they have one
            const activeParty = await this.partyService.findUserActiveParty(client.user.userId);
            if (activeParty) {
              client.join(`party:${(activeParty as any)._id}`);
              this.logger.log(`User ${client.user.userId} joined party room ${(activeParty as any)._id}`);
            }
          }
        } catch (err) {
          this.logger.warn(`Failed to authenticate via email for client ${client.id}`);
        }
      } else {
        // Fallback to JWT token authentication
        const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
        
        if (token) {
          try {
            const payload = this.jwtService.verify(token);
            const user = await this.userModel.findById(payload.userId);

            if (user) {
              client.user = {
                userId: (user as any)._id.toString(),
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
              };

              this.userSockets.set(client.user.userId, client);

              // Join user to their active party room if they have one
              const activeParty = await this.partyService.findUserActiveParty(client.user.userId);
              if (activeParty) {
                client.join(`party:${(activeParty as any)._id}`);
                this.logger.log(`User ${client.user.userId} joined party room ${(activeParty as any)._id}`);
              }
            }
          } catch (err) {
            this.logger.warn(`Failed to authenticate client ${client.id}, continuing as guest`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      this.userSockets.delete(client.user.userId);
      this.logger.log(`User ${client.user.userId} disconnected`);
    }
  }

  // Real-time party updates
  async emitPartyUpdate(partyId: string, eventType: string, data: any) {
    this.server.to(`party:${partyId}`).emit('party:update', {
      type: eventType,
      partyId,
      data,
      timestamp: new Date(),
    });
  }

  // Emit to global parties room for party list updates
  async emitGlobalPartyUpdate(eventType: string, data: any) {
    this.server.to('global:parties').emit('parties:update', {
      type: eventType,
      data,
      timestamp: new Date(),
    });
  }

  // Send notification to specific user
  async sendNotificationToUser(userId: string, notification: any) {
    this.logger.log(`Attempting to send notification to user ${userId}`);
    this.logger.log(`Connected users: ${Array.from(this.userSockets.keys()).join(', ')}`);
    
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      this.logger.log(`Found socket for user ${userId}, sending notification`);
      userSocket.emit('notification', {
        ...notification,
        timestamp: new Date(),
      });
    } else {
      this.logger.warn(`No socket found for user ${userId}`);
    }
  }

  // Party-specific WebSocket handlers
  @SubscribeMessage('party:join-room')
  async handleJoinPartyRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string }
  ) {
    if (!client.user) return;

    try {
      const party = await this.partyService.findOne(data.partyId);
      
      // Check if user is member or has permission to view
      if ((party as any).hasMember(client.user.userId) || party.creatorId.toString() === client.user.userId) {
        client.join(`party:${data.partyId}`);
        this.logger.log(`User ${client.user.userId} joined party room ${data.partyId}`);
        
        client.emit('party:joined-room', {
          partyId: data.partyId,
          success: true,
        });
      } else {
        client.emit('party:joined-room', {
          partyId: data.partyId,
          success: false,
          error: 'Not authorized to join this party room',
        });
      }
    } catch (error) {
      client.emit('party:joined-room', {
        partyId: data.partyId,
        success: false,
        error: error.message,
      });
    }
  }

  @SubscribeMessage('party:leave-room')
  async handleLeavePartyRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string }
  ) {
    client.leave(`party:${data.partyId}`);
    this.logger.log(`User ${client.user?.userId} left party room ${data.partyId}`);
  }

  @SubscribeMessage('party:request-join')
  async handleJoinRequest(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string; message?: string }
  ) {
    if (!client.user) return;

    try {
      const party = await this.partyService.requestToJoin(
        data.partyId,
        client.user.userId,
        { message: data.message }
      );

      // Emit update to party room
      await this.emitPartyUpdate(data.partyId, 'join_request', {
        party,
        requesterId: client.user.userId,
        requesterName: `${client.user.firstName} ${client.user.lastName}`,
      });

      // Send notification to party creator
      await this.sendNotificationToUser(party.creatorId.toString(), {
        type: 'party_join_request',
        title: 'New Party Join Request',
        message: `${client.user.firstName} ${client.user.lastName} wants to join your party "${party.name}"`,
        data: {
          partyId: data.partyId,
          requesterId: client.user.userId,
          requesterName: `${client.user.firstName} ${client.user.lastName}`,
          message: data.message,
        },
      });

      client.emit('party:request-sent', {
        success: true,
        partyId: data.partyId,
      });
    } catch (error) {
      client.emit('party:request-sent', {
        success: false,
        error: error.message,
      });
    }
  }

  @SubscribeMessage('party:handle-request')
  async handleJoinRequestResponse(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string; userId: string; accept: boolean }
  ) {
    if (!client.user) return;

    try {
      const party = await this.partyService.handleJoinRequest(
        data.partyId,
        { userId: data.userId, accept: data.accept },
        client.user.userId
      );

      // Emit update to party room
      await this.emitPartyUpdate(data.partyId, 'request_handled', {
        party,
        userId: data.userId,
        accepted: data.accept,
      });

      // If accepted, add user to party room
      if (data.accept) {
        const userSocket = this.userSockets.get(data.userId);
        if (userSocket) {
          userSocket.join(`party:${data.partyId}`);
        }

        // Send notification to accepted user
        await this.sendNotificationToUser(data.userId, {
          type: 'party_request_accepted',
          title: 'Party Request Accepted',
          message: `You have been accepted to join "${party.name}"`,
          data: {
            partyId: data.partyId,
            partyName: party.name,
          },
        });
      } else {
        // Send notification to rejected user
        await this.sendNotificationToUser(data.userId, {
          type: 'party_request_rejected',
          title: 'Party Request Rejected',
          message: `Your request to join "${party.name}" was rejected`,
          data: {
            partyId: data.partyId,
            partyName: party.name,
          },
        });
      }

      client.emit('party:request-handled', {
        success: true,
        partyId: data.partyId,
        accepted: data.accept,
      });
    } catch (error) {
      client.emit('party:request-handled', {
        success: false,
        error: error.message,
      });
    }
  }

  @SubscribeMessage('party:update-status')
  async handleUpdateMemberStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string; isReady: boolean }
  ) {
    if (!client.user) return;

    try {
      const party = await this.partyService.updateMemberStatus(
        data.partyId,
        { isReady: data.isReady },
        client.user.userId
      );

      // Emit update to party room
      await this.emitPartyUpdate(data.partyId, 'member_status_update', {
        party,
        userId: client.user.userId,
        isReady: data.isReady,
      });

      client.emit('party:status-updated', {
        success: true,
        partyId: data.partyId,
        isReady: data.isReady,
      });
    } catch (error) {
      client.emit('party:status-updated', {
        success: false,
        error: error.message,
      });
    }
  }

  @SubscribeMessage('party:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { partyId: string; isTyping: boolean }
  ) {
    if (!client.user) return;

    // Broadcast typing status to other party members
    client.to(`party:${data.partyId}`).emit('party:user-typing', {
      userId: client.user.userId,
      username: `${client.user.firstName} ${client.user.lastName}`,
      isTyping: data.isTyping,
    });
  }

  // Methods called by service to emit events
  async notifyPartyCreated(party: any) {
    await this.emitGlobalPartyUpdate('party_created', party);
  }

  async notifyPartyUpdated(party: any) {
    await this.emitPartyUpdate(party._id, 'party_updated', party);
    await this.emitGlobalPartyUpdate('party_updated', party);
  }

  async notifyPartyDeleted(partyId: string) {
    await this.emitPartyUpdate(partyId, 'party_deleted', { partyId });
    await this.emitGlobalPartyUpdate('party_deleted', { partyId });
  }

  async notifyMemberJoined(partyId: string, member: any) {
    await this.emitPartyUpdate(partyId, 'member_joined', { member });
    
    // Also emit to global room so the new member sees the update
    await this.emitGlobalPartyUpdate('member_joined', { partyId, member });
    
    // Add the new member to the party room
    const memberSocket = this.userSockets.get(member.userId);
    if (memberSocket) {
      memberSocket.join(`party:${partyId}`);
      this.logger.log(`New member ${member.userId} joined party room ${partyId}`);
    }
  }

  async notifyMemberLeft(partyId: string, userId: string) {
    // Remove user from party room
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.leave(`party:${partyId}`);
    }

    await this.emitPartyUpdate(partyId, 'member_left', { userId });
  }

  async notifyMemberKicked(partyId: string, userId: string, kickedBy: string) {
    // Remove user from party room
    const userSocket = this.userSockets.get(userId);
    if (userSocket) {
      userSocket.leave(`party:${partyId}`);
    }

    // Send notification to kicked user
    await this.sendNotificationToUser(userId, {
      type: 'party_kicked',
      title: 'Removed from Party',
      message: 'You have been removed from the party',
      data: {
        partyId,
        kickedBy,
      },
    });

    await this.emitPartyUpdate(partyId, 'member_kicked', { userId, kickedBy });
  }
}