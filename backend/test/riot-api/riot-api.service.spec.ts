import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RiotApiService } from '../../src/riot-api/riot-api.service';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import sinon from 'sinon';

describe('RiotApiService', () => {
  let service: RiotApiService;
  let configService: sinon.SinonStubbedInstance<ConfigService>;
  let httpService: sinon.SinonStubbedInstance<HttpService>;

  const mockSummoner = {
    id: 'summonerId123',
    accountId: 'accountId123',
    puuid: 'puuid123',
    name: 'TestSummoner',
    profileIconId: 123,
    revisionDate: 1234567890,
    summonerLevel: 50,
  };

  const mockRankedInfo = [
    {
      leagueId: 'leagueId123',
      queueType: 'RANKED_SOLO_5x5',
      tier: 'PLATINUM',
      rank: 'II',
      summonerId: 'summonerId123',
      summonerName: 'TestSummoner',
      leaguePoints: 75,
      wins: 100,
      losses: 80,
      veteran: false,
      inactive: false,
      freshBlood: false,
      hotStreak: true,
    },
  ];

  beforeEach(async () => {
    const mockConfigService = {
      get: sinon.stub(),
    };

    const mockHttpService = {
      get: sinon.stub(),
    };

    (mockConfigService.get as sinon.SinonStub).withArgs('RIOT_API_KEY').returns('test-api-key');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RiotApiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
      ],
    }).compile();

    service = module.get<RiotApiService>(RiotApiService);
    configService = mockConfigService as any;
    httpService = mockHttpService as any;
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(RiotApiService);
  });

  describe('getAccountByRiotId', () => {
    it('should get account by Riot ID successfully', (done) => {
      const mockAccount = {
        puuid: 'puuid123',
        gameName: 'TestSummoner',
        tagLine: 'NA1',
      };

      const mockResponse: AxiosResponse = {
        data: mockAccount,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.returns(of(mockResponse));

      service.getAccountByRiotId('TestSummoner', 'NA1', 'na1').subscribe({
        next: (result) => {
          expect(result).to.deep.equal(mockAccount);
          expect(httpService.get.calledOnce).to.be.true;
          done();
        },
        error: done,
      });
    });

    it('should handle 404 errors for non-existent accounts', (done) => {
      const errorResponse = {
        response: { status: 404 },
        message: 'Not found',
      };

      httpService.get.returns(throwError(() => errorResponse));

      service.getAccountByRiotId('NonExistent', 'NA1', 'na1').subscribe({
        next: () => {
          done(new Error('Should have thrown NotFoundException'));
        },
        error: (error) => {
          expect(error).to.be.instanceof(NotFoundException);
          expect(error.message).to.include('not found');
          done();
        },
      });
    });
  });

  describe('getSummonerByPuuid', () => {
    it('should get summoner by PUUID successfully', (done) => {
      const mockResponse: AxiosResponse = {
        data: mockSummoner,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.returns(of(mockResponse));

      service.getSummonerByPuuid('puuid123', 'na1').subscribe({
        next: (result) => {
          expect(result).to.deep.equal(mockSummoner);
          expect(httpService.get.calledOnce).to.be.true;
          done();
        },
        error: done,
      });
    });

    it('should handle 404 errors for non-existent summoners', (done) => {
      const errorResponse = {
        response: { status: 404 },
        message: 'Not found',
      };

      httpService.get.returns(throwError(() => errorResponse));

      service.getSummonerByPuuid('invalid-puuid', 'na1').subscribe({
        next: () => {
          done(new Error('Should have thrown NotFoundException'));
        },
        error: (error) => {
          expect(error).to.be.instanceof(NotFoundException);
          expect(error.message).to.include('not found');
          done();
        },
      });
    });
  });

  describe('getRankedInfo', () => {
    it('should get ranked info successfully', (done) => {
      const mockResponse: AxiosResponse = {
        data: mockRankedInfo,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.returns(of(mockResponse));

      service.getRankedInfo('puuid123', 'na1').subscribe({
        next: (result) => {
          expect(result).to.deep.equal(mockRankedInfo);
          expect(httpService.get.calledOnce).to.be.true;
          done();
        },
        error: done,
      });
    });

    it('should return empty array for 404 (no ranked data)', (done) => {
      const errorResponse = {
        response: { status: 404 },
        message: 'Not found',
      };

      httpService.get.returns(throwError(() => errorResponse));

      service.getRankedInfo('puuid123', 'na1').subscribe({
        next: (result) => {
          expect(result).to.deep.equal([]);
          done();
        },
        error: done,
      });
    });
  });

  describe('searchSummoner', () => {
    it('should get complete summoner profile', (done) => {
      const mockAccount = {
        puuid: 'puuid123',
        gameName: 'TestSummoner',
        tagLine: 'NA1',
      };

      const accountResponse: AxiosResponse = {
        data: mockAccount,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const summonerResponse: AxiosResponse = {
        data: mockSummoner,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      const rankedResponse: AxiosResponse = {
        data: mockRankedInfo,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      httpService.get.onFirstCall().returns(of(accountResponse));
      httpService.get.onSecondCall().returns(of(summonerResponse));
      httpService.get.onThirdCall().returns(of(rankedResponse));

      service.searchSummoner('TestSummoner', 'NA1', 'na1').subscribe({
        next: (result) => {
          expect(result).to.have.property('account');
          expect(result).to.have.property('summoner');
          expect(result).to.have.property('rankedData');
          expect(result).to.have.property('region');
          expect(result.account).to.deep.equal(mockAccount);
          expect(result.summoner).to.deep.equal(mockSummoner);
          expect(result.rankedData).to.deep.equal(mockRankedInfo);
          done();
        },
        error: done,
      });
    });
  });

  describe('getAvailableRegions', () => {
    it('should return available platform and cluster regions', () => {
      const regions = service.getAvailableRegions();

      expect(regions).to.have.property('platform');
      expect(regions).to.have.property('cluster');
      expect(regions.platform).to.be.an('array');
      expect(regions.cluster).to.be.an('array');
      expect(regions.platform).to.include('na1');
      expect(regions.cluster).to.include('americas');
    });
  });
});