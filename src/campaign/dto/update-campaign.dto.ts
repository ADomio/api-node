import { IsString, IsOptional, IsEnum } from 'class-validator';
import { Statuses, Currencies } from '@prisma/client';

export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(Statuses)
  status?: Statuses;

  @IsOptional()
  @IsEnum(Currencies)
  currency?: Currencies;
} 