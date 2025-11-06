import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AIInsights, AIInsightsDocument } from './schemas/ai-insights.schema';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';

interface Match {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    queueId: number;
    participants: MatchParticipant[];
    teams: any[];
  };
}

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
  totalDamageDealtToChampions: number;
  visionScore: number;
  profileIcon?: number;
  pentaKills?: number;
  quadraKills?: number;
  tripleKills?: number;
  doubleKills?: number;
}

interface GenerateInsightsDto {
  puuid: string;
  gameName: string;
  tagLine: string;
  region: string;
  matches: Match[];
}

@Injectable()
export class AIInsightsService {
  private readonly logger = new Logger(AIInsightsService.name);
  private readonly OLLAMA_URL = 'http://localhost:11434/api/generate';
  private readonly MODEL = 'llama3.1:8b-instruct-q4_K_M';
  private readonly CACHE_EXPIRY_DAYS = 7;

  constructor(
    @InjectModel(AIInsights.name)
    private aiInsightsModel: Model<AIInsightsDocument>,
    private httpService: HttpService,
  ) {}

  /**
   * Generate hash of match data for cache matching
   * Include puuid to make it summoner-specific
   */
  private generateMatchDataHash(puuid: string, matches: Match[]): string {
    // Sort match IDs to ensure consistent hashing
    const matchIds = matches.map(m => m.metadata.matchId).sort();
    // Include puuid so each summoner gets their own cache even with shared matches
    const hashInput = `${puuid}:${matchIds.join(',')}`;
    return crypto.createHash('sha256').update(hashInput).digest('hex');
  }

  /**
   * Analyze match data and extract statistics
   */
  private analyzeMatches(puuid: string, matches: Match[]) {
    const playerStats = {
      totalGames: matches.length,
      wins: 0,
      losses: 0,
      totalKills: 0,
      totalDeaths: 0,
      totalAssists: 0,
      totalDamage: 0,
      totalGold: 0,
      totalCS: 0,
      championStats: new Map<string, any>(),
      teammateStats: new Map<string, any>(),
      gameModeStats: new Map<number, any>(),
      roleStats: new Map<string, number>(),
      multikills: { double: 0, triple: 0, quadra: 0, penta: 0 },
      longestWinStreak: 0,
      longestLossStreak: 0,
      currentStreak: 0,
      pentaKillGames: [] as any[],
    };

    let currentWinStreak = 0;
    let currentLossStreak = 0;

    matches.forEach((match, index) => {
      const player = match.info.participants.find(p => p.puuid === puuid);
      if (!player) return;

      // Basic stats
      playerStats.totalKills += player.kills;
      playerStats.totalDeaths += player.deaths;
      playerStats.totalAssists += player.assists;
      playerStats.totalDamage += player.totalDamageDealtToChampions || 0;
      playerStats.totalGold += player.goldEarned || 0;
      playerStats.totalCS += (player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0);
      
      // Multikills tracking
      if (player.pentaKills && player.pentaKills > 0) {
        playerStats.multikills.penta += player.pentaKills;
        playerStats.pentaKillGames.push({
          matchId: match.metadata.matchId,
          champion: player.championName,
          championId: player.championId,
        });
      }
      if (player.quadraKills) playerStats.multikills.quadra += player.quadraKills;
      if (player.tripleKills) playerStats.multikills.triple += player.tripleKills;
      if (player.doubleKills) playerStats.multikills.double += player.doubleKills;

      // Win/Loss tracking and streaks
      if (player.win) {
        playerStats.wins++;
        currentWinStreak++;
        currentLossStreak = 0;
        if (currentWinStreak > playerStats.longestWinStreak) {
          playerStats.longestWinStreak = currentWinStreak;
        }
      } else {
        playerStats.losses++;
        currentLossStreak++;
        currentWinStreak = 0;
        if (currentLossStreak > playerStats.longestLossStreak) {
          playerStats.longestLossStreak = currentLossStreak;
        }
      }

      // Current streak (most recent)
      if (index === 0) {
        playerStats.currentStreak = player.win ? currentWinStreak : -currentLossStreak;
      }

      // Champion stats
      const champKey = player.championName;
      if (!playerStats.championStats.has(champKey)) {
        playerStats.championStats.set(champKey, {
          championId: player.championId,
          name: player.championName,
          games: 0,
          wins: 0,
          kills: 0,
          deaths: 0,
          assists: 0,
        });
      }
      const champStat = playerStats.championStats.get(champKey);
      champStat.games++;
      if (player.win) champStat.wins++;
      champStat.kills += player.kills;
      champStat.deaths += player.deaths;
      champStat.assists += player.assists;

      // Teammate stats - enhanced with profile icons
      match.info.participants
        .filter(p => p.teamId === player.teamId && p.puuid !== puuid)
        .forEach(teammate => {
          const teammateKey = teammate.puuid;
          if (!playerStats.teammateStats.has(teammateKey)) {
            playerStats.teammateStats.set(teammateKey, {
              puuid: teammate.puuid,
              gameName: teammate.riotIdGameName,
              tagLine: teammate.riotIdTagline,
              profileIconId: teammate.profileIcon || 0,
              gamesPlayed: 0,
              wins: 0,
              losses: 0,
            });
          }
          const teammateStat = playerStats.teammateStats.get(teammateKey);
          teammateStat.gamesPlayed++;
          if (player.win) {
            teammateStat.wins++;
          } else {
            teammateStat.losses++;
          }
          // Update profile icon (use most recent)
          teammateStat.profileIconId = teammate.profileIcon || teammateStat.profileIconId;
        });

      // Game mode stats
      const queueId = match.info.queueId;
      if (!playerStats.gameModeStats.has(queueId)) {
        playerStats.gameModeStats.set(queueId, {
          games: 0,
          wins: 0,
        });
      }
      const modeStat = playerStats.gameModeStats.get(queueId);
      modeStat.games++;
      if (player.win) modeStat.wins++;

      // Role stats
      const role = player.teamPosition || 'UNKNOWN';
      playerStats.roleStats.set(role, (playerStats.roleStats.get(role) || 0) + 1);
    });

    return playerStats;
  }

