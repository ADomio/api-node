import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FilterTypes, FilterOperations } from '@prisma/client';

export class CreateFilterDto {
  @ApiProperty({
    description: 'Filter type',
    enum: FilterTypes,
    example: 'device',
  })
  @IsEnum(FilterTypes)
  type: FilterTypes;

  @ApiProperty({
    description: 'Filter operation',
    enum: FilterOperations,
    example: 'equals',
  })
  @IsEnum(FilterOperations)
  operation: FilterOperations;

  @ApiProperty({
    description: 'Filter value',
    example: 'desktop',
  })
  @IsString()
  value: string;
} 