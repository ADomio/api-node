import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  profit?: number = 0;

  @IsNumber()
  @IsOptional()
  expenses?: number = 0;
} 