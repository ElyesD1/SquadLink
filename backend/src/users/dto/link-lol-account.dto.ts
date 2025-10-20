import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class LinkLolAccountDto {
  @IsString()
  @IsNotEmpty()
  gameName: string;

  @IsString()
  @IsNotEmpty()
  tagline: string;

  @IsString()
  @IsOptional()
  region?: string;
}