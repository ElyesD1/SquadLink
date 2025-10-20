import { Module } from '@nestjs/common';
import { RiotEsportsController } from './riot-esports.controller';
import { RiotEsportsService } from './riot-esports.service';

@Module({
  controllers: [RiotEsportsController],
  providers: [RiotEsportsService],
  exports: [RiotEsportsService],
})
export class RiotEsportsModule {}