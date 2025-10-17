import { expect } from 'chai';
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../src/email/email.service';
import axios from 'axios';
import sinon from 'sinon';

describe('EmailService', () => {
  let service: EmailService;
  let axiosPostStub: sinon.SinonStub;

  beforeEach(async () => {
    axiosPostStub = sinon.stub(axios, 'post');

    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailService],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    axiosPostStub.restore();
  });

  it('should be defined', () => {
    expect(service).to.be.instanceof(EmailService);
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      axiosPostStub.resolves({ data: { messageId: 'test-id' } });

      await service.sendVerificationEmail('test@example.com', '123456');

      expect(axiosPostStub.calledOnce).to.be.true;
      const callArgs = axiosPostStub.firstCall.args;
      expect(callArgs[0]).to.equal('https://api.brevo.com/v3/smtp/email');
      expect(callArgs[1]).to.have.property('sender');
      expect(callArgs[1].sender).to.deep.equal({ name: 'Squadlink', email: 'skyrexcgaming@gmail.com' });
      expect(callArgs[1].to).to.deep.equal([{ email: 'test@example.com' }]);
      expect(callArgs[1].subject).to.equal('Verify your email address');
      expect(callArgs[1].htmlContent).to.include('1');
      expect(callArgs[1].htmlContent).to.include('2');
      expect(callArgs[1].htmlContent).to.include('3');
      expect(callArgs[1].htmlContent).to.include('4');
      expect(callArgs[1].htmlContent).to.include('5');
      expect(callArgs[1].htmlContent).to.include('6');
      expect(callArgs[2].headers).to.have.property('api-key');
      expect(callArgs[2].headers['api-key']).to.equal('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');
    });

    it('should throw InternalServerErrorException on API error', async () => {
      const errorResponse = {
        response: {
          data: { message: 'API Error' },
        },
      };
      axiosPostStub.rejects(errorResponse);

      try {
        await service.sendVerificationEmail('test@example.com', '123456');
        expect.fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error.message).to.equal('Failed to send email');
      }
    });

    it('should handle network errors', async () => {
      axiosPostStub.rejects(new Error('Network error'));

      try {
        await service.sendVerificationEmail('test@example.com', '123456');
        expect.fail('Should have thrown InternalServerErrorException');
      } catch (error) {
        expect(error.message).to.equal('Failed to send email');
      }
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should send password reset email successfully', async () => {
      axiosPostStub.resolves({ data: { messageId: 'test-id' } });

      await service.sendPasswordResetEmail('test@example.com', '123456');

      expect(axiosPostStub.calledOnce).to.be.true;
      const callArgs = axiosPostStub.firstCall.args;
      expect(callArgs[1].subject).to.equal('Reset your password');
      expect(callArgs[1].htmlContent).to.include('123456');
      expect(callArgs[1].htmlContent).to.include('Reset Your Password');
    });
  });

  describe('sendEmail', () => {
    it('should send email with correct parameters', async () => {
      axiosPostStub.resolves({ data: { messageId: 'test-id' } });

      await service.sendEmail('test@example.com', 'Test Subject', '<h1>Test</h1>');

      expect(axiosPostStub.calledOnce).to.be.true;
      const callArgs = axiosPostStub.firstCall.args;
      expect(callArgs[1]).to.deep.equal({
        sender: { name: 'Squadlink', email: 'skyrexcgaming@gmail.com' },
        to: [{ email: 'test@example.com' }],
        subject: 'Test Subject',
        htmlContent: '<h1>Test</h1>',
      });
      expect(callArgs[2].headers['Content-Type']).to.equal('application/json');
      expect(callArgs[2].headers.accept).to.equal('application/json');
    });

    it('should log API errors correctly', async () => {
      const consoleSpy = sinon.spy(console, 'error');
      const errorResponse = {
        response: {
          data: { message: 'Invalid API key' },
        },
      };
      axiosPostStub.rejects(errorResponse);

      try {
        await service.sendEmail('test@example.com', 'Test', 'content');
        expect.fail('Should have thrown error');
      } catch (error) {
        expect(consoleSpy.calledWith('Brevo API error:', { message: 'Invalid API key' })).to.be.true;
      }

      consoleSpy.restore();
    });
  });
});