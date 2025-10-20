import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import sinon from 'sinon';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: sinon.SinonStubbedInstance<UsersService>;

  const mockUser = {
    _id: 'userId123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    age: 25,
  };

  beforeEach(async () => {
    const mockUsersService = {
      findAll: sinon.stub(),
      updateGamePreferences: sinon.stub(),
      addGamePreference: sinon.stub(),
      removeGamePreference: sinon.stub(),
      updateProfilePicture: sinon.stub(),
      updateThemePreference: sinon.stub(),
      findByEmail: sinon.stub(),
      findByGoogleId: sinon.stub(),
      validatePassword: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = mockUsersService as any;
  });

  it('should be defined', () => {
    expect(controller).to.be.instanceof(UsersController);
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      usersService.findAll.resolves(users as any);

      const result = await controller.findAll();

      expect(usersService.findAll.calledOnce).to.be.true;
      expect(result).to.equal(users);
    });
  });

  describe('updateGamePreferences', () => {
    it('should update game preferences', async () => {
      const body = { gamePreferences: ['League of Legends'], email: 'john@example.com' };
      const expectedResult = { success: true };

      usersService.updateGamePreferences.resolves(expectedResult as any);

      const result = await controller.updateGamePreferences(body);

      expect(usersService.updateGamePreferences.calledWith('john@example.com', ['League of Legends'])).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });

  describe('addGamePreference', () => {
    it('should add game preference', async () => {
      const body = { game: 'Valorant', email: 'john@example.com' };
      const expectedResult = { success: true };

      usersService.addGamePreference.resolves(expectedResult as any);

      const result = await controller.addGamePreference(body);

      expect(usersService.addGamePreference.calledWith('john@example.com', 'Valorant')).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });

  describe('removeGamePreference', () => {
    it('should remove game preference', async () => {
      const body = { email: 'john@example.com' };
      const expectedResult = { success: true };

      usersService.removeGamePreference.resolves(expectedResult as any);

      const result = await controller.removeGamePreference('Valorant', body);

      expect(usersService.removeGamePreference.calledWith('john@example.com', 'Valorant')).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });

  describe('updateProfilePicture', () => {
    it('should update profile picture', async () => {
      const body = { profilePicture: 'new-picture-url', email: 'john@example.com' };
      const expectedResult = { success: true };

      usersService.updateProfilePicture.resolves(expectedResult as any);

      const result = await controller.updateProfilePicture(body);

      expect(usersService.updateProfilePicture.calledWith('john@example.com', 'new-picture-url')).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });

  describe('updateThemePreference', () => {
    it('should update theme preference', async () => {
      const body = { theme: 'dark', email: 'john@example.com' };
      const expectedResult = { success: true };

      usersService.updateThemePreference.resolves(expectedResult as any);

      const result = await controller.updateThemePreference(body);

      expect(usersService.updateThemePreference.calledWith('john@example.com', 'dark')).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });
});