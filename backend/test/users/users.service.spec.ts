import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { RiotApiService } from '../../src/riot-api/riot-api.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import sinon from 'sinon';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: Model<User>;

  const mockUser = {
    _id: 'userId123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    age: 25,
    provider: 'local',
    save: sinon.stub().resolves(),
  };

  beforeEach(async () => {
    const mockRiotApiService = {
      searchSummoner: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: function UserModel(data) {
            return { ...data, save: sinon.stub().resolves(data) };
          },
        },
        {
          provide: RiotApiService,
          useValue: mockRiotApiService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userModel = module.get<Model<User>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25,
      };

      const result = await service.create(createUserDto);

      expect(result.firstName).to.equal('John');
      expect(result.lastName).to.equal('Doe');
      expect(result.email).to.equal('john@example.com');
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      const mockQuery = { exec: sinon.stub().resolves(mockUser) };
      (userModel.findById as any) = sinon.stub().returns(mockQuery);

      const result = await service.findById('userId123');

      expect(result).to.equal(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      const mockQuery = { exec: sinon.stub().resolves(mockUser) };
      (userModel.findOne as any) = sinon.stub().returns(mockQuery);

      const result = await service.findByEmail('john@example.com');

      expect(result).to.equal(mockUser);
    });
  });

  describe('findByGoogleId', () => {
    it('should return user by Google ID', async () => {
      const mockQuery = { exec: sinon.stub().resolves(mockUser) };
      (userModel.findOne as any) = sinon.stub().returns(mockQuery);

      const result = await service.findByGoogleId('googleId123');

      expect(result).to.equal(mockUser);
    });
  });

  describe('update', () => {
    it('should update user successfully', async () => {
      const updateData = { firstName: 'Jane' };
      const mockQuery = { exec: sinon.stub().resolves({ ...mockUser, ...updateData }) };
      (userModel.findByIdAndUpdate as any) = sinon.stub().returns(mockQuery);

      const result = await service.update('userId123', updateData);

      expect(result).to.not.be.null;
      expect(result!.firstName).to.equal('Jane');
    });
  });

  describe('validatePassword', () => {
    it('should validate correct password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await service.validatePassword(plainPassword, hashedPassword);

      expect(result).to.be.true;
    });

    it('should reject incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('correctPassword', 10);

      const result = await service.validatePassword('wrongPassword', hashedPassword);

      expect(result).to.be.false;
    });
  });
});