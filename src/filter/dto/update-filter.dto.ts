import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FilterTypes, FilterOperations } from '@prisma/client';

export class UpdateFilterDto {
  @ApiProperty({
    description: 'Filter type',
    enum: FilterTypes,
    example: 'device',
    required: false,
  })
  @IsOptional()
  @IsEnum(FilterTypes)
  type?: FilterTypes;

  @ApiProperty({
    description: 'Filter operation',
    enum: FilterOperations,
    example: 'equals',
    required: false,
  })
  @IsOptional()
  @IsEnum(FilterOperations)
  operation?: FilterOperations;

  @ApiProperty({
    description: 'Filter value',
    example: 'desktop',
    required: false,
  })
  @IsOptional()
  @IsString()
  value?: string;
} 