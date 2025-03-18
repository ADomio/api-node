import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { Campaign, Stream, Filter } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;

  constructor(private configService: ConfigService) {
    if (this.configService.useRedis) {
      this.client = createClient({
        url: this.configService.redisUrl,
      });

      this.client.on('error', (err) => console.error('Redis Client Error', err));
    }
  }

  async onModuleInit() {
    if (this.client) {
      await this.client.connect();
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  // Campaign methods
  async setCampaign(campaign: Campaign): Promise<void> {
    if (!this.client) return;

    await this.client.set(
      `campaign:${campaign.id}`,
      JSON.stringify(campaign),
      { EX: 3600 } // 1 hour expiration
    );
  }

  async getCampaign(id: number): Promise<Campaign | null> {
    if (!this.client) return null;

    const data = await this.client.get(`campaign:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteCampaign(id: number): Promise<void> {
    if (!this.client) return;

    await this.client.del(`campaign:${id}`);
    await this.client.del(`campaign:${id}:streams`);
  }

  // Stream methods
  async setStream(stream: Stream): Promise<void> {
    if (!this.client) return;

    await this.client.set(
      `stream:${stream.id}`,
      JSON.stringify(stream),
      { EX: 3600 }
    );
    await this.client.sAdd(`campaign:${stream.campaignId}:streams`, stream.id.toString());
  }

  async getStream(id: number): Promise<Stream | null> {
    if (!this.client) return null;

    const data = await this.client.get(`stream:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteStream(id: number, campaignId: number): Promise<void> {
    if (!this.client) return;

    await this.client.del(`stream:${id}`);
    await this.client.del(`stream:${id}:filters`);
    await this.client.sRem(`campaign:${campaignId}:streams`, id.toString());
  }

  async getCampaignStreams(campaignId: number): Promise<string[]> {
    if (!this.client) return [];

    return await this.client.sMembers(`campaign:${campaignId}:streams`);
  }

  // Filter methods
  async setFilter(filter: Filter): Promise<void> {
    if (!this.client) return;

    await this.client.set(
      `filter:${filter.id}`,
      JSON.stringify(filter),
      { EX: 3600 }
    );
    await this.client.sAdd(`stream:${filter.streamId}:filters`, filter.id.toString());
  }

  async getFilter(id: number): Promise<Filter | null> {
    if (!this.client) return null;

    const data = await this.client.get(`filter:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async deleteFilter(id: number, streamId: number): Promise<void> {
    if (!this.client) return;

    await this.client.del(`filter:${id}`);
    await this.client.sRem(`stream:${streamId}:filters`, id.toString());
  }

  async getStreamFilters(streamId: number): Promise<string[]> {
    if (!this.client) return [];

    return await this.client.sMembers(`stream:${streamId}:filters`);
  }

  // Helper method to get all filters for router-go
  async getStreamWithFilters(streamId: number): Promise<{ stream: Stream; filters: Filter[] } | null> {
    if (!this.client) return null;

    const stream = await this.getStream(streamId);
    if (!stream) return null;

    const filterIds = await this.getStreamFilters(streamId);
    const filterPromises = filterIds.map(id => this.getFilter(Number(id)));
    const filters = await Promise.all(filterPromises);

    return {
      stream,
      filters: filters.filter((f): f is Filter => f !== null),
    };
  }
} 