import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AICoaching, AICoachingDocument } from './schemas/ai-coaching.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Summoner's Rift queue IDs
const SUMMONERS_RIFT_QUEUES = {
  400: 'Draft Pick',
  420: 'Ranked Solo/Duo',
  430: 'Blind Pick',
  440: 'Ranked Flex',
  490: 'Quick Play',
};

interface MatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  teamId: number;
  teamPosition: string;
  kills: number;
  deaths: number;
  assists: number;
  win: boolean;
  riotIdGameName: string;
  riotIdTagline: string;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  goldEarned: number;
  goldSpent: number;
  totalDamageDealtToChampions: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  visionScore: number;
  wardsPlaced: number;
  wardsKilled: number;
  detectorWardsPlaced: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  perks: any;
  challenges?: any;
  champLevel: number;
}

interface Match {
  metadata: {
    matchId: string;
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    queueId: number;
    participants: MatchParticipant[];
  };
}

interface GenerateCoachingDto {
  puuid: string;
  match: Match;
  timeline?: any; // Optional timeline data
}

@Injectable()
export class AICoachingService {
  private readonly logger = new Logger(AICoachingService.name);
  private readonly OLLAMA_URL = 'http://localhost:11434/api/generate';
  private readonly MODEL = 'llama3.1:8b-instruct-q4_K_M';

  constructor(
    @InjectModel(AICoaching.name)
    private aiCoachingModel: Model<AICoachingDocument>,
    private httpService: HttpService,
  ) {}

  /**
   * Check if match is Summoner's Rift
   */
  private isSummonersRift(queueId: number): boolean {
    return queueId in SUMMONERS_RIFT_QUEUES;
  }

  /**
   * Get role-specific benchmarks
   */
  private getRoleBenchmarks(role: string): {
    csPerMin: string;
    visionPerMin: string;
    kda: string;
  } {
    const benchmarks = {
      TOP: { csPerMin: '6.5-7.5', visionPerMin: '0.8-1.2', kda: '2.5+' },
      JUNGLE: { csPerMin: '4.5-5.5', visionPerMin: '1.5-2.0', kda: '3.0+' },
      MIDDLE: { csPerMin: '7.0-8.0', visionPerMin: '0.7-1.0', kda: '3.0+' },
      BOTTOM: { csPerMin: '7.5-8.5', visionPerMin: '0.8-1.2', kda: '3.5+' },
      UTILITY: { csPerMin: '1.0-2.0', visionPerMin: '2.0-3.0', kda: '3.0+' },
      SUPPORT: { csPerMin: '1.0-2.0', visionPerMin: '2.0-3.0', kda: '3.0+' },
    };

    return benchmarks[role] || benchmarks.MIDDLE;
  }

  /**
   * Get cached coaching or generate new one
   */
  async getCoaching(dto: GenerateCoachingDto): Promise<AICoaching> {
    const { puuid, match } = dto;
    const matchId = match.metadata.matchId;

    // Check if it's a Summoner's Rift game
    if (!this.isSummonersRift(match.info.queueId)) {
      throw new Error(
        `Only Summoner's Rift games are supported. Queue ID ${match.info.queueId} is not valid.`,
      );
    }

    // Check cache first
    const cachedCoaching = await this.aiCoachingModel
      .findOne({ matchId, puuid })
      .exec();

    if (cachedCoaching) {
      this.logger.log(
        `Found cached coaching for match ${matchId}, puuid ${puuid}`,
      );
      return cachedCoaching;
    }

    // Generate new coaching
    this.logger.log(
      `No cache found, generating new coaching for match ${matchId}`,
    );
    return this.generateAndCacheCoaching(dto);
  }

