import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // Game Preferences CRUD
  @Post('game-preferences')
  async updateGamePreferences(@Body() body: { gamePreferences: string[]; email: string }) {
    return this.usersService.updateGamePreferences(body.email, body.gamePreferences);
  }

  @Put('game-preferences/add')
  async addGamePreference(@Body() body: { game: string; email: string }) {
    return this.usersService.addGamePreference(body.email, body.game);
  }

  @Delete('game-preferences/:game')
  async removeGamePreference(@Param('game') game: string, @Body() body: { email: string }) {
    return this.usersService.removeGamePreference(body.email, game);
  }

  // Profile Picture
  @Put('profile-picture')
  async updateProfilePicture(@Body() body: { profilePicture: string; email: string }) {
    return this.usersService.updateProfilePicture(body.email, body.profilePicture);
  }

  // Theme Preference
  @Put('theme')
  async updateThemePreference(@Body() body: { theme: string; email: string }) {
    return this.usersService.updateThemePreference(body.email, body.theme);
  }

  // Get user profile with all preferences
  @Post('profile/full')
  async getFullProfile(@Body() body: { email: string }) {
    return this.usersService.getFullProfile(body.email);
  }

  // Update user profile (name)
  @Put('profile')
  async updateProfile(@Body() body: { email: string; firstName?: string; lastName?: string }) {
    return this.usersService.updateProfile(body.email, body.firstName, body.lastName);
  }

  // League of Legends Account Linking
  @Post('lol-account/link')
  async linkLolAccount(@Body() body: { email: string; gameName: string; tagline: string; region?: string }) {
    return this.usersService.linkLolAccount(body.email, body.gameName, body.tagline, body.region);
  }

  @Delete('lol-account/unlink')
  async unlinkLolAccount(@Body() body: { email: string }) {
    return this.usersService.unlinkLolAccount(body.email);
  }

  @Post('lol-account/refresh')
  async refreshLolAccount(@Body() body: { email: string }) {
    return this.usersService.refreshLolAccount(body.email);
  }
}
