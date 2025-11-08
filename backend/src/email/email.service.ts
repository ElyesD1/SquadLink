import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  // Read API key from environment only (remove hard-coded fallback for security)
  private readonly apiKey = process.env.BREVO_API_KEY || '';
  private readonly sender = {
    name: process.env.EMAIL_FROM_NAME || 'Squadlink',
    email: process.env.EMAIL_FROM_ADDRESS || 'no-reply@squadlink.me',
  };

  // Optional SMTP transporter (will be initialized when SMTP creds are provided)
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // If SMTP credentials are provided via env, create a Nodemailer transporter to send via Brevo SMTP relay.
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS || process.env.BREVO_SMTP_USER; // fallback to user token if no separate pass provided

    if (smtpUser) {
      try {
        this.transporter = nodemailer.createTransport({
          host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
          port: Number(process.env.BREVO_SMTP_PORT || 587),
          secure: false,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      } catch (err) {
        console.error('Failed to create SMTP transporter:', err);
        this.transporter = null;
      }
    }
  }

  async sendVerificationEmail(to: string, code: string) {
    const codeDigits = code.split('').map(digit => `
      <div style="display: inline-block; width: 44px; height: 56px; margin: 0 6px; background: #f3f6fa; border-radius: 8px; box-shadow: 0 2px 8px rgba(45,127,249,0.08); font-size: 32px; font-weight: bold; color: #2d7ff9; text-align: center; line-height: 56px; letter-spacing: 1px;">${digit}</div>
    `).join('');
    const html = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 40px auto; border-radius: 12px; box-shadow: 0 4px 24px rgba(45,127,249,0.08); background: #fff; padding: 0; overflow: hidden; border: 1px solid #e3e8ee;">
        <div style="background: #2d7ff9; padding: 24px 0; text-align: center;">
          <h1 style="color: #fff; font-size: 24px; margin: 0; letter-spacing: 1px;">Squadlink</h1>
        </div>
        <div style="padding: 32px 24px 24px 24px;">
          <h2 style="color: #2d7ff9; font-size: 22px; margin-top: 0; margin-bottom: 12px; text-align: center;">Verify Your Email</h2>
          <p style="font-size: 16px; color: #333; margin-bottom: 24px; text-align: center;">Thank you for registering! Please enter the code below in the app to verify your email address:</p>
          <div style="display: flex; justify-content: center; margin: 32px 0;">
            <div style="background: #fff; border: 2px solid #2d7ff9; border-radius: 12px; padding: 18px 12px; display: flex; justify-content: center;">
              ${codeDigits}
            </div>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 32px;">If you did not create an account, you can safely ignore this email.</p>
        </div>
      </div>
    `;
    return this.sendEmail(to, 'Verify your email address', html);
  }

  async sendPasswordResetEmail(to: string, code: string) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; border: 1px solid #eee; border-radius: 8px; padding: 32px; background: #fafbfc;">
        <h2 style="color: #2d7ff9; text-align: center;">Reset Your Password</h2>
        <p style="font-size: 16px; color: #333;">Use the code below to reset your password:</p>
        <div style="font-size: 32px; font-weight: bold; color: #2d7ff9; text-align: center; margin: 24px 0;">${code}</div>
        <p style="font-size: 14px; color: #888; text-align: center;">If you did not request a password reset, you can ignore this email.</p>
      </div>
    `;
    return this.sendEmail(to, 'Reset your password', html);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      // If transporter is configured, send via SMTP (Nodemailer)
      if (this.transporter) {
        await this.transporter.sendMail({
          from: `"${this.sender.name}" <${this.sender.email}>`,
          to,
          subject,
          html,
        });
        return;
      }

      // Otherwise fall back to Brevo HTTP API
      await axios.post('https://api.brevo.com/v3/smtp/email', {
        sender: this.sender,
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }, {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          'accept': 'application/json',
        },
      });
    } catch (error) {
      // Enhanced debugging: log full error response from Brevo
      if (error.response) {
        console.error('Brevo API error:', error.response.data);
      } else {
        console.error('Email send error:', error);
      }
      throw new InternalServerErrorException('Failed to send email');
    }
  }
}