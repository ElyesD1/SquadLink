import { Injectable, UnauthorizedException, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/password-reset.dto';
import { User } from '../users/entities/user.entity';
import { Types } from 'mongoose';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersService.create({
      ...createUserDto,
      provider: 'local',
    });

    const userId = (user as any)._id.toString();
    
    // Return user data without access token to prevent auto-login
    return {
      message: 'User registered successfully',
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.password) {
      throw new UnauthorizedException('Please use Google Sign In');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const userId = (user as any)._id.toString();
    
    // Create JWT payload with user info and timestamp
    const payload = { 
      sub: userId, 
      email: user.email,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
      },
    };
  }

  async validateGoogleUser(profile: any): Promise<User> {
    const { id, emails, name, photos } = profile;
    const email = emails[0].value;

    let user = await this.usersService.findByGoogleId(id);

    if (!user) {
      user = await this.usersService.findByEmail(email);
      if (user) {
        // Link Google account to existing user
        const userId = (user as any)._id.toString();
        const updatedUser = await this.usersService.update(userId, {
          googleId: id,
          profilePicture: photos?.[0]?.value,
        });
        user = updatedUser || user;
      } else {
        // Create new user
        user = await this.usersService.create({
          googleId: id,
          email,
          firstName: name.givenName,
          lastName: name.familyName,
          profilePicture: photos?.[0]?.value,
          provider: 'google',
          age: 18, // Default age, you might want to collect this later
        });
      }
    }

    return user;
  }

  async googleLogin(user: User) {
    const userId = (user as any)._id.toString();
    
    // Create JWT payload with user info and timestamp
    const payload = { 
      sub: userId, 
      email: user.email,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        profilePicture: user.profilePicture,
      },
    };
  }

  async handleGoogleOAuth(googleData: any) {
    const { email, firstName, lastName, googleId } = googleData;

    // Check if user exists by Google ID
    let user = await this.usersService.findByGoogleId(googleId);

    if (!user) {
      // Check if user exists by email
      user = await this.usersService.findByEmail(email);
      
      if (user) {
        // Link Google account to existing user
        const userId = (user as any)._id.toString();
        const updatedUser = await this.usersService.update(userId, {
          googleId: googleId,
        });
        user = updatedUser || user;
      } else {
        // Create new user
        user = await this.usersService.create({
          googleId: googleId,
          email,
          firstName,
          lastName,
          provider: 'google',
          age: 18, // Default age for Google OAuth users
        });
      }
    }

    const userId = (user as any)._id.toString();
    
    // Create JWT payload with user info and timestamp
    const payload = { 
      sub: userId, 
      email: user.email,
      iat: Math.floor(Date.now() / 1000), // Issued at timestamp
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        profilePicture: user.profilePicture,
      },
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersService.findById(userId);
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetCode = resetCode;
    await user.save();
    await this.emailService.sendPasswordResetEmail(user.email, resetCode);
    return { message: 'Password reset code sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new NotFoundException('User not found');
    if (user.resetCode !== dto.resetCode) throw new BadRequestException('Invalid code');
    if (dto.newPassword !== dto.confirmPassword) throw new BadRequestException('Passwords do not match');
    user.password = await bcrypt.hash(dto.newPassword, 10);
    user.resetCode = undefined;
    await user.save();
    return { message: 'Password reset successful' };
  }
}
