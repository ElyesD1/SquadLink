import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class SearchSummonerDto {
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