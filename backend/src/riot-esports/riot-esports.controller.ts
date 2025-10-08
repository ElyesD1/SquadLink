import { Controller, Get, Query, Param } from '@nestjs/common';
import { RiotEsportsService } from './riot-esports.service';

@Controller('riot-esports')
export class RiotEsportsController {
  constructor(private readonly riotEsportsService: RiotEsportsService) {}

  @Get('leagues')
  async getLeagues() {
    return this.riotEsportsService.getLeagues();
  }

  @Get('schedule')
  async getSchedule(@Query('leagueId') leagueId?: string) {
    return this.riotEsportsService.getSchedule(leagueId);
  }

  @Get('tournaments')
  async getTournaments(@Query('leagueId') leagueId?: string) {
    return this.riotEsportsService.getTournaments(leagueId);
  }

  @Get('teams')
  async getTeams(@Query('leagueId') leagueId?: string) {
    return this.riotEsportsService.getTeams(leagueId);
  }

  @Get('standings/:tournamentId')
  async getStandings(@Param('tournamentId') tournamentId: string) {
    return this.riotEsportsService.getStandings(tournamentId);
  }

  @Get('regular-standings')
  async getRegularSeasonStandings(
    @Query('leagueId') leagueId?: string,
    @Query('year') year?: string,
    @Query('split') split?: string
  ) {
    return this.riotEsportsService.getRegularSeasonStandings(leagueId, year, split);
  }
}