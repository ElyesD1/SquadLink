import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PartyService } from './party.service';

@Injectable()
export class PartyCleanupService {
  private readonly logger = new Logger(PartyCleanupService.name);

  constructor(private readonly partyService: PartyService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredParties() {
    this.logger.log('Running expired parties cleanup...');
    const maxRetries = 3;
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        await this.partyService.cleanupExpiredParties();
        this.logger.log('Expired parties cleanup completed');
        return;
      } catch (error) {
        attempt++;
        if (error.name === 'MongoPoolClearedError' || error.name === 'MongoNetworkTimeoutError') {
          if (attempt < maxRetries) {
            this.logger.warn(`MongoDB connection error, retrying... (${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds before retry
            continue;
          }
        }
        this.logger.error('Error during expired parties cleanup:', error.message);
        break;
      }
    }
  }
}