  /**
   * Format analyzed data for AI and response
   */
  private formatAnalyzedData(stats: any) {
    // Top champions
    const topChampions = Array.from(stats.championStats.values())
      .map((champ: any) => ({
        ...champ,
        losses: champ.games - champ.wins,
        winRate: ((champ.wins / champ.games) * 100).toFixed(1),
        avgKDA: champ.deaths > 0
          ? (((champ.kills + champ.assists) / champ.deaths) / champ.games).toFixed(2)
          : ((champ.kills + champ.assists) / champ.games).toFixed(2),
      }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 10);

    // Worst performing champions (min 3 games)
    const worstChampions = Array.from(stats.championStats.values())
      .filter((champ: any) => champ.games >= 3)
      .map((champ: any) => ({
        ...champ,
        losses: champ.games - champ.wins,
        winRate: ((champ.wins / champ.games) * 100).toFixed(1),
        avgKDA: champ.deaths > 0
          ? (((champ.kills + champ.assists) / champ.deaths) / champ.games).toFixed(2)
          : ((champ.kills + champ.assists) / champ.games).toFixed(2),
      }))
      .sort((a, b) => parseFloat(a.winRate) - parseFloat(b.winRate))
      .slice(0, 5);

    // Best teammates (highest win rate, min 5 games)
    const bestTeammates = Array.from(stats.teammateStats.values())
      .filter((tm: any) => tm.gamesPlayed >= 5)
      .map((tm: any) => ({
        ...tm,
        winRate: ((tm.wins / tm.gamesPlayed) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
      .slice(0, 5);

    // Worst teammates (lowest win rate, min 5 games)
    const worstTeammates = Array.from(stats.teammateStats.values())
      .filter((tm: any) => tm.gamesPlayed >= 5)
      .map((tm: any) => ({
        ...tm,
        winRate: ((tm.wins / tm.gamesPlayed) * 100).toFixed(1),
      }))
      .sort((a, b) => parseFloat(a.winRate) - parseFloat(b.winRate))
      .slice(0, 5);

    // Game mode stats
    const gameModeStats: any = {};
    stats.gameModeStats.forEach((modeStat: any, queueId: number) => {
      gameModeStats[queueId] = {
        games: modeStat.games,
        wins: modeStat.wins,
        winRate: ((modeStat.wins / modeStat.games) * 100).toFixed(1),
      };
    });

    // Favorite role
    let favoriteRole = 'UNKNOWN';
    let maxRoleGames = 0;
    stats.roleStats.forEach((games: number, role: string) => {
      if (games > maxRoleGames) {
        maxRoleGames = games;
        favoriteRole = role;
      }
    });

    // Favorite game mode
    let favoriteGameMode = 'Unknown';
    let maxModeGames = 0;
    stats.gameModeStats.forEach((modeStat: any, queueId: number) => {
      if (modeStat.games > maxModeGames) {
        maxModeGames = modeStat.games;
        favoriteGameMode = this.getQueueName(queueId);
      }
    });

    const avgKDA = stats.totalDeaths > 0
      ? ((stats.totalKills + stats.totalAssists) / stats.totalDeaths).toFixed(2)
      : (stats.totalKills + stats.totalAssists).toFixed(2);

    return {
      stats: {
        totalGames: stats.totalGames,
        wins: stats.wins,
        losses: stats.losses,
        winRate: ((stats.wins / stats.totalGames) * 100).toFixed(1),
        avgKDA,
        avgKills: (stats.totalKills / stats.totalGames).toFixed(1),
        avgDeaths: (stats.totalDeaths / stats.totalGames).toFixed(1),
        avgAssists: (stats.totalAssists / stats.totalGames).toFixed(1),
        avgDamage: Math.round(stats.totalDamage / stats.totalGames),
        avgGold: Math.round(stats.totalGold / stats.totalGames),
        avgCS: (stats.totalCS / stats.totalGames).toFixed(1),
        longestWinStreak: stats.longestWinStreak,
        longestLossStreak: stats.longestLossStreak,
        currentStreak: stats.currentStreak,
        favoriteRole,
        favoriteGameMode,
        multikills: stats.multikills,
        pentaKillGames: stats.pentaKillGames,
      },
      topChampions,
      worstChampions,
      bestTeammates,
      worstTeammates,
      gameModeStats,
    };
  }

  /**
   * Get queue name from ID
   */
  private getQueueName(queueId: number): string {
    const queueNames: { [key: number]: string } = {
      420: 'Ranked Solo/Duo',
      440: 'Ranked Flex',
      450: 'ARAM',
      400: 'Normal Draft',
      430: 'Normal Blind',
      490: 'Quickplay',
      700: 'Clash',
    };
    return queueNames[queueId] || `Queue ${queueId}`;
  }

  /**
   * Call Ollama to generate AI insights
   */
  private async generateAISummary(data: any): Promise<string> {
    const prompt = `You are an expert League of Legends analyst creating an epic "Season Rewind" tagline. Be engaging, enthusiastic, and personal.

Player Performance:
- Total Games: ${data.stats.totalGames}
- Win Rate: ${data.stats.winRate}% (${data.stats.wins}W - ${data.stats.losses}L)
- Average KDA: ${data.stats.avgKDA}
- Favorite Role: ${data.stats.favoriteRole}
- Top Champion: ${data.topChampions[0]?.name} (${data.topChampions[0]?.games} games, ${data.topChampions[0]?.winRate}% WR)
${data.stats.multikills.penta > 0 ? `- 🌟 PENTAKILLS: ${data.stats.multikills.penta}!` : ''}
${data.stats.longestWinStreak >= 5 ? `- ${data.stats.longestWinStreak}-game win streak!` : ''}

Write ONLY 2 short, punchy sentences (max 30 words total) that capture their season highlight. Make it exciting and personal like "You dominated the Rift with a 57% win rate across 120 battles. Your Smolder mastery and 5-game win streak proved you're unstoppable!" 

Use second person ("You/Your"). NO bullet points. NO long paragraphs. Just 2 exciting sentences!`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.OLLAMA_URL, {
          model: this.MODEL,
          prompt,
          stream: false,
        }, {
          timeout: 60000, // 60 second timeout
        })
      );

      return response.data.response;
    } catch (error) {
      this.logger.error('Failed to generate AI summary:', error);
      return this.getFallbackSummary(data);
    }
  }

  /**
   * Generate strengths from data
   */
  private async generateStrengths(data: any): Promise<string[]> {
    const strengths: string[] = [];

    if (parseFloat(data.stats.winRate) >= 52) {
      strengths.push(`Strong overall win rate of ${data.stats.winRate}%`);
    }

    if (parseFloat(data.stats.avgKDA) >= 3) {
      strengths.push(`Excellent KDA of ${data.stats.avgKDA} - great at staying alive`);
    }

    if (data.stats.longestWinStreak >= 5) {
      strengths.push(`Impressive ${data.stats.longestWinStreak}-game win streak - unstoppable momentum!`);
    }

    if (data.stats.multikills.penta > 0) {
      strengths.push(`🌟 LEGENDARY: ${data.stats.multikills.penta} Pentakill${data.stats.multikills.penta > 1 ? 's' : ''}!`);
    } else if (data.stats.multikills.quadra > 0) {
      strengths.push(`${data.stats.multikills.quadra} Quadrakill${data.stats.multikills.quadra > 1 ? 's' : ''} - almost perfect!`);
    }

    if (data.topChampions[0] && parseFloat(data.topChampions[0].winRate) >= 55) {
      strengths.push(`${data.topChampions[0].name} mastery with ${data.topChampions[0].winRate}% win rate`);
    }

    if (data.bestTeammates.length > 0 && data.bestTeammates[0].wins >= 5) {
      strengths.push(`Great synergy with ${data.bestTeammates[0].gameName} - ${data.bestTeammates[0].wins} wins together!`);
    }

    if (parseFloat(data.stats.avgDamage) > 20000) {
      strengths.push(`High damage output - averaging ${Math.round(data.stats.avgDamage / 1000)}k damage per game`);
    }

    if (strengths.length === 0) {
      strengths.push('Consistent performance across games');
      strengths.push('Dedicated to improving');
    }

    return strengths;
  }

  /**
   * Generate weaknesses/improvement areas from data
   */
  private async generateWeaknesses(data: any): Promise<string[]> {
    const weaknesses: string[] = [];

    if (parseFloat(data.stats.avgDeaths) >= 7) {
      weaknesses.push(`High death average (${data.stats.avgDeaths}) - focus on positioning and map awareness`);
    }

    if (data.stats.longestLossStreak >= 5) {
      weaknesses.push(`Had a ${data.stats.longestLossStreak}-game loss streak - consider taking breaks during tilts`);
    }

    if (data.worstChampions.length > 0 && parseFloat(data.worstChampions[0].winRate) < 45) {
      weaknesses.push(`Struggling with ${data.worstChampions[0].name} (${data.worstChampions[0].winRate}% WR) - consider practice or alternatives`);
    }

    if (parseFloat(data.stats.winRate) < 48) {
      weaknesses.push('Opportunity to improve overall consistency and game knowledge');
    }

    if (data.worstTeammates.length > 0 && data.worstTeammates[0].losses >= 5) {
      weaknesses.push(`Low win rate with ${data.worstTeammates[0].gameName} - team synergy needs work`);
    }

    if (parseFloat(data.stats.avgCS) < 5) {
      weaknesses.push('Focus on CS (farm) to gain gold advantages');
    }

    if (weaknesses.length === 0) {
      weaknesses.push('Expand champion pool for more versatility');
      weaknesses.push('Focus on objective control and vision');
    }

    return weaknesses;
  }

  /**
   * Fallback summary if AI fails
   */
  private getFallbackSummary(data: any): string {
    const topChamp = data.topChampions[0];
    return `You crushed ${data.stats.totalGames} games with a ${data.stats.winRate}% win rate! Your ${topChamp.name} dominance (${topChamp.games} games, ${topChamp.winRate}% WR) was legendary.`;
  }

  /**
   * Merges cached stats with new analyzed stats for incremental updates
   */
  private mergeAnalyzedStats(cached: any, newStats: any, oldMatchCount: number, newMatchCount: number): any {
    // Deep copy existing stats to avoid mutations
    const oldStats = {
      totalKills: cached.stats.totalKills || 0,
      totalDeaths: cached.stats.totalDeaths || 0,
      totalAssists: cached.stats.totalAssists || 0,
      totalCS: cached.stats.totalCS || 0,
      totalDamage: cached.stats.totalDamage || 0,
      totalGold: cached.stats.totalGold || 0,
      wins: cached.stats.wins || 0,
      losses: cached.stats.losses || 0,
      pentakills: cached.stats.pentakills || 0,
      quadrakills: cached.stats.quadrakills || 0,
      triplekills: cached.stats.triplekills || 0,
      doublekills: cached.stats.doublekills || 0,
    };

    // Merge basic stats
    const mergedStats = {
      totalGames: newMatchCount, // Total match count
      totalKills: oldStats.totalKills + newStats.totalKills,
      totalDeaths: oldStats.totalDeaths + newStats.totalDeaths,
      totalAssists: oldStats.totalAssists + newStats.totalAssists,
      totalCS: oldStats.totalCS + newStats.totalCS,
      totalDamage: oldStats.totalDamage + newStats.totalDamage,
      totalGold: oldStats.totalGold + newStats.totalGold,
      wins: oldStats.wins + newStats.wins,
      losses: oldStats.losses + newStats.losses,
      multikills: {
        penta: oldStats.pentakills + (newStats.multikills?.penta || 0),
        quadra: oldStats.quadrakills + (newStats.multikills?.quadra || 0),
        triple: oldStats.triplekills + (newStats.multikills?.triple || 0),
        double: oldStats.doublekills + (newStats.multikills?.double || 0),
      },
      pentaKillGames: [...(cached.stats.pentaKillGames || []), ...(newStats.pentaKillGames || [])],
    };

    // Merge champion stats
    const championMap = new Map<string, any>();
    
    // Add cached champions
    if (cached.topChampions) {
      for (const champ of cached.topChampions) {
        championMap.set(champ.championId || champ.name, {
          championId: champ.championId,
          name: champ.name,
          games: champ.games,
          wins: champ.wins,
          losses: champ.losses,
          kills: champ.kills,
          deaths: champ.deaths,
          assists: champ.assists,
        });
      }
    }
    
    // Merge new champion data (newStats has championStats, not champions)
    if (newStats.championStats) {
      for (const [champId, data] of newStats.championStats) {
        const existing = championMap.get(champId);
        if (existing) {
          existing.games += data.games;
          existing.wins += data.wins;
          existing.kills += data.kills;
          existing.deaths += data.deaths;
          existing.assists += data.assists;
        } else {
          championMap.set(champId, { ...data });
        }
      }
    }

    // Merge teammate stats
    const teammateMap = new Map<string, any>();
    
    // Add cached teammates
    const allCachedTeammates = [...(cached.bestTeammates || []), ...(cached.worstTeammates || [])];
    for (const teammate of allCachedTeammates) {
      teammateMap.set(teammate.puuid, {
        puuid: teammate.puuid,
        gameName: teammate.gameName,
        tagLine: teammate.tagLine,
        profileIconId: teammate.profileIconId,
        gamesPlayed: teammate.wins + teammate.losses, // Recalculate from wins/losses
        wins: teammate.wins,
        losses: teammate.losses,
      });
    }
    
    // Merge new teammate data (newStats has teammateStats, not teammates)
    if (newStats.teammateStats) {
      for (const [puuid, data] of newStats.teammateStats) {
        const existing = teammateMap.get(puuid);
        if (existing) {
          existing.gamesPlayed += data.gamesPlayed;
          existing.wins += data.wins;
          existing.losses += data.losses;
        } else {
          teammateMap.set(puuid, { ...data });
        }
      }
    }

    // Merge win/loss streaks
    const longestWinStreak = Math.max(
      cached.stats.longestWinStreak || 0,
      newStats.longestWinStreak || 0
    );
    
    const longestLossStreak = Math.max(
      cached.stats.longestLossStreak || 0,
      newStats.longestLossStreak || 0
    );

    // Merge role stats
    const roleStatsMap = new Map<string, number>();
    
    // Add cached role stats
    if (cached.stats.favoriteRole) {
      // We only have the favorite role, not all role stats
      // So we'll just use the new stats for roles
      if (newStats.roleStats) {
        for (const [role, count] of newStats.roleStats) {
          roleStatsMap.set(role, count);
        }
      }
    } else if (newStats.roleStats) {
      for (const [role, count] of newStats.roleStats) {
        roleStatsMap.set(role, count);
      }
    }

    // Merge game modes
    const gameModeMap = new Map<number, any>();
    
    // Add cached game modes from gameModeStats
    if (cached.gameModeStats) {
      for (const [queueId, stats] of Object.entries(cached.gameModeStats)) {
        gameModeMap.set(parseInt(queueId), { ...stats as any });
      }
    }
    
    // Merge new game mode data (newStats has gameModeStats, not gameModes)
    if (newStats.gameModeStats) {
      for (const [queueId, data] of newStats.gameModeStats) {
        const existing = gameModeMap.get(queueId);
        if (existing) {
          existing.games += data.games;
          existing.wins += data.wins;
          // Calculate losses
          existing.losses = (existing.losses || 0) + (data.games - data.wins);
        } else {
          gameModeMap.set(queueId, { 
            ...data,
            losses: data.games - data.wins,
          });
        }
      }
    }

    // Return merged data structure
    return {
      ...mergedStats,
      championStats: championMap, // Use championStats to match analyzeMatches return
      teammateStats: teammateMap, // Use teammateStats to match analyzeMatches return
      roleStats: roleStatsMap, // Add roleStats
      longestWinStreak,
      longestLossStreak,
      currentStreak: newStats.currentStreak || 0, // Use currentStreak from analyzeMatches
      gameModeStats: gameModeMap, // Use gameModeStats to match analyzeMatches return
    };
  }

  /**
   * Main function to generate insights
   */
  async generateInsights(dto: GenerateInsightsDto): Promise<any> {
    const { puuid, gameName, tagLine, region, matches } = dto;

    // Generate hash for cache lookup (includes puuid to make it summoner-specific)
    const matchDataHash = this.generateMatchDataHash(puuid, matches);

    // Check cache first
    const cached = await this.aiInsightsModel.findOne({
      puuid,
      expiresAt: { $gt: new Date() },
    });

    if (cached) {
      this.logger.log(
        `📋 Cache found for ${gameName}#${tagLine} - ` +
        `Cached: ${cached.matchCount} matches (hash: ${cached.matchDataHash.substring(0, 8)}...), ` +
        `Incoming: ${matches.length} matches (hash: ${matchDataHash.substring(0, 8)}...)`
      );
      
      // Check if the match data has changed (new matches or different matches)
      if (cached.matchDataHash === matchDataHash && cached.matchCount === matches.length) {
        this.logger.log(`✅ Cache hit for ${gameName}#${tagLine} (puuid: ${puuid}) - ${matches.length} matches`);
        
        return {
          cached: true,
          puuid: cached.puuid,
          gameName: cached.gameName,
          tagLine: cached.tagLine,
          stats: cached.stats,
          topChampions: cached.topChampions.slice(0, 6),
          worstChampions: cached.worstChampions,
          bestTeammates: cached.bestTeammates,
          worstTeammates: cached.worstTeammates,
          strengths: cached.strengths,
          weaknesses: cached.weaknesses,
          summary: cached.summary,
          gameModeStats: cached.gameModeStats,
        };
      } else if (matches.length > cached.matchCount && cached.matchDataHash !== matchDataHash) {
        // Incremental update: only analyze new matches
        // Hash must be different (new matches added) AND count must be higher
        this.logger.log(
          `🔄 Incremental update for ${gameName}#${tagLine} - ` +
          `Analyzing ${matches.length - cached.matchCount} new matches (${cached.matchCount} → ${matches.length})`
        );
        
        // Extract only new matches
        const newMatches = matches.slice(0, matches.length - cached.matchCount);
        
        // Analyze only new matches
        const newAnalyzedStats = this.analyzeMatches(puuid, newMatches);
        
        // Merge with existing cache data
        const mergedStats = this.mergeAnalyzedStats(cached, newAnalyzedStats, cached.matchCount, matches.length);
        const formattedData = this.formatAnalyzedData(mergedStats);
        
        // Regenerate AI summary with updated data
        const summary = await this.generateAISummary(formattedData);
        const strengths = await this.generateStrengths(formattedData);
        const weaknesses = await this.generateWeaknesses(formattedData);
        
        // Update cache
        cached.matchCount = matches.length;
        cached.matchDataHash = matchDataHash;
        cached.stats = formattedData.stats;
        cached.topChampions = formattedData.topChampions;
        cached.worstChampions = formattedData.worstChampions;
        cached.bestTeammates = formattedData.bestTeammates;
        cached.worstTeammates = formattedData.worstTeammates;
        cached.strengths = strengths;
        cached.weaknesses = weaknesses;
        cached.summary = summary;
        cached.gameModeStats = formattedData.gameModeStats;
        cached.expiresAt = new Date(Date.now() + this.CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        
        await cached.save();
        this.logger.log(
          `✅ Incremental update completed for ${gameName}#${tagLine} - Now ${matches.length} total matches. ` +
          `Stats: ${formattedData.stats.wins}W-${formattedData.stats.losses}L (${formattedData.stats.winRate}% WR)`
        );
        
        return {
          cached: false,
          incremental: true,
          puuid: cached.puuid,
          gameName: cached.gameName,
          tagLine: cached.tagLine,
          stats: cached.stats,
          topChampions: cached.topChampions.slice(0, 6),
          worstChampions: cached.worstChampions,
          bestTeammates: cached.bestTeammates,
          worstTeammates: cached.worstTeammates,
          strengths: cached.strengths,
          weaknesses: cached.weaknesses,
          summary: cached.summary,
          gameModeStats: cached.gameModeStats,
        };
      } else {
        // Cache is stale (different matches detected - full recompute needed)
        this.logger.log(
          `⚠️ Cache invalidated for ${gameName}#${tagLine} - Different match data detected. ` +
          `Old: ${cached.matchCount} matches, New: ${matches.length} matches. ` +
          `Hash changed: ${cached.matchDataHash.substring(0, 8)}... → ${matchDataHash.substring(0, 8)}...`
        );
        // Delete old cache entry
        await this.aiInsightsModel.deleteOne({ _id: cached._id });
      }
    } else {
      this.logger.log(`📭 No cache found for ${gameName}#${tagLine} (puuid: ${puuid})`);
    }

    this.logger.log(`🔨 Generating new insights for ${gameName}#${tagLine} (puuid: ${puuid}) with ${matches.length} matches`);

    // Analyze matches
    const analyzedStats = this.analyzeMatches(puuid, matches);
    const formattedData = this.formatAnalyzedData(analyzedStats);

    // Generate AI summary
    const summary = await this.generateAISummary(formattedData);
    const strengths = await this.generateStrengths(formattedData);
    const weaknesses = await this.generateWeaknesses(formattedData);

    // Save to cache
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.CACHE_EXPIRY_DAYS);

    const insights = new this.aiInsightsModel({
      puuid,
      gameName,
      tagLine,
      region,
      matchCount: matches.length,
      matchDataHash,
      stats: formattedData.stats,
      topChampions: formattedData.topChampions,
      worstChampions: formattedData.worstChampions,
      bestTeammates: formattedData.bestTeammates,
      worstTeammates: formattedData.worstTeammates,
      strengths,
      weaknesses,
      summary,
      gameModeStats: formattedData.gameModeStats,
      expiresAt,
    });

    await insights.save();
    this.logger.log(`Insights cached for ${gameName}#${tagLine}`);

    return {
      cached: false,
      stats: formattedData.stats,
      topChampions: formattedData.topChampions.slice(0, 6),
      worstChampions: formattedData.worstChampions,
      bestTeammates: formattedData.bestTeammates,
      worstTeammates: formattedData.worstTeammates,
      strengths,
      weaknesses,
      summary,
      gameModeStats: formattedData.gameModeStats,
    };
  }
}
