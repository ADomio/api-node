import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({
    description: 'The name of the campaign',
    example: 'Summer Sale 2024',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Unique campaign code (5 characters, auto-generated if not provided)',
    example: 'SUM24',
    required: false,
  })
  @IsString()
  @IsOptional()
  code?: string;

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