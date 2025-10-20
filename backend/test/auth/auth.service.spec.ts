import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UsersService } from '../../src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../src/email/email.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from '../../src/users/entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import sinon from 'sinon';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: sinon.SinonStubbedInstance<UsersService>;
  let jwtService: sinon.SinonStubbedInstance<JwtService>;
  let emailService: sinon.SinonStubbedInstance<EmailService>;
  let userModel: Model<User>;

  const mockUser = {
    _id: 'userId123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashedPassword',
    age: 25,
    toString: () => 'userId123',
    save: sinon.stub().resolves(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByEmail: sinon.stub(),
      create: sinon.stub(),
      findById: sinon.stub(),
      findByGoogleId: sinon.stub(),
      update: sinon.stub(),
      validatePassword: sinon.stub(),
    };

    const mockJwtService = {
      sign: sinon.stub(),
    };

    const mockEmailService = {
      sendPasswordResetEmail: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = mockUsersService as any;
    jwtService = mockJwtService as any;
    emailService = mockEmailService as any;
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(AuthService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25,
      };

      usersService.findByEmail.resolves(null);
      usersService.create.resolves(mockUser as any);
      jwtService.sign.returns('jwt-token');

      const result = await service.register(createUserDto);

      expect(usersService.findByEmail.calledWith('john@example.com')).to.be.true;
      expect(usersService.create.calledOnce).to.be.true;
      expect(jwtService.sign.calledOnce).to.be.true;
      expect(result).to.have.property('access_token', 'jwt-token');
      expect(result.user).to.have.property('id', 'userId123');
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.resolves(mockUser as any);

      try {
        await service.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          age: 25,
        });
        expect.fail('Should have thrown ConflictException');
      } catch (error) {
        expect(error.message).to.equal('Email already exists');
      }
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginDto = { email: 'john@example.com', password: 'password123' };

      usersService.findByEmail.resolves(mockUser as any);
      usersService.validatePassword.resolves(true);
      jwtService.sign.returns('jwt-token');

      const result = await service.login(loginDto);

      expect(usersService.findByEmail.calledWith('john@example.com')).to.be.true;
      expect(usersService.validatePassword.calledWith('password123', 'hashedPassword')).to.be.true;
      expect(result).to.have.property('access_token', 'jwt-token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      usersService.findByEmail.resolves(null);

      try {
        await service.login({ email: 'invalid@example.com', password: 'password' });
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error.message).to.equal('Invalid credentials');
      }
    });

    it('should throw UnauthorizedException for Google OAuth users without password', async () => {
      const googleUser = { ...mockUser, password: undefined };
      usersService.findByEmail.resolves(googleUser as any);

      try {
        await service.login({ email: 'john@example.com', password: 'password' });
        expect.fail('Should have thrown UnauthorizedException');
      } catch (error) {
        expect(error.message).to.equal('Please use Google Sign In');
      }
    });
  });

  describe('requestPasswordReset', () => {
    it('should send password reset email successfully', async () => {
      usersService.findByEmail.resolves(mockUser as any);
      emailService.sendPasswordResetEmail.resolves();

      const result = await service.requestPasswordReset({ email: 'john@example.com' });

      expect(usersService.findByEmail.calledWith('john@example.com')).to.be.true;
      expect(emailService.sendPasswordResetEmail.calledOnce).to.be.true;
      expect(result).to.deep.equal({ message: 'Password reset code sent' });
    });

    it('should throw NotFoundException if user not found', async () => {
      usersService.findByEmail.resolves(null);

      try {
        await service.requestPasswordReset({ email: 'nonexistent@example.com' });
        expect.fail('Should have thrown NotFoundException');
      } catch (error) {
        expect(error.message).to.equal('User not found');
      }
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const userWithResetCode = { ...mockUser, resetCode: '123456', save: sinon.stub().resolves() };
      usersService.findByEmail.resolves(userWithResetCode as any);

      const result = await service.resetPassword({
        email: 'john@example.com',
        resetCode: '123456',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      });

      expect(userWithResetCode.save.calledOnce).to.be.true;
      expect(userWithResetCode.resetCode).to.be.undefined;
      expect(result).to.deep.equal({ message: 'Password reset successful' });
    });

    it('should throw BadRequestException if passwords do not match', async () => {
      const userWithResetCode = { ...mockUser, resetCode: '123456' };
      usersService.findByEmail.resolves(userWithResetCode as any);

      try {
        await service.resetPassword({
          email: 'john@example.com',
          resetCode: '123456',
          newPassword: 'newpassword123',
          confirmPassword: 'differentpassword',
        });
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error.message).to.equal('Passwords do not match');
      }
    });

    it('should throw BadRequestException for invalid reset code', async () => {
      const userWithResetCode = { ...mockUser, resetCode: '123456' };
      usersService.findByEmail.resolves(userWithResetCode as any);

      try {
        await service.resetPassword({
          email: 'john@example.com',
          resetCode: 'wrongcode',
          newPassword: 'newpassword123',
          confirmPassword: 'newpassword123',
        });
        expect.fail('Should have thrown BadRequestException');
      } catch (error) {
        expect(error.message).to.equal('Invalid code');
      }
    });
  });

  describe('validateUser', () => {
    it('should return user if found', async () => {
      usersService.findById.resolves(mockUser as any);

      const result = await service.validateUser('userId123');

      expect(usersService.findById.calledWith('userId123')).to.be.true;
      expect(result).to.equal(mockUser);
    });

    it('should return null if user not found', async () => {
      usersService.findById.resolves(null);

      const result = await service.validateUser('nonexistentId');

      expect(result).to.be.null;
    });
  });
});