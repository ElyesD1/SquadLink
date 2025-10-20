import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { RiotEsportsService } from '../../src/riot-esports/riot-esports.service';
import * as fs from 'fs';
import * as path from 'path';
import sinon from 'sinon';

describe('RiotEsportsService', () => {
  let service: RiotEsportsService;

  const mockEsportsData = {
    leagues: [
      { id: 'lcs', name: 'LCS', region: 'North America' },
      { id: 'lec', name: 'LEC', region: 'Europe' },
    ],
    tournaments: {
      lcs: [
        { id: 'lcs_spring', name: 'LCS Spring Split', year: 2025 },
        { id: 'lcs_summer', name: 'LCS Summer Split', year: 2025 },
      ],
      lec: [
        { id: 'lec_spring', name: 'LEC Spring Split', year: 2025 },
      ],
    },
    matches: {
      lcs: [
        { id: 'match1', teams: ['Team A', 'Team B'], date: '2025-01-15' },
        { id: 'match2', teams: ['Team C', 'Team D'], date: '2025-01-16' },
      ],
    },
    teamsByLeague: {
      lcs: [
        { id: 'team_a', name: 'Team A', players: ['Player 1', 'Player 2'] },
        { id: 'team_b', name: 'Team B', players: ['Player 3', 'Player 4'] },
      ],
    },
    standings: {
      lcs_spring: [
        { team: 'Team A', wins: 8, losses: 2, position: 1 },
        { team: 'Team B', wins: 7, losses: 3, position: 2 },
      ],
    },
    regularSeasonStandings: {
      lcs: {
        '2025': {
          spring: [
            { team: 'Team A', wins: 8, losses: 2 },
            { team: 'Team B', wins: 7, losses: 3 },
          ],
          summer: [
            { team: 'Team C', wins: 9, losses: 1 },
          ],
        },
      },
    },
  };

  beforeEach(() => {
    // Use proxyquire to mock fs module entirely
    const proxyquire = require('proxyquire');
    const RiotEsportsService = proxyquire('../../src/riot-esports/riot-esports.service', {
      'fs': {
        readFileSync: sinon.stub().returns(JSON.stringify(mockEsportsData))
      }
    }).RiotEsportsService;
    
    service = new RiotEsportsService();
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(RiotEsportsService);
  });

  describe('constructor and loadData', () => {
    it('should load data successfully on initialization', () => {
      expect(service).to.be.instanceof(RiotEsportsService);
      // Data should be loaded from the stubbed fs.readFileSync
    });

    it('should handle file read errors gracefully', async () => {
      // Restore the stub and make it throw
      sinon.restore();
      sinon.stub(fs, 'readFileSync').throws(new Error('File not found'));

      const module: TestingModule = await Test.createTestingModule({
        providers: [RiotEsportsService],
      }).compile();

      const serviceWithError = module.get<RiotEsportsService>(RiotEsportsService);

      // Should have fallback empty data structure
      expect(serviceWithError.getLeagues()).to.deep.equal([]);
    });
  });

  describe('getLeagues', () => {
    it('should return all leagues', () => {
      const leagues = service.getLeagues();
      expect(leagues).to.deep.equal(mockEsportsData.leagues);
    });
  });

  describe('getTournaments', () => {
    it('should return tournaments for a specific league', () => {
      const tournaments = service.getTournaments('lcs');
      expect(tournaments).to.deep.equal(mockEsportsData.tournaments.lcs);
    });

    it('should return all tournaments when no league specified', () => {
      const tournaments = service.getTournaments();
      const expectedTournaments = [
        ...mockEsportsData.tournaments.lcs,
        ...mockEsportsData.tournaments.lec,
      ];
      expect(tournaments).to.deep.equal(expectedTournaments);
    });

    it('should return empty array for non-existent league', () => {
      const tournaments = service.getTournaments('nonexistent');
      expect(tournaments).to.deep.equal([]);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule for a specific league', () => {
      const schedule = service.getSchedule('lcs');
      expect(schedule).to.deep.equal(mockEsportsData.matches.lcs);
    });

    it('should return all matches when no league specified', () => {
      const schedule = service.getSchedule();
      expect(schedule).to.deep.equal(mockEsportsData.matches.lcs); // Only LCS has matches in mock data
    });

    it('should return empty array for non-existent league', () => {
      const schedule = service.getSchedule('nonexistent');
      expect(schedule).to.deep.equal([]);
    });
  });

  describe('getTeams', () => {
    it('should return teams for a specific league', () => {
      const teams = service.getTeams('lcs');
      expect(teams).to.deep.equal(mockEsportsData.teamsByLeague.lcs);
    });

    it('should return all teams when no league specified', () => {
      const teams = service.getTeams();
      expect(teams).to.deep.equal(mockEsportsData.teamsByLeague.lcs); // Only LCS has teams in mock data
    });

    it('should return empty array for non-existent league', () => {
      const teams = service.getTeams('nonexistent');
      expect(teams).to.deep.equal([]);
    });

    it('should return empty array when teamsByLeague is not defined', async () => {
      const mockDataWithoutTeams = {
        leagues: [],
        tournaments: {},
        matches: {},
        teams: [],
        standings: {},
        regularSeasonStandings: {}
      };

      // Restore and re-stub with different data
      sinon.restore();
      sinon.stub(fs, 'readFileSync').returns(JSON.stringify(mockDataWithoutTeams));

      const module: TestingModule = await Test.createTestingModule({
        providers: [RiotEsportsService],
      }).compile();

      const serviceWithoutTeams = module.get<RiotEsportsService>(RiotEsportsService);
      const teams = serviceWithoutTeams.getTeams();
      expect(teams).to.deep.equal([]);
    });
  });

  describe('getStandings', () => {
    it('should return standings for a specific tournament', () => {
      const standings = service.getStandings('lcs_spring');
      expect(standings).to.deep.equal(mockEsportsData.standings.lcs_spring);
    });

    it('should return empty array for non-existent tournament', () => {
      const standings = service.getStandings('nonexistent');
      expect(standings).to.deep.equal([]);
    });
  });

  describe('getRegularSeasonStandings', () => {
    it('should return standings for specific league, year, and split', () => {
      const standings = service.getRegularSeasonStandings('lcs', '2025', 'spring');
      expect(standings).to.deep.equal(mockEsportsData.regularSeasonStandings.lcs['2025'].spring);
    });

    it('should return standings for specific league and year', () => {
      const standings = service.getRegularSeasonStandings('lcs', '2025');
      expect(standings).to.deep.equal(mockEsportsData.regularSeasonStandings.lcs['2025']);
    });

    it('should return standings for specific league', () => {
      const standings = service.getRegularSeasonStandings('lcs');
      expect(standings).to.deep.equal(mockEsportsData.regularSeasonStandings.lcs);
    });

    it('should return all standings when no parameters specified', () => {
      const standings = service.getRegularSeasonStandings();
      expect(standings).to.deep.equal(mockEsportsData.regularSeasonStandings);
    });

    it('should return empty array for non-existent league', () => {
      const standings = service.getRegularSeasonStandings('nonexistent');
      expect(standings).to.deep.equal([]);
    });

    it('should return empty array for non-existent year', () => {
      const standings = service.getRegularSeasonStandings('lcs', '2024');
      expect(standings).to.deep.equal([]);
    });

    it('should return empty array for non-existent split', () => {
      const standings = service.getRegularSeasonStandings('lcs', '2025', 'fall');
      expect(standings).to.deep.equal([]);
    });

    it('should return empty array when regularSeasonStandings is not defined', async () => {
      const mockDataWithoutStandings = {
        leagues: [],
        tournaments: {},
        matches: {},
        teams: [],
        standings: {},
        teamsByLeague: {}
      };

      // Restore and re-stub with different data
      sinon.restore();
      sinon.stub(fs, 'readFileSync').returns(JSON.stringify(mockDataWithoutStandings));

      const module: TestingModule = await Test.createTestingModule({
        providers: [RiotEsportsService],
      }).compile();

      const serviceWithoutStandings = module.get<RiotEsportsService>(RiotEsportsService);
      const standings = serviceWithoutStandings.getRegularSeasonStandings();
      expect(standings).to.deep.equal([]);
    });
  });
});