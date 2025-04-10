import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Statuses } from '@prisma/client';

export class CreateStreamDto {
  @ApiProperty({
    description: 'Stream name',
    example: 'Main Traffic',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Target URL',
    example: 'https://example.com',
  })
  @IsString()
  targetUrl: string;

  @ApiProperty({
    description: 'Stream status',
    example: 'ACTIVE',
    enum: Statuses,
    default: 'active',
  })
  @IsOptional()
  @IsEnum(Statuses)
  status?: Statuses;

  @ApiProperty({
    description: 'Stream weight',
    example: 100,
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  weight?: number;
} 