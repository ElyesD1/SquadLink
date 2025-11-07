import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIInsightsService } from './ai-insights.service';
import { AIInsightsController } from './ai-insights.controller';
import { AICoachingService } from './ai-coaching.service';
import { AIInsights, AIInsightsSchema } from './schemas/ai-insights.schema';
import { AICoaching, AICoachingSchema } from './schemas/ai-coaching.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIInsights.name, schema: AIInsightsSchema },
      { name: AICoaching.name, schema: AICoachingSchema },
    ]),
    HttpModule,
  ],
  controllers: [AIInsightsController],
  providers: [AIInsightsService, AICoachingService],
  exports: [AIInsightsService, AICoachingService],
})
export class AIInsightsModule {}
