import { Module } from '@nestjs/common';
import { TrafficSourceService } from './traffic-source.service';
import { TrafficSourceController } from './traffic-source.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [TrafficSourceController],
  providers: [TrafficSourceService],
  exports: [TrafficSourceService],
})
export class TrafficSourceModule {} 