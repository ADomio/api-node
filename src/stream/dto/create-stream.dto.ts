import { IsEnum, IsInt, IsString, IsUrl, Min } from 'class-validator';

export enum StreamStatus {
  active = 'active',
  inactive = 'inactive',
}

export class CreateStreamDto {
  @IsInt()
  @Min(1)
  campaignId: number;

  @IsString()
  name: string;

  @IsUrl()
  targetUrl: string;

  @IsEnum(StreamStatus)
  status: StreamStatus = StreamStatus.active;

  @IsInt()
  @Min(1)
  weight: number = 1;
} 