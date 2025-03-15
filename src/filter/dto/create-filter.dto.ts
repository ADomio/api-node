import { IsEnum, IsString } from 'class-validator';

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
  @IsEnum(FilterType)
  type: FilterType;

  @IsEnum(FilterOperation)
  operation: FilterOperation;

  @IsString()
  value: string;
} 