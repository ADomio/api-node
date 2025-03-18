import {IsString, IsOptional, IsEnum, IsNumber} from 'class-validator';
import { Statuses, Currencies } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'Campaign name',
    example: 'Summer Sale 2024',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Campaign code',
    example: 'SUMR24',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Campaign status',
    enum: Statuses,
    example: 'active',
    default: 'active',
  })
  @IsOptional()
  @IsEnum(Statuses)
  status?: Statuses;

  @ApiProperty({
    description: 'Campaign currency',
    enum: Currencies,
    example: 'USD',
    default: 'USD',
  })
  @IsOptional()
  @IsEnum(Currencies)
  currency?: Currencies;

  @ApiProperty({
    description: 'Campaign profit',
    example: 1000.50,
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  profit?: number = 0;

  @ApiProperty({
    description: 'Campaign expenses',
    example: 500.25,
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  expenses?: number = 0;
} 