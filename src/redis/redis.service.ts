import {Injectable, Logger, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import {createClient, RedisClientType} from 'redis';
import {ConfigService} from '@nestjs/config';
import {Campaign, Filter, Stream} from '@prisma/client';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly logger = new Logger(RedisService.name);
  private readonly CACHE_TTL = 3600; // 1 hour in seconds

  constructor(private configService: ConfigService) {
    if (!this.client) {
      this.client = createClient({
        url: this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
      });

      this.client.on('connect', () => {
        this.logger.log('Successfully connected to Redis');
      });

      this.client.on('error', (error) => {
        this.logger.error('Redis connection error:', error);
      });
    }
  }

  async onModuleInit() {
    if (this.client) {
      try {
        await this.client.connect();
        await this.client.ping();
        this.logger.log('Redis connection verified');
      } catch (error) {
        this.logger.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
      this.logger.log('Redis connection closed');
    }
  }

  // Campaign methods
  async getCampaign(id: number): Promise<Campaign | null> {
    if (!this.client) return null;

    try {
      // Get basic campaign data
      const campaignData = await this.client.get(`campaign:${id}`);
      if (!campaignData) return null;

      const campaign = JSON.parse(campaignData);

      // Get all streams for this campaign
      campaign.streams = await this.getStreams(id);

      return campaign;
    } catch (error) {
      this.logger.error(`Error getting campaign ${id} from cache:`, error);
      return null;
    }
  }

  async getCampaignByCode(code: string): Promise<Campaign | null> {
    if (!this.client) return null;

    try {
      // Get campaign ID from code
      const campaignId = await this.client.get(`campaign_code:${code}`);
      if (!campaignId) return null;

      return this.getCampaign(parseInt(campaignId));
    } catch (error) {
      this.logger.error(`Error getting campaign by code ${code} from cache:`, error);
      return null;
    }
  }

  async setCampaign(campaign: Campaign): Promise<void> {
    if (!this.client) return;

    try {
      // Cache basic campaign data with TTL
      await this.client.set(
        `campaign:${campaign.id}`,
        JSON.stringify(campaign),
        { EX: this.CACHE_TTL }
      );

      // Cache campaign code to ID mapping permanently (no TTL)
      await this.client.set(
        `campaign_code:${campaign.code}`,
        campaign.id.toString()
      );
    } catch (error) {
      this.logger.error(`Error setting campaign ${campaign.id} in cache:`, error);
    }
  }

  async deleteCampaign(id: number): Promise<void> {
    if (!this.client) return;

    try {
      // Get campaign to get its code before deletion
      const campaignData = await this.client.get(`campaign:${id}`);
      if (campaignData) {
        const campaign = JSON.parse(campaignData);
        // Delete all campaign-related keys
        await Promise.all([
          this.client.del(`campaign:${id}`),
          this.client.del(`campaign:${id}:streams`),
          this.client.del(`campaign_code:${campaign.code}`)
        ]);
      }
    } catch (error) {
      this.logger.error(`Error deleting campaign ${id} from cache:`, error);
    }
  }

  // Stream methods
  async getStreams(campaignId: number): Promise<Stream[]> {
    if (!this.client) return [];

    try {
      const streamsData = await this.client.get(`campaign:${campaignId}:streams`);
      if (!streamsData) return [];

      return JSON.parse(streamsData);
    } catch (error) {
      this.logger.error(`Error getting streams for campaign ${campaignId} from cache:`, error);
      return [];
    }
  }

  async setStreams(campaignId: number, streams: Stream[]): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        `campaign:${campaignId}:streams`,
        JSON.stringify(streams),
        { EX: this.CACHE_TTL }
      );
    } catch (error) {
      this.logger.error(`Error setting streams for campaign ${campaignId} in cache:`, error);
    }
  }

  async deleteStreams(campaignId: number): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(`campaign:${campaignId}:streams`);
    } catch (error) {
      this.logger.error(`Error deleting streams for campaign ${campaignId} from cache:`, error);
    }
  }

  // Filter methods
  async getFilters(streamId: number): Promise<Filter[]> {
    if (!this.client) return [];

    try {
      const filtersData = await this.client.get(`stream:${streamId}:filters`);
      if (!filtersData) return [];

      return JSON.parse(filtersData);
    } catch (error) {
      this.logger.error(`Error getting filters for stream ${streamId} from cache:`, error);
      return [];
    }
  }

  async setFilters(streamId: number, filters: Filter[]): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        `stream:${streamId}:filters`,
        JSON.stringify(filters),
        { EX: this.CACHE_TTL }
      );
    } catch (error) {
      this.logger.error(`Error setting filters for stream ${streamId} in cache:`, error);
    }
  }

  async deleteFilters(streamId: number): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(`stream:${streamId}:filters`);
    } catch (error) {
      this.logger.error(`Error deleting filters for stream ${streamId} from cache:`, error);
    }
  }

  // Traffic Source methods
  async getTrafficSource(id: number): Promise<any | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(`traffic-source:${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Error getting traffic source ${id} from cache:`, error);
      return null;
    }
  }

  async setTrafficSource(trafficSource: any): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        `traffic-source:${trafficSource.id}`,
        JSON.stringify(trafficSource),
        { EX: this.CACHE_TTL }
      );
    } catch (error) {
      this.logger.error(`Error setting traffic source ${trafficSource.id} in cache:`, error);
    }
  }
} 