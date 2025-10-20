import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { PartyController } from './party.controller';
import { PartyService } from './party.service';
import { PartyGateway } from './party.gateway';
import { PartyCleanupService } from './party-cleanup.service';
import { Party, PartySchema } from './entities/party.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { DiscordModule } from '../discord/discord.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Party.name, schema: PartySchema },
      { name: User.name, schema: UserSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecret',
      signOptions: { expiresIn: '24h' },
    }),
    ScheduleModule.forRoot(),
    DiscordModule,
  ],
  controllers: [PartyController],
  providers: [
    PartyService,
    PartyGateway,
    PartyCleanupService,
    {
      provide: 'PARTY_GATEWAY_INTEGRATION',
      useFactory: (partyService: PartyService, partyGateway: PartyGateway) => {
        // Connect the service to the gateway for real-time updates
        partyService.setGateway(partyGateway);
        return true;
      },
      inject: [PartyService, PartyGateway],
    },
  ],
  exports: [PartyService, PartyGateway],
})
export class PartyModule {}