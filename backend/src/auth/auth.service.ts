import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';
import { Types } from 'mongoose';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    const payload = { sub: userId, email: user.email };
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
    const payload = { sub: userId, email: user.email };
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
    const payload = { sub: userId, email: user.email };
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
    const payload = { sub: userId, email: user.email };
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
}
