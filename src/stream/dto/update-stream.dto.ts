import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Statuses } from '@prisma/client';

export class UpdateStreamDto {
  @ApiProperty({
    description: 'Stream name',
    example: 'Main Traffic',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Target URL',
    example: 'https://example.com',
    required: false,
  })
  @IsOptional()
  @IsString()
  targetUrl?: string;

  @ApiProperty({
    description: 'Stream status',
    example: 'active',
    enum: Statuses,
    required: false,
  })
  @IsOptional()
  @IsEnum(Statuses)
  status?: Statuses;

  @ApiProperty({
    description: 'Stream weight',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;
} 