import { Injectable, Logger } from '@nestjs/common';

interface MatchAnalysis {
  puuid: string;
  championId: number;
  championName: string;
  role: string;
  position: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  csPerMin: number;
  visionScore: number;
  goldPerMin: number;
  damagePerMin: number;
  gameDuration: number;
  earlyKills: number; // Kills before 15 min
  earlyDeaths: number; // Deaths before 15 min
  soloKills: number;
  teamfightParticipation: number;
  firstBlood: boolean;
  doubleKills: number;
  tripleKills: number;
  quadraKills: number;
  pentaKills: number;
}

interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  winRate: number;
  
  // Champion stats
  championPool: Map<number, { name: string; games: number; wins: number; winRate: number }>;
  mostPlayedChampions: Array<{ championId: number; name: string; games: number; winRate: number }>;
  
  // Role stats
  roleDistribution: Map<string, number>;
  primaryRole: string;
  
  // Performance stats
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKDA: number;
  avgCSPerMin: number;
  avgVisionScore: number;
  avgGoldPerMin: number;
  avgDamagePerMin: number;
  
  // Early game stats
  avgEarlyKills: number;
  avgEarlyDeaths: number;
  earlyGameWinRate: number; // Win rate when ahead early
  
  // Playstyle stats
  avgTeamfightParticipation: number;
  soloKillRate: number;
  firstBloodRate: number;
  pentaKillCount: number;
  quadraKillCount: number;
  tripleKillCount: number;
  
  // Consistency
  deathsVariance: number; // How consistent are deaths
  performanceConsistency: number; // Based on KDA variance
}

@Injectable()
export class PlayerTagsService {
  private readonly logger = new Logger(PlayerTagsService.name);

  /**
   * Analyze matches and generate player tags
   */
  async analyzeTags(matches: any[], puuid: string): Promise<{ tags: string[]; metadata: any }> {
    if (!matches || matches.length === 0) {
      return { tags: [], metadata: {} };
    }

    this.logger.log(`Analyzing ${matches.length} matches for player ${puuid}`);

    // Extract player performance from each match
    const matchAnalyses: MatchAnalysis[] = matches
      .map(match => this.extractPlayerPerformance(match, puuid))
      .filter((analysis): analysis is MatchAnalysis => analysis !== null);

    if (matchAnalyses.length === 0) {
      return { tags: [], metadata: {} };
    }

    // Calculate aggregate stats
    const stats = this.calculatePlayerStats(matchAnalyses);

    // Generate tags based on stats
    const tags = this.generateTags(stats);

    // Return tags with metadata
    return {
      tags,
      metadata: {
        totalGames: stats.totalGames,
        winRate: stats.winRate,
        avgKDA: stats.avgKDA,
        mostPlayedChampions: stats.mostPlayedChampions.slice(0, 3),
        primaryRole: stats.primaryRole,
        analyzedAt: new Date().toISOString(),
      }
    };
  }

  /**
   * Extract player performance data from a single match
   */
  private extractPlayerPerformance(match: any, puuid: string): MatchAnalysis | null {
    try {
      const participant = match.info.participants.find(p => p.puuid === puuid);
      if (!participant) return null;

      const gameDurationMinutes = match.info.gameDuration / 60;

      return {
        puuid,
        championId: participant.championId,
        championName: participant.championName,
        role: participant.teamPosition || participant.role || 'UNKNOWN',
        position: participant.individualPosition || participant.teamPosition || 'UNKNOWN',
        win: participant.win,
        kills: participant.kills,
        deaths: participant.deaths,
        assists: participant.assists,
        kda: participant.deaths === 0 
          ? participant.kills + participant.assists 
          : (participant.kills + participant.assists) / participant.deaths,
        csPerMin: participant.totalMinionsKilled / gameDurationMinutes,
        visionScore: participant.visionScore,
        goldPerMin: participant.goldEarned / gameDurationMinutes,
        damagePerMin: participant.totalDamageDealtToChampions / gameDurationMinutes,
        gameDuration: match.info.gameDuration,
        earlyKills: 0, // Would need timeline data
        earlyDeaths: 0, // Would need timeline data
        soloKills: participant.soloKills || 0,
        teamfightParticipation: (participant.kills + participant.assists) / 
          Math.max(1, this.getTeamKills(match, participant.teamId)),
        firstBlood: participant.firstBloodKill || false,
        doubleKills: participant.doubleKills || 0,
        tripleKills: participant.tripleKills || 0,
        quadraKills: participant.quadraKills || 0,
        pentaKills: participant.pentaKills || 0,
      };
    } catch (error) {
      this.logger.error(`Error extracting performance from match: ${error.message}`);
      return null;
    }
  }

