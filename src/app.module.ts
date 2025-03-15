import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FilterModule } from './filter/filter.module';
import { StreamModule } from './stream/stream.module';
import { CampaignModule } from './campaign/campaign.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CampaignModule,
    StreamModule,
    FilterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
