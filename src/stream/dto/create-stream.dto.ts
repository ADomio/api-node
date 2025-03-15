import { IsEnum, IsInt, IsString, IsUrl, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum StreamStatus {
  active = 'active',
  inactive = 'inactive',
}

export class CreateStreamDto {
  @ApiProperty({
    description: 'ID of the campaign this stream belongs to',
    example: 1,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  campaignId: number;

  @ApiProperty({
    description: 'Name of the stream',
    example: 'US Desktop Traffic',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Target URL where traffic will be redirected',
    example: 'https://example.com/landing-page',
  })
  @IsUrl()
  targetUrl: string;

  @ApiProperty({
    description: 'Stream status',
    enum: StreamStatus,
    default: StreamStatus.active,
    example: StreamStatus.active,
  })
  @IsEnum(StreamStatus)
  status: StreamStatus = StreamStatus.active;

  @ApiProperty({
    description: 'Stream weight for traffic distribution',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  weight: number = 1;
} 