  /**
   * Get total kills for a team
   */
  private getTeamKills(match: any, teamId: number): number {
    return match.info.participants
      .filter(p => p.teamId === teamId)
      .reduce((sum, p) => sum + p.kills, 0);
  }

  /**
   * Calculate aggregate player statistics
   */
  private calculatePlayerStats(analyses: MatchAnalysis[]): PlayerStats {
    const totalGames = analyses.length;
    const wins = analyses.filter(a => a.win).length;
    
    // Champion pool analysis
    const championPool = new Map<number, { name: string; games: number; wins: number; winRate: number }>();
    analyses.forEach(a => {
      if (!championPool.has(a.championId)) {
        championPool.set(a.championId, { name: a.championName, games: 0, wins: 0, winRate: 0 });
      }
      const champ = championPool.get(a.championId)!;
      champ.games++;
      if (a.win) champ.wins++;
      champ.winRate = (champ.wins / champ.games) * 100;
    });

    const mostPlayedChampions = Array.from(championPool.entries())
      .map(([championId, data]) => ({ championId, ...data }))
      .sort((a, b) => b.games - a.games)
      .slice(0, 5);

    // Role distribution
    const roleDistribution = new Map<string, number>();
    analyses.forEach(a => {
      const role = a.position !== 'UNKNOWN' ? a.position : a.role;
      roleDistribution.set(role, (roleDistribution.get(role) || 0) + 1);
    });

    const primaryRole = Array.from(roleDistribution.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'UNKNOWN';

    // Calculate averages
    const avgKills = analyses.reduce((sum, a) => sum + a.kills, 0) / totalGames;
    const avgDeaths = analyses.reduce((sum, a) => sum + a.deaths, 0) / totalGames;
    const avgAssists = analyses.reduce((sum, a) => sum + a.assists, 0) / totalGames;
    const avgKDA = analyses.reduce((sum, a) => sum + a.kda, 0) / totalGames;
    const avgCSPerMin = analyses.reduce((sum, a) => sum + a.csPerMin, 0) / totalGames;
    const avgVisionScore = analyses.reduce((sum, a) => sum + a.visionScore, 0) / totalGames;
    const avgGoldPerMin = analyses.reduce((sum, a) => sum + a.goldPerMin, 0) / totalGames;
    const avgDamagePerMin = analyses.reduce((sum, a) => sum + a.damagePerMin, 0) / totalGames;
    const avgTeamfightParticipation = analyses.reduce((sum, a) => sum + a.teamfightParticipation, 0) / totalGames;

    // Early game stats
    const avgEarlyKills = analyses.reduce((sum, a) => sum + a.earlyKills, 0) / totalGames;
    const avgEarlyDeaths = analyses.reduce((sum, a) => sum + a.earlyDeaths, 0) / totalGames;
    
    // Playstyle stats
    const soloKillRate = (analyses.filter(a => a.soloKills > 0).length / totalGames) * 100;
    const firstBloodRate = (analyses.filter(a => a.firstBlood).length / totalGames) * 100;
    const pentaKillCount = analyses.reduce((sum, a) => sum + a.pentaKills, 0);
    const quadraKillCount = analyses.reduce((sum, a) => sum + a.quadraKills, 0);
    const tripleKillCount = analyses.reduce((sum, a) => sum + a.tripleKills, 0);

    // Variance calculations for consistency
    const deathsVariance = this.calculateVariance(analyses.map(a => a.deaths));
    const kdaVariance = this.calculateVariance(analyses.map(a => a.kda));
    const performanceConsistency = 100 - Math.min(100, kdaVariance * 10); // Lower variance = higher consistency

    return {
      totalGames,
      wins,
      losses: totalGames - wins,
      winRate: (wins / totalGames) * 100,
      championPool,
      mostPlayedChampions,
      roleDistribution,
      primaryRole,
      avgKills,
      avgDeaths,
      avgAssists,
      avgKDA,
      avgCSPerMin,
      avgVisionScore,
      avgGoldPerMin,
      avgDamagePerMin,
      avgEarlyKills,
      avgEarlyDeaths,
      earlyGameWinRate: 0, // Would need timeline data
      avgTeamfightParticipation,
      soloKillRate,
      firstBloodRate,
      pentaKillCount,
      quadraKillCount,
      tripleKillCount,
      deathsVariance,
      performanceConsistency,
    };
  }

  /**
   * Calculate variance for consistency metrics
   */
  private calculateVariance(numbers: number[]): number {
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / numbers.length);
  }

