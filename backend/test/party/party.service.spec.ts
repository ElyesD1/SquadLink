import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { PartyService } from '../../src/party/party.service';
import { UsersService } from '../../src/users/users.service';
import { DiscordService } from '../../src/discord/discord.service';
import { getModelToken } from '@nestjs/mongoose';
import { Party } from '../../src/party/entities/party.entity';
import { User } from '../../src/users/entities/user.entity';
import { Model } from 'mongoose';
import sinon from 'sinon';

describe('PartyService', () => {
  let service: PartyService;
  let partyModel: Model<Party>;
  let usersService: sinon.SinonStubbedInstance<UsersService>;

  const mockParty = {
    _id: '507f1f77bcf86cd799439011', // Valid ObjectId string
    name: 'Test Party',
    gameMode: 'RANKED_SOLO_DUO',
    creatorId: '507f1f77bcf86cd799439012', // Valid ObjectId string
    members: [
      {
        userId: '507f1f77bcf86cd799439012',
        username: 'John Doe',
        joinedAt: new Date(),
        isReady: true,
      },
    ],
    status: 'open',
    preferences: { minRank: 'GOLD' },
    save: sinon.stub().resolves(),
    toObject: sinon.stub().returnsThis(),
  };

  const mockUser = {
    _id: '507f1f77bcf86cd799439012', // Valid ObjectId string
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    lolAccount: {
      rankedData: [
        {
          queueType: 'RANKED_SOLO_5x5',
          tier: 'PLATINUM',
          rank: 'II',
          leaguePoints: 75,
        },
      ],
    },
  };

  beforeEach(async () => {
    const mockUsersService = {
      findById: sinon.stub(),
    };

    const mockDiscordService = {
      createVoiceChannelForParty: sinon.stub(),
      deleteVoiceChannel: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartyService,
        {
          provide: getModelToken(Party.name),
          useValue: Object.assign(
            function PartyModel(data) {
              return { ...data, save: sinon.stub().resolves(data), toObject: sinon.stub().returns(data) };
            },
            {
              find: sinon.stub().returns({
                populate: sinon.stub().returns({
                  sort: sinon.stub().returns({
                    skip: sinon.stub().returns({
                      limit: sinon.stub().returns({
                        exec: sinon.stub(),
                      }),
                    }),
                  }),
                }),
              }),
              findById: sinon.stub().returns({
                populate: sinon.stub().returns({
                  exec: sinon.stub(),
                }),
              }),
              findOne: sinon.stub().resolves(null), // No active party by default
              findByIdAndUpdate: sinon.stub(),
              findByIdAndDelete: sinon.stub(),
              countDocuments: sinon.stub(),
            }
          ),
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: sinon.stub().returns({
              exec: sinon.stub().resolves(mockUser),
            }),
            findOne: sinon.stub().returns({
              exec: sinon.stub(),
            }),
          },
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: DiscordService,
          useValue: mockDiscordService,
        },
      ],
    }).compile();

    service = module.get<PartyService>(PartyService);
    partyModel = module.get<Model<Party>>(getModelToken(Party.name));
    usersService = mockUsersService as any;
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(PartyService);
  });

  describe('create', () => {
    it('should create a party successfully', async () => {
      const createPartyDto = {
        name: 'Test Party',
        gameMode: 'RANKED_SOLO_DUO' as any,
        creatorEmail: 'creator@example.com',
        preferences: { minRank: 'GOLD' },
      };
      const creatorId = '507f1f77bcf86cd799439012';

      const result = await service.create(createPartyDto, creatorId);

      expect(result).to.be.an('object');
      expect(result.name).to.equal('Test Party');
    });
  });

  describe('findAll', () => {
    it('should return parties with filters', async () => {
      const filters = { limit: 10, offset: 0 };
      const parties = [mockParty];
      const total = 1;

      // Mock the entire query chain to return the parties directly
      const mockQuery = {
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().returnsThis(),
        exec: sinon.stub().resolves(parties),
      };
      (partyModel.find as any) = sinon.stub().returns(mockQuery);
      (partyModel.countDocuments as any) = sinon.stub().resolves(total);

      const result = await service.findAll(filters);

      expect(result).to.have.property('parties');
      expect(result).to.have.property('total', total);
      expect(result.parties).to.be.an('array');
    });
  });

  describe('findOne', () => {
    it('should return a party by id', async () => {
      const mockExec = sinon.stub().resolves(mockParty);
      const mockPopulate = sinon.stub().returns({ exec: mockExec });
      (partyModel.findById as any) = sinon.stub().returns({ populate: mockPopulate });

      const result = await service.findOne('507f1f77bcf86cd799439011');

      expect(result).to.be.an('object');
      expect(result).to.have.property('_id', '507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException for invalid id', async () => {
      try {
        await service.findOne('invalidId');
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error.message).to.equal('Invalid party ID');
      }
    });
  });
});