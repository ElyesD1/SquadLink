import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AIInsightsService } from './ai-insights.service';

interface GenerateInsightsDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  matches: any[];
}

@Controller('api/v1/riot/insights')
export class AIInsightsController {
  private readonly logger = new Logger(AIInsightsController.name);

  constructor(private readonly aiInsightsService: AIInsightsService) {}

  @Post()
  async generateInsights(@Body() dto: GenerateInsightsDto) {
    this.logger.log(`Generating insights for ${dto.gameName}#${dto.tagLine} with ${dto.matches?.length || 0} matches`);
    
    try {
      const matchCount = dto.matches?.length || 0;
      const isLargeDataset = matchCount > 50;
      
      if (isLargeDataset) {
        this.logger.warn(`Large dataset detected: ${matchCount} matches. Processing may take longer.`);
      }

      const insights = await this.aiInsightsService.generateInsights(dto);
      
      return {
        ...insights,
        isLargeDataset,
        processingNote: isLargeDataset 
          ? `Analyzed ${matchCount} matches. AI processing may take a moment for large datasets.`
          : null,
      };
    } catch (error) {
      this.logger.error('Failed to generate insights:', error);
      throw error;
    }
  }
}
