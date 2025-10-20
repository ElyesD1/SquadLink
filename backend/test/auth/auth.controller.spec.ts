import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { RequestPasswordResetDto, ResetPasswordDto } from '../../src/auth/dto/password-reset.dto';
import sinon from 'sinon';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: sinon.SinonStubbedInstance<AuthService>;
  let configService: sinon.SinonStubbedInstance<ConfigService>;

  const mockResult = {
    access_token: 'jwt-token',
    user: {
      id: 'userId123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      age: 25,
    },
  };

  const mockGoogleResult = {
    access_token: 'jwt-token',
    user: {
      id: 'userId123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      age: 25,
      profilePicture: 'https://example.com/photo.jpg',
    },
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: sinon.stub(),
      login: sinon.stub(),
      handleGoogleOAuth: sinon.stub(),
      googleLogin: sinon.stub(),
      requestPasswordReset: sinon.stub(),
      resetPassword: sinon.stub(),
    };

    const mockConfigService = {
      get: sinon.stub(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = mockAuthService as any;
    configService = mockConfigService as any;
  });

  it('should be defined', () => {
    expect(controller).to.be.instanceof(AuthController);
  });

  describe('register', () => {
    it('should register a user and return result', async () => {
      const createUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        age: 25,
      };

      authService.register.resolves(mockResult);

      const result = await controller.register(createUserDto);

      expect(authService.register.calledWith(createUserDto)).to.be.true;
      expect(result).to.equal(mockResult);
    });
  });

  describe('login', () => {
    it('should login a user and return result', async () => {
      const loginDto = {
        email: 'john@example.com',
        password: 'password123',
      };

      authService.login.resolves(mockResult);

      const result = await controller.login(loginDto);

      expect(authService.login.calledWith(loginDto)).to.be.true;
      expect(result).to.equal(mockResult);
    });
  });

  describe('googleOAuthLogin', () => {
    it('should handle Google OAuth login', async () => {
      const googleData = {
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        googleId: 'googleId123',
      };

      authService.handleGoogleOAuth.resolves(mockGoogleResult);

      const result = await controller.googleOAuthLogin(googleData);

      expect(authService.handleGoogleOAuth.calledWith(googleData)).to.be.true;
      expect(result).to.equal(mockGoogleResult);
    });
  });

  describe('requestPasswordReset', () => {
    it('should request password reset successfully', async () => {
      const dto: RequestPasswordResetDto = { email: 'john@example.com' };
      const expectedResult = { message: 'Password reset code sent' };

      authService.requestPasswordReset.resolves(expectedResult);

      const result = await controller.requestPasswordReset(dto);

      expect(authService.requestPasswordReset.calledWith(dto)).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const dto: ResetPasswordDto = {
        email: 'john@example.com',
        resetCode: '123456',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };
      const expectedResult = { message: 'Password reset successful' };

      authService.resetPassword.resolves(expectedResult);

      const result = await controller.resetPassword(dto);

      expect(authService.resetPassword.calledWith(dto)).to.be.true;
      expect(result).to.equal(expectedResult);
    });
  });
});