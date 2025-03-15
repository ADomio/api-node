import { IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum FilterType {
  country = 'country',
  device = 'device',
  browser = 'browser',
  language = 'language',
  os = 'os',
  ip_range = 'ip_range',
  referrer = 'referrer',
  keyword = 'keyword',
  utm_source = 'utm_source',
  utm_medium = 'utm_medium',
  utm_campaign = 'utm_campaign',
}

export enum FilterOperation {
  equals = 'equals',
  contains = 'contains',
  not_equals = 'not_equals',
  regex = 'regex',
}

export class CreateFilterDto {
  @ApiProperty({
    description: 'Type of the filter',
    enum: FilterType,
    example: FilterType.country,
    enumName: 'FilterType',
  })
  @IsEnum(FilterType)
  type: FilterType;

  @ApiProperty({
    description: 'Operation to apply',
    enum: FilterOperation,
    example: FilterOperation.equals,
    enumName: 'FilterOperation',
  })
  @IsEnum(FilterOperation)
  operation: FilterOperation;

  @ApiProperty({
    description: 'Value to filter by',
    example: 'US',
  })
  @IsString()
  value: string;
} 