  /**
   * Generate coaching using AI and cache it
   */
  private async generateAndCacheCoaching(
    dto: GenerateCoachingDto,
  ): Promise<AICoaching> {
    const { puuid, match, timeline } = dto;
    const matchId = match.metadata.matchId;

    // Find the player's participant data
    const playerData = match.info.participants.find((p) => p.puuid === puuid);

    if (!playerData) {
      throw new Error(
        `Player with puuid ${puuid} not found in match ${matchId}`,
      );
    }

    // Extract match data
    const matchData = this.extractMatchData(playerData, match);

    // Extract timeline data if available
    const timelineData = timeline
      ? this.extractTimelineData(timeline, playerData, match)
      : undefined;

    // Generate coaching with AI
    const coaching = await this.generateCoachingWithAI(
      matchData,
      match,
      playerData.teamPosition || 'UNKNOWN',
      playerData,
      playerData.championName,
      timelineData || undefined,
    );

    // Create and save to cache
    const aiCoaching = new this.aiCoachingModel({
      matchId,
      puuid,
      summonerName: `${playerData.riotIdGameName}#${playerData.riotIdTagline}`,
      championName: playerData.championName,
      championId: playerData.championId,
      role: playerData.teamPosition || 'UNKNOWN',
      matchData,
      coaching,
      timelineData,
    });

    await aiCoaching.save();
    this.logger.log(`Cached coaching for match ${matchId}, puuid ${puuid}`);

    return aiCoaching;
  }

  /**
   * Extract relevant match data for the player
   */
  private extractMatchData(
    player: MatchParticipant,
    match: Match,
  ): AICoaching['matchData'] {
    const gameDurationMinutes = Math.floor(match.info.gameDuration / 60);
    const kda =
      player.deaths === 0
        ? player.kills + player.assists
        : parseFloat(
            ((player.kills + player.assists) / player.deaths).toFixed(2),
          );

    return {
      gameMode:
        SUMMONERS_RIFT_QUEUES[match.info.queueId] || 'Summoner\'s Rift',
      queueId: match.info.queueId,
      gameDuration: match.info.gameDuration,
      win: player.win,
      kills: player.kills,
      deaths: player.deaths,
      assists: player.assists,
      kda,
      championLevel: player.champLevel,
      totalDamageDealt: player.totalDamageDealt,
      totalDamageDealtToChampions: player.totalDamageDealtToChampions,
      totalDamageTaken: player.totalDamageTaken,
      goldEarned: player.goldEarned,
      goldSpent: player.goldSpent,
      totalMinionsKilled: player.totalMinionsKilled,
      neutralMinionsKilled: player.neutralMinionsKilled,
      visionScore: player.visionScore,
      wardsPlaced: player.wardsPlaced,
      wardsKilled: player.wardsKilled,
      controlWardsPlaced: player.detectorWardsPlaced,
      items: [
        player.item0,
        player.item1,
        player.item2,
        player.item3,
        player.item4,
        player.item5,
        player.item6,
      ].filter((id) => id !== 0),
      summoner1Id: player.summoner1Id,
      summoner2Id: player.summoner2Id,
      perks: player.perks,
      challenges: player.challenges,
    };
  }

  /**
   * Extract timeline data for detailed analysis
   */
  private extractTimelineData(
    timeline: any,
    player: MatchParticipant,
    match: Match,
  ): AICoaching['timelineData'] {
    if (!timeline || !timeline.info || !timeline.info.frames) {
      return undefined;
    }

    const participantId = match.info.participants.findIndex(
      (p) => p.puuid === player.puuid,
    ) + 1;

    const itemPurchases: Array<{ timestamp: number; itemId: number }> = [];
    const kills: Array<{ timestamp: number; victimId: number }> = [];
    const deaths: Array<{ timestamp: number; killerId: number }> = [];
    const levelProgression: Array<{ timestamp: number; level: number }> = [];
    const goldProgression: Array<{ timestamp: number; gold: number }> = [];

    timeline.info.frames.forEach((frame: any) => {
      const timestamp = frame.timestamp;

      // Extract participant frame data
      const participantFrame =
        frame.participantFrames?.[participantId.toString()];
      if (participantFrame) {
        levelProgression.push({
          timestamp,
          level: participantFrame.level,
        });
        goldProgression.push({
          timestamp,
          gold: participantFrame.totalGold,
        });
      }

      // Extract events
      if (frame.events) {
        frame.events.forEach((event: any) => {
          // Item purchases
          if (
            event.type === 'ITEM_PURCHASED' &&
            event.participantId === participantId
          ) {
            itemPurchases.push({
              timestamp: event.timestamp,
              itemId: event.itemId,
            });
          }

          // Kills
          if (
            event.type === 'CHAMPION_KILL' &&
            event.killerId === participantId
          ) {
            kills.push({
              timestamp: event.timestamp,
              victimId: event.victimId,
            });
          }

          // Deaths
          if (
            event.type === 'CHAMPION_KILL' &&
            event.victimId === participantId
          ) {
            deaths.push({
              timestamp: event.timestamp,
              killerId: event.killerId,
            });
          }
        });
      }
    });

    return {
      itemPurchases,
      kills,
      deaths,
      levelProgression,
      goldProgression,
    };
  }

