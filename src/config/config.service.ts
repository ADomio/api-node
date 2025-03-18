import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get useRedis(): boolean {
    return this.configService.get<boolean>('USE_REDIS') ?? false;
  }

  get redisUrl(): string {
    return this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379';
  }
} 