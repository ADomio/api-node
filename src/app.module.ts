import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { CampaignModule } from './campaign/campaign.module';
import { StreamModule } from './stream/stream.module';
import { FilterModule } from './filter/filter.module';
import { TrafficSourceModule } from './traffic-source/traffic-source.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    RedisModule,
    CampaignModule,
    StreamModule,
    FilterModule,
    TrafficSourceModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