  /**
   * Generate coaching insights using Ollama AI
   */
  private async generateCoachingWithAI(
    matchData: AICoaching['matchData'],
    match: Match,
    role: string,
    playerData: MatchParticipant,
    championName: string,
    timelineData: AICoaching['timelineData'],
  ): Promise<AICoaching['coaching']> {
    const gameDurationMinutes = Math.floor(matchData.gameDuration / 60);
    const csPerMin = (
      (matchData.totalMinionsKilled + matchData.neutralMinionsKilled) /
      gameDurationMinutes
    ).toFixed(1);

    // Calculate actual benchmarks based on role
    const roleBenchmarks = this.getRoleBenchmarks(role);
    
    // Parse numeric values from benchmark strings
    const kdaBenchmark = parseFloat(roleBenchmarks.kda.replace('+', ''));
    const visionBenchmark = parseFloat(roleBenchmarks.visionPerMin.split('-')[0]);
    const csBenchmark = parseFloat(roleBenchmarks.csPerMin.split('-')[0]);
    
    // Get item names (item IDs are in matchData.items)
    const itemsList = matchData.items.length > 0 
      ? `Built items (IDs): ${matchData.items.join(', ')}` 
      : 'No completed items';

    // Calculate gold efficiency
    const goldEfficiency = ((matchData.goldSpent / matchData.goldEarned) * 100).toFixed(1);
    const unusedGold = matchData.goldEarned - matchData.goldSpent;

    // Build timeline insights if available
    let timelineInsights = '';
    if (timelineData && Object.keys(timelineData).length > 0) {
      const earlyKills = timelineData.kills?.filter(k => k.timestamp <= 600000).length || 0;
      const earlyDeaths = timelineData.deaths?.filter(d => d.timestamp <= 600000).length || 0;
      const midKills = timelineData.kills?.filter(k => k.timestamp > 600000 && k.timestamp <= 1200000).length || 0;
      const midDeaths = timelineData.deaths?.filter(d => d.timestamp > 600000 && d.timestamp <= 1200000).length || 0;
      const lateKills = timelineData.kills?.filter(k => k.timestamp > 1200000).length || 0;
      const lateDeaths = timelineData.deaths?.filter(d => d.timestamp > 1200000).length || 0;

      timelineInsights = `
TIMELINE ANALYSIS:
Early Game (0-10min): ${earlyKills} kills, ${earlyDeaths} deaths
Mid Game (10-20min): ${midKills} kills, ${midDeaths} deaths
Late Game (20+min): ${lateKills} kills, ${lateDeaths} deaths

Item Purchase Count: ${timelineData.itemPurchases?.length || 0} purchases tracked
Gold/Level Progression: ${timelineData.goldProgression?.length || 0} data points available
`;
    }

    // Role-specific context
    const roleContext = {
      JUNGLE: {
        focus: 'jungle clear speed, gank timing, objective control, camp tracking',
        noLaning: true,
        keyMetrics: 'clear speed, gank success, objective control, counter-jungling',
        earlyGame: 'Focus on your first clear, level 3 gank timing, and early scuttle contests',
        midGame: 'Evaluate jungle tracking, gank efficiency, and objective setup',
        lateGame: 'Assess teamfight engage timing, objective control, and vision denial'
      },
      MIDDLE: {
        focus: 'wave management, roam timing, lane priority, side lane pressure',
        noLaning: false,
        keyMetrics: 'roam effectiveness, CS at 10min, lane pressure',
        earlyGame: 'Analyze laning trades, wave control, and early roam windows',
        midGame: 'Evaluate side lane pressure and roam coordination',
        lateGame: 'Assess teamfight positioning and damage output'
      },
      TOP: {
        focus: 'wave management, TP usage, split push pressure, 1v1 dueling',
        noLaning: false,
        keyMetrics: 'TP usage, split push effectiveness, 1v1 duels won',
        earlyGame: 'Analyze laning fundamentals and wave manipulation',
        midGame: 'Evaluate TP plays and side lane pressure',
        lateGame: 'Assess split push vs grouping decisions'
      },
      BOTTOM: {
        focus: 'wave management, trade patterns, support synergy, positioning',
        noLaning: false,
        keyMetrics: 'CS at 10min, deaths in lane, teamfight positioning',
        earlyGame: 'Analyze 2v2 trading, wave control, and early deaths',
        midGame: 'Evaluate positioning in skirmishes',
        lateGame: 'Assess teamfight positioning and target selection'
      },
      UTILITY: {
        focus: 'vision control, roam timing, peel priority, engage timing',
        noLaning: false,
        keyMetrics: 'vision score, roam success, key ability usage',
        earlyGame: 'Analyze laning trades, vision setup, and roam timing',
        midGame: 'Evaluate roam coordination and vision control',
        lateGame: 'Assess peel priority and engage timing'
      },
      SUPPORT: {
        focus: 'vision control, roam timing, peel priority, engage timing',
        noLaning: false,
        keyMetrics: 'vision score, roam success, key ability usage',
        earlyGame: 'Analyze laning trades, vision setup, and roam timing',
        midGame: 'Evaluate roam coordination and vision control',
        lateGame: 'Assess peel priority and engage timing'
      }
    };

    const context = roleContext[role] || roleContext.MIDDLE;

    const prompt = `You are a Challenger-tier League of Legends coach analyzing a ${role} ${championName} match. Provide DEEP, SPECIFIC analysis.

CRITICAL RULES:
1. ${context.noLaning ? `${role} is JUNGLE - NO laning phase. Focus on: ${context.focus}` : `${role} laning role. Focus on: ${context.focus}`}
2. NEVER mention item IDs - only talk about build strategy and timing
3. Use ACTUAL numbers from the stats below
4. Compare to benchmarks: ${roleBenchmarks.csPerMin} CS/min, ${roleBenchmarks.visionPerMin} vision/min, ${roleBenchmarks.kda} KDA
5. Address player as "you/your"

MATCH: ${championName} ${role} - ${matchData.win ? 'VICTORY' : 'DEFEAT'} in ${gameDurationMinutes}min
STATS:
- KDA: ${matchData.kills}/${matchData.deaths}/${matchData.assists} = ${matchData.kda}
- CS: ${csPerMin} CS/min (${matchData.totalMinionsKilled} minions, ${matchData.neutralMinionsKilled} camps)
- Gold: ${goldEfficiency}% efficiency (${unusedGold.toLocaleString()} unspent)
- Damage: ${matchData.totalDamageDealtToChampions.toLocaleString()} dealt, ${matchData.totalDamageTaken.toLocaleString()} taken
- Vision: ${(matchData.visionScore / gameDurationMinutes).toFixed(1)}/min (${matchData.wardsPlaced} placed, ${matchData.controlWardsPlaced} pinks)
${timelineInsights}

Return ONLY valid JSON (no extra text):
{
  "overallPerformance": "2-3 sentences about their ${matchData.kda} KDA ${matchData.win ? 'victory' : 'defeat'}",
  "strengths": ["strength 1 with numbers", "strength 2 with numbers", "strength 3 with numbers"],
  "weaknesses": ["weakness 1 with numbers", "weakness 2 with numbers", "weakness 3 with numbers"],
  "buildAssessment": {
    "earlyGame": "early game analysis",
    "midGame": "mid game analysis",
    "lateGame": "late game analysis",
    "itemTimings": "item timing analysis",
    "overall": "overall build quality"
  },
  "tacticalAssessment": {
    "laning": "${context.noLaning ? role + ' does not lane - analyze jungle clear and ganks' : 'analyze laning phase'}",
    "teamfighting": "teamfight analysis",
    "objectiveControl": "objective control analysis",
    "mapAwareness": "map awareness analysis"
  },
  "skillAssessment": {
    "mechanics": "mechanics assessment",
    "decisionMaking": "decision making assessment",
    "adaptability": "adaptability assessment"
  },
  "strategicAssessment": {
    "gamePlan": "game plan assessment",
    "tempo": "tempo control assessment",
    "winConditions": "win conditions assessment"
  },
  "itemBuildAnalysis": "gold efficiency analysis",
  "visionControl": "vision control analysis",
  "farmingEfficiency": "farming analysis",
  "fightingStyle": "fighting style analysis",
  "recommendations": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"],
  "keyTakeaways": ["takeaway 1", "takeaway 2"]
}`;

    try {
      this.logger.log('Sending coaching request to Ollama...');

      const response = await firstValueFrom(
        this.httpService.post(this.OLLAMA_URL, {
          model: this.MODEL,
          prompt,
          stream: false,
          format: 'json',
          options: {
            temperature: 0.7,
            top_p: 0.9,
          },
        }),
      );

      const aiResponse = response.data.response;
      this.logger.log('Received coaching response from AI');

      // Parse the JSON response
      const coaching = JSON.parse(aiResponse);
      
      // Log the parsed response for debugging
      this.logger.debug('Parsed coaching structure:', JSON.stringify(coaching, null, 2));

      // Validate the response structure - only check critical fields
      if (
        !coaching.overallPerformance ||
        !Array.isArray(coaching.strengths) ||
        !Array.isArray(coaching.weaknesses) ||
        !Array.isArray(coaching.recommendations) ||
        !Array.isArray(coaching.keyTakeaways)
      ) {
        this.logger.error('Missing required fields in coaching response');
        throw new Error('Invalid coaching response structure from AI');
      }

      return coaching;
    } catch (error) {
      this.logger.error('Error generating AI coaching:', error);
      
      // If it's a JSON parse error, log the raw response
      if (error instanceof SyntaxError) {
        this.logger.error('Failed to parse AI response as JSON');
      }

      // Return a fallback coaching response
      return this.generateFallbackCoaching(matchData);
    }
  }

