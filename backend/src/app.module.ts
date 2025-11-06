import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RiotEsportsModule } from './riot-esports/riot-esports.module';
import { RiotApiModule } from './riot-api/riot-api.module';
import { PartyModule } from './party/party.module';
import { DiscordModule } from './discord/discord.module';
import { EmailModule } from './email/email.module';
import { AIInsightsModule } from './ai-insights/ai-insights.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    RiotEsportsModule,
    RiotApiModule,
    PartyModule,
    DiscordModule,
    EmailModule,
    AIInsightsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
