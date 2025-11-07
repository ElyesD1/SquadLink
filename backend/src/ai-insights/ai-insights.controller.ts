import { Controller, Post, Body, Logger } from '@nestjs/common';
import { AIInsightsService } from './ai-insights.service';
import { AICoachingService } from './ai-coaching.service';

interface GenerateInsightsDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  matches: any[];
}

interface GenerateCoachingDto {
  puuid: string;
  match: any;
}

@Controller('api/v1/riot/insights')
export class AIInsightsController {
  private readonly logger = new Logger(AIInsightsController.name);

  constructor(
    private readonly aiInsightsService: AIInsightsService,
    private readonly aiCoachingService: AICoachingService,
  ) {}

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

  @Post('coaching')
  async generateCoaching(@Body() dto: GenerateCoachingDto) {
    this.logger.log(`Generating coaching for match ${dto.match?.metadata?.matchId}`);
    
    try {
      const coaching = await this.aiCoachingService.getCoaching(dto);
      
      return {
        success: true,
        coaching,
      };
    } catch (error) {
      this.logger.error('Failed to generate coaching:', error);
      
      // Return more descriptive error for unsupported game modes
      if (error.message?.includes('Summoner\'s Rift')) {
        return {
          success: false,
          error: error.message,
          message: 'AI Coaching is only available for Summoner\'s Rift games (Draft Pick, Ranked Solo/Duo, Blind Pick, Ranked Flex, Quick Play)',
        };
      }
      
      throw error;
    }
  }
}