  /**
   * Generate fallback coaching if AI fails
   */
  private generateFallbackCoaching(
    matchData: AICoaching['matchData'],
  ): AICoaching['coaching'] {
    const gameDurationMinutes = Math.floor(matchData.gameDuration / 60);
    const csPerMin =
      (matchData.totalMinionsKilled + matchData.neutralMinionsKilled) /
      gameDurationMinutes;

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze KDA
    if (matchData.kda >= 3.0) {
      strengths.push('Excellent KDA ratio showing strong fight participation');
    } else if (matchData.kda < 2.0) {
      weaknesses.push('KDA ratio could be improved - focus on safer positioning');
      recommendations.push(
        'Work on positioning in team fights to reduce deaths while maintaining impact',
      );
    }

    // Analyze CS
    if (csPerMin >= 7.0) {
      strengths.push('Strong CS per minute showing good farming efficiency');
    } else if (csPerMin < 5.0) {
      weaknesses.push('CS per minute is below average');
      recommendations.push(
        'Focus on last-hitting minions and maintaining farm throughout the game',
      );
    }

    // Analyze vision
    const visionPerMin = matchData.visionScore / gameDurationMinutes;
    if (visionPerMin >= 1.5) {
      strengths.push('Excellent vision control contributing to team success');
    } else if (visionPerMin < 1.0) {
      weaknesses.push('Vision score is low for game duration');
      recommendations.push(
        'Purchase more control wards and place wards in key objectives',
      );
    }

    // Add default recommendations if needed
    if (recommendations.length === 0) {
      recommendations.push('Continue playing consistently');
      recommendations.push('Focus on objective control and map awareness');
    }

    if (strengths.length === 0) {
      strengths.push('Participated in the match and gained experience');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('Room for improvement in all areas');
    }

    return {
      overallPerformance: matchData.win
        ? `Solid performance in a ${gameDurationMinutes}-minute victory. Your ${matchData.kda} KDA shows good fight participation.`
        : `Tough match in this ${gameDurationMinutes}-minute game. Focus on the key areas below to improve.`,
      strengths,
      weaknesses,
      
      buildAssessment: {
        earlyGame: 'Early game itemization analysis unavailable without timeline data.',
        midGame: 'Mid game build path analysis unavailable without timeline data.',
        lateGame: `Completed ${matchData.items.length} items by game end.`,
        itemTimings: 'Item timing data unavailable - consider enabling timeline tracking.',
        overall: matchData.goldSpent / matchData.goldEarned > 0.9
          ? 'Good gold efficiency overall'
          : `${((1 - matchData.goldSpent / matchData.goldEarned) * 100).toFixed(0)}% gold unspent - optimize your shopping`,
      },
      
      tacticalAssessment: {
        laning: `Farmed ${csPerMin.toFixed(1)} CS/min - ${csPerMin >= 6.5 ? 'solid' : 'needs improvement'}`,
        teamfighting: `${matchData.kda} KDA suggests ${matchData.kda >= 3 ? 'strong' : 'inconsistent'} teamfight performance`,
        objectiveControl: `${matchData.visionScore} vision score - ${matchData.visionScore / gameDurationMinutes >= 1.2 ? 'good' : 'improve'} objective vision`,
        mapAwareness: matchData.deaths <= 3 ? 'Minimal deaths suggest good awareness' : 'Deaths suggest positioning issues',
      },
      
      skillAssessment: {
        mechanics: `${csPerMin.toFixed(1)} CS/min and ${matchData.totalDamageDealtToChampions.toLocaleString()} damage`,
        decisionMaking: matchData.kda >= 3 ? 'Smart fight selection' : 'Review fight decisions',
        adaptability: matchData.win ? 'Successfully adapted to win' : 'Consider alternative approaches',
      },
      
      strategicAssessment: {
        gamePlan: matchData.win ? 'Executed winning strategy' : 'Strategy needs refinement',
        tempo: `Game lasted ${gameDurationMinutes} minutes - ${matchData.win ? 'controlled' : 'contested'} tempo`,
        winConditions: matchData.win ? 'Successfully identified and executed win condition' : 'Struggled to execute win condition',
      },
      
      itemBuildAnalysis:
        matchData.goldSpent / matchData.goldEarned > 0.9
          ? 'Good gold efficiency - spending most earned gold on items.'
          : 'Consider spending your gold more efficiently. You had unused gold at game end.',
      visionControl: `Vision score of ${matchData.visionScore} over ${gameDurationMinutes} minutes. ${visionPerMin >= 1.5 ? 'Keep it up!' : 'Try to improve ward placement and clearing.'}`,
      farmingEfficiency: `${csPerMin.toFixed(1)} CS/min. ${csPerMin >= 7 ? 'Excellent farming!' : 'Focus on improving last-hitting and wave management.'}`,
      fightingStyle: `${matchData.kills}/${matchData.deaths}/${matchData.assists} KDA with ${matchData.totalDamageDealtToChampions.toLocaleString()} damage to champions. ${matchData.kda >= 3 ? 'Strong combat performance!' : 'Work on fight positioning and target selection.'}`,
      recommendations,
      keyTakeaways: [
        `Focus on ${weaknesses[0]?.toLowerCase() || 'consistent improvement'}`,
        'Review this match replay to identify key decision points',
      ],
    };
  }

  /**
   * Delete cached coaching (admin function)
   */
  async deleteCachedCoaching(matchId: string, puuid: string): Promise<void> {
    await this.aiCoachingModel.deleteOne({ matchId, puuid }).exec();
    this.logger.log(`Deleted cached coaching for match ${matchId}, puuid ${puuid}`);
  }
}
