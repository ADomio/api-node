import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Campaign, Stream, Filter } from '@prisma/client';

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

      // Get stream IDs
      const streamIds = await this.client.sMembers(`campaign:${id}:stream_ids`);

      // Get streams and their filters
      campaign.streams = await Promise.all(
        streamIds.map(async (streamId) => {
          const stream = await this.getStream(parseInt(streamId));
          return stream;
        })
      ).then(streams => streams.filter(Boolean));

      return campaign;
    } catch (error) {
      this.logger.error(`Error getting campaign ${id} from cache:`, error);
      return null;
    }
  }

  async setCampaign(campaign: Campaign & { streams?: Stream[] }): Promise<void> {
    if (!this.client) return;

    try {
      const { streams, ...campaignData } = campaign;

      // Cache basic campaign data
      await this.client.set(
        `campaign:${campaign.id}`,
        JSON.stringify(campaignData),
        { EX: this.CACHE_TTL }
      );

      // Cache streams if they exist
      if (streams?.length) {
        // Store stream IDs in a set
        await this.client.del(`campaign:${campaign.id}:stream_ids`);
        await this.client.sAdd(
          `campaign:${campaign.id}:stream_ids`,
          streams.map(s => s.id.toString())
        );

        // Cache each stream
        for (const stream of streams) {
          await this.setStream(stream);
        }
      }
    } catch (error) {
      this.logger.error(`Error setting campaign ${campaign.id} in cache:`, error);
    }
  }

  async deleteCampaign(id: number): Promise<void> {
    if (!this.client) return;

    try {
      // Get stream IDs before deleting campaign
      const streamIds = await this.client.sMembers(`campaign:${id}:stream_ids`);

      // Delete streams and their filters
      for (const streamId of streamIds) {
        await this.deleteStream(parseInt(streamId), id);
      }

      // Delete campaign data and stream IDs set
      await this.client.del(`campaign:${id}`);
      await this.client.del(`campaign:${id}:stream_ids`);
    } catch (error) {
      this.logger.error(`Error deleting campaign ${id} from cache:`, error);
    }
  }

  // Stream methods
  async getStream(id: number): Promise<Stream | null> {
    if (!this.client) return null;

    try {
      const streamData = await this.client.get(`stream:${id}`);
      if (!streamData) return null;

      const stream = JSON.parse(streamData);

      // Get filter IDs
      const filterIds = await this.client.sMembers(`stream:${id}:filter_ids`);

      // Get filters
      stream.filters = await Promise.all(
        filterIds.map(async (filterId) => {
          const filter = await this.getFilter(parseInt(filterId));
          return filter;
        })
      ).then(filters => filters.filter(Boolean));

      return stream;
    } catch (error) {
      this.logger.error(`Error getting stream ${id} from cache:`, error);
      return null;
    }
  }

  async setStream(stream: Stream & { filters?: Filter[] }): Promise<void> {
    if (!this.client) return;

    try {
      const { filters, ...streamData } = stream;

      // Cache basic stream data
      await this.client.set(
        `stream:${stream.id}`,
        JSON.stringify(streamData),
        { EX: this.CACHE_TTL }
      );

      // Cache filters if they exist
      if (filters?.length) {
        // Store filter IDs in a set
        await this.client.del(`stream:${stream.id}:filter_ids`);
        await this.client.sAdd(
          `stream:${stream.id}:filter_ids`,
          filters.map(f => f.id.toString())
        );

        // Cache each filter
        for (const filter of filters) {
          await this.setFilter(filter);
        }
      }
    } catch (error) {
      this.logger.error(`Error setting stream ${stream.id} in cache:`, error);
    }
  }

  async deleteStream(id: number, campaignId: number): Promise<void> {
    if (!this.client) return;

    try {
      // Get filter IDs before deleting stream
      const filterIds = await this.client.sMembers(`stream:${id}:filter_ids`);

      // Delete filters
      for (const filterId of filterIds) {
        await this.deleteFilter(parseInt(filterId), id);
      }

      // Delete stream data and filter IDs set
      await this.client.del(`stream:${id}`);
      await this.client.del(`stream:${id}:filter_ids`);

      // Remove stream ID from campaign's stream set
      await this.client.sRem(`campaign:${campaignId}:stream_ids`, id.toString());
    } catch (error) {
      this.logger.error(`Error deleting stream ${id} from cache:`, error);
    }
  }

  // Filter methods
  async getFilter(id: number): Promise<Filter | null> {
    if (!this.client) return null;

    try {
      const data = await this.client.get(`filter:${id}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error(`Error getting filter ${id} from cache:`, error);
      return null;
    }
  }

  async setFilter(filter: Filter): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.set(
        `filter:${filter.id}`,
        JSON.stringify(filter),
        { EX: this.CACHE_TTL }
      );
    } catch (error) {
      this.logger.error(`Error setting filter ${filter.id} in cache:`, error);
    }
  }

  async deleteFilter(id: number, streamId: number): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.del(`filter:${id}`);
      await this.client.sRem(`stream:${streamId}:filter_ids`, id.toString());
    } catch (error) {
      this.logger.error(`Error deleting filter ${id} from cache:`, error);
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