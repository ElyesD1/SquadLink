import { IsString, IsEnum, IsOptional, IsBoolean, IsDateString, IsArray, MaxLength, MinLength, IsInt, Min, Max } from 'class-validator';
import { GameMode, Position } from '../entities/party.entity';

export class CreatePartyDto {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsEnum(GameMode)
  gameMode: GameMode;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  preferences?: {
    minRank?: string;
    maxRank?: string;
    voiceChat?: boolean;
    language?: string;
    playstyle?: string[];
  };

  @IsString()
  creatorEmail: string;

  @IsOptional()
  @IsEnum(Position)
  creatorPosition?: Position;
}

export class UpdatePartyDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @IsOptional()
  preferences?: {
    minRank?: string;
    maxRank?: string;
    voiceChat?: boolean;
    language?: string;
    playstyle?: string[];
  };
}

export class JoinPartyRequestDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  message?: string;

  @IsOptional()
  @IsEnum(Position)
  requestedPosition?: Position;
}

export class HandleJoinRequestDto {
  @IsString()
  userId: string;

  @IsBoolean()
  accept: boolean;
}

export class InviteToPartyDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  message?: string;
}

export class KickMemberDto {
  @IsString()
  userId: string;
}

export class UpdateMemberStatusDto {
  @IsBoolean()
  isReady: boolean;
}

export class PartyFiltersDto {
  @IsOptional()
  @IsString()
  gameMode?: string;

  @IsOptional()
  @IsBoolean()
  availableOnly?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  userId?: string; // For showing user's own closed parties
}