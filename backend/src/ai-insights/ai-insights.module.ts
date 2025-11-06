import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AIInsightsService } from './ai-insights.service';
import { AIInsightsController } from './ai-insights.controller';
import { AIInsights, AIInsightsSchema } from './schemas/ai-insights.schema';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AIInsights.name, schema: AIInsightsSchema },
    ]),
    HttpModule,
  ],
  controllers: [AIInsightsController],
  providers: [AIInsightsService],
  exports: [AIInsightsService],
})
export class AIInsightsModule {}