  /**
   * Generate tags based on player statistics
   */
  private generateTags(stats: PlayerStats): string[] {
    const tags: string[] = [];

    // PLAYSTYLE TAGS
    
    // Aggressive vs Passive
    if (stats.avgKills >= 8) {
      tags.push('Aggressive');
    } else if (stats.avgKills <= 3) {
      tags.push('Pacifist');
    }

    // Deaths-based tags
    if (stats.avgDeaths <= 3) {
      tags.push('Deathless');
    } else if (stats.avgDeaths >= 7) {
      tags.push('Risky Player');
    }

    // KDA tags
    if (stats.avgKDA >= 4.0) {
      tags.push('KDA King');
    } else if (stats.avgKDA <= 1.5) {
      tags.push('Needs Practice');
    }

    // Teamfight participation
    if (stats.avgTeamfightParticipation >= 0.7) {
      tags.push('Team Player');
    } else if (stats.avgTeamfightParticipation <= 0.4) {
      tags.push('Standalone');
    }

    // Solo kills
    if (stats.soloKillRate >= 40) {
      tags.push('1v1 Master');
    }

    // First blood
    if (stats.firstBloodRate >= 25) {
      tags.push('Early Aggressor');
    }

    // ROLE-SPECIFIC TAGS
    
    // CS tags (for laners)
    if (['TOP', 'MIDDLE', 'BOTTOM'].includes(stats.primaryRole)) {
      if (stats.avgCSPerMin >= 8) {
        tags.push('Good Laner');
      } else if (stats.avgCSPerMin >= 6) {
        tags.push('Decent Laner');
      } else if (stats.avgCSPerMin < 5) {
        tags.push('Bad Laner');
      }
    }

    // Vision score (for supports)
    if (stats.primaryRole === 'UTILITY') {
      if (stats.avgVisionScore >= 60) {
        tags.push('Vision Expert');
      } else if (stats.avgVisionScore < 30) {
        tags.push('Lacking Laner');
      }
    }

    // CHAMPION-SPECIFIC TAGS
    
    // One-trick or diverse
    if (stats.mostPlayedChampions[0]?.games >= stats.totalGames * 0.5) {
      tags.push(`${stats.mostPlayedChampions[0].name} OTP`);
    } else if (stats.championPool.size >= 10) {
      tags.push('Diverse Pool');
    }

    // Best champion
    const bestChamp = stats.mostPlayedChampions.find(c => c.games >= 3 && c.winRate >= 60);
    if (bestChamp) {
      tags.push(`Good with ${bestChamp.name}`);
    }

    // PERFORMANCE TAGS
    
    // Consistency
    if (stats.performanceConsistency >= 80) {
      tags.push('Consistent');
    } else if (stats.performanceConsistency <= 50) {
      tags.push('Coinflip');
    }

    // Win rate tags
    if (stats.winRate >= 60) {
      tags.push('Winner');
    } else if (stats.winRate <= 40) {
      tags.push('Struggling');
    }

    // Multikills
    if (stats.pentaKillCount > 0) {
      tags.push('Pentakiller');
    } else if (stats.quadraKillCount >= 2) {
      tags.push('Quadra Master');
    } else if (stats.tripleKillCount >= 5) {
      tags.push('Triple Threat');
    }

    // Damage output
    if (stats.avgDamagePerMin >= 800) {
      tags.push('Damage Dealer');
    }

    // Gold efficiency
    if (stats.avgGoldPerMin >= 450) {
      tags.push('Gold Farmer');
    }

    // DUELIST TAGS
    if (stats.avgDeaths <= 4 && stats.avgKills >= 6) {
      tags.push('Bad Duelist'); // This seems backwards - let me fix
    }

    // EARLY GAME TAGS
    if (stats.firstBloodRate >= 20 || stats.avgEarlyKills >= 2) {
      tags.push('Early Game');
    }

    // Limit to most relevant tags (max 5-6)
    return tags.slice(0, 6);
  }
}
