import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RiotEsportsService {
  private data: any;

  constructor() {
    this.loadData();
  }

  private loadData() {
    // Use absolute path from project root to ensure it works in both dev and prod
    const filePath = path.join(process.cwd(), 'src', 'riot-esports', 'data', 'lol-esports-2025.json');
    try {
      const rawData = fs.readFileSync(filePath, 'utf-8');
      this.data = JSON.parse(rawData);
    } catch (error) {
      console.error('Error loading LoL esports data:', error);
      // Fallback to empty data structure
      this.data = {
        leagues: [],
        tournaments: {},
        matches: {},
        teams: [],
        standings: {}
      };
    }
  }

  getLeagues() {
    return this.data.leagues;
  }

  getTournaments(leagueId?: string) {
    if (leagueId) {
      return this.data.tournaments[leagueId] || [];
    }
    
    // Flatten all tournaments from all leagues into a single array
    const allTournaments: any[] = [];
    for (const league in this.data.tournaments) {
      allTournaments.push(...this.data.tournaments[league]);
    }
    return allTournaments;
  }

  getSchedule(leagueId?: string) {
    if (leagueId) {
      return this.data.matches[leagueId] || [];
    }
    
    // Flatten all matches from all leagues into a single array
    const allMatches: any[] = [];
    for (const league in this.data.matches) {
      allMatches.push(...this.data.matches[league]);
    }
    return allMatches;
  }

  getTeams(leagueId?: string) {
    if (leagueId) {
      return this.data.teamsByLeague?.[leagueId] || [];
    }
    
    // Return all teams from all leagues
    if (!this.data.teamsByLeague) return [];
    
    const allTeams: any[] = [];
    for (const league in this.data.teamsByLeague) {
      allTeams.push(...this.data.teamsByLeague[league]);
    }
    return allTeams;
  }

  getStandings(tournamentId: string) {
    return this.data.standings[tournamentId] || [];
  }

  getRegularSeasonStandings(leagueId?: string, year?: string, split?: string) {
    if (!this.data.regularSeasonStandings) {
      return [];
    }

    if (leagueId) {
      const leagueStandings = this.data.regularSeasonStandings[leagueId];
      if (!leagueStandings) return [];

      if (year) {
        const yearStandings = leagueStandings[year];
        if (!yearStandings) return [];

        if (split) {
          return yearStandings[split] || [];
        }
        return yearStandings;
      }
      return leagueStandings;
    }

    return this.data.regularSeasonStandings;
  }
}
