import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '../config/config.service';
import { RedisClientType } from 'redis';
import { Campaign, Filter, FilterOperations, FilterTypes, Statuses, Stream } from '@prisma/client';

type MockRedisClient = {
  [K in keyof RedisClientType]: jest.Mock;
};

describe('RedisService', () => {
  let service: RedisService;
  let config: ConfigService;

  const mockRedisClient: MockRedisClient = {
    connect: jest.fn(),
    quit: jest.fn(),
    set: jest.fn(),
    get: jest.fn(),
    del: jest.fn(),
    sAdd: jest.fn(),
    sRem: jest.fn(),
    sMembers: jest.fn(),
    on: jest.fn(),
  } as unknown as MockRedisClient;

  const mockConfigService = {
    useRedis: true,
    redisUrl: 'redis://localhost:6379',
  };

  // Helper function to parse dates in objects
  const parseDates = (obj: any): any => {
    if (!obj) return obj;
    const newObj = { ...obj };
    for (const key in newObj) {
      if (typeof newObj[key] === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(newObj[key])) {
        newObj[key] = new Date(newObj[key]);
      } else if (typeof newObj[key] === 'object') {
        newObj[key] = parseDates(newObj[key]);
      }
    }
    return newObj;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
    config = module.get<ConfigService>(ConfigService);
    (service as any).client = mockRedisClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lifecycle hooks', () => {
    it('should connect on module init', async () => {
      await service.onModuleInit();
      expect(mockRedisClient.connect).toHaveBeenCalled();
    });

    it('should quit on module destroy', async () => {
      await service.onModuleDestroy();
      expect(mockRedisClient.quit).toHaveBeenCalled();
    });
  });

  describe('campaign methods', () => {
    const campaign = {
      id: 1,
      name: 'Test Campaign',
      code: 'TEST1',
      status: Statuses.active,
      currency: 'usd' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    } satisfies Omit<Campaign, 'trafficSourceId'> & { trafficSourceId?: number | null };

    it('should set campaign', async () => {
      await service.setCampaign(campaign as Campaign);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'campaign:1',
        JSON.stringify(campaign),
        { EX: 3600 }
      );
    });

    it('should get campaign', async () => {
      const serializedCampaign = {
        ...campaign,
        createdAt: campaign.createdAt.toISOString(),
        updatedAt: campaign.updatedAt.toISOString(),
      };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedCampaign));
      const result = await service.getCampaign(1);
      expect(result).toEqual(serializedCampaign);
      expect(mockRedisClient.get).toHaveBeenCalledWith('campaign:1');
    });

    it('should delete campaign', async () => {
      await service.deleteCampaign(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('campaign:1');
      expect(mockRedisClient.del).toHaveBeenCalledWith('campaign:1:streams');
    });
  });

  describe('stream methods', () => {
    const stream: Stream = {
      id: 1,
      campaignId: 1,
      name: 'Test Stream',
      targetUrl: 'https://example.com',
      status: Statuses.active,
      weight: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set stream', async () => {
      await service.setStream(stream);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'stream:1',
        JSON.stringify(stream),
        { EX: 3600 }
      );
      expect(mockRedisClient.sAdd).toHaveBeenCalledWith(
        'campaign:1:streams',
        '1'
      );
    });

    it('should get stream', async () => {
      const serializedStream = {
        ...stream,
        createdAt: stream.createdAt.toISOString(),
        updatedAt: stream.updatedAt.toISOString(),
      };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedStream));
      const result = await service.getStream(1);
      expect(result).toEqual(serializedStream);
      expect(mockRedisClient.get).toHaveBeenCalledWith('stream:1');
    });

    it('should delete stream', async () => {
      await service.deleteStream(1, 1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('stream:1');
      expect(mockRedisClient.del).toHaveBeenCalledWith('stream:1:filters');
      expect(mockRedisClient.sRem).toHaveBeenCalledWith('campaign:1:streams', '1');
    });

    it('should get campaign streams', async () => {
      const streamIds = ['1', '2'];
      mockRedisClient.sMembers.mockResolvedValueOnce(streamIds);
      const result = await service.getCampaignStreams(1);
      expect(result).toEqual(streamIds);
      expect(mockRedisClient.sMembers).toHaveBeenCalledWith('campaign:1:streams');
    });
  });

  describe('filter methods', () => {
    const filter: Filter = {
      id: 1,
      streamId: 1,
      type: FilterTypes.country,
      operation: FilterOperations.equals,
      value: 'US',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set filter', async () => {
      await service.setFilter(filter);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'filter:1',
        JSON.stringify(filter),
        { EX: 3600 }
      );
      expect(mockRedisClient.sAdd).toHaveBeenCalledWith(
        'stream:1:filters',
        '1'
      );
    });

    it('should get filter', async () => {
      const serializedFilter = {
        ...filter,
        createdAt: filter.createdAt.toISOString(),
        updatedAt: filter.updatedAt.toISOString(),
      };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedFilter));
      const result = await service.getFilter(1);
      expect(result).toEqual(serializedFilter);
      expect(mockRedisClient.get).toHaveBeenCalledWith('filter:1');
    });

    it('should delete filter', async () => {
      await service.deleteFilter(1, 1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('filter:1');
      expect(mockRedisClient.sRem).toHaveBeenCalledWith('stream:1:filters', '1');
    });

    it('should get stream filters', async () => {
      const filterIds = ['1', '2'];
      mockRedisClient.sMembers.mockResolvedValueOnce(filterIds);
      const result = await service.getStreamFilters(1);
      expect(result).toEqual(filterIds);
      expect(mockRedisClient.sMembers).toHaveBeenCalledWith('stream:1:filters');
    });
  });

  describe('traffic source methods', () => {
    const trafficSource = {
      id: 1,
      name: 'Facebook Ads',
      queryParams: {
        fbclid: 'click_id',
        utm_source: 'source',
      },
      custom: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should set traffic source', async () => {
      await service.setTrafficSource(trafficSource);
      expect(mockRedisClient.set).toHaveBeenCalledWith(
        'traffic-source:1',
        JSON.stringify(trafficSource),
        { EX: 3600 }
      );
    });

    it('should get traffic source', async () => {
      const serializedTrafficSource = {
        ...trafficSource,
        createdAt: trafficSource.createdAt.toISOString(),
        updatedAt: trafficSource.updatedAt.toISOString(),
      };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedTrafficSource));
      const result = await service.getTrafficSource(1);
      expect(result).toEqual(serializedTrafficSource);
      expect(mockRedisClient.get).toHaveBeenCalledWith('traffic-source:1');
    });

    it('should delete traffic source', async () => {
      await service.deleteTrafficSource(1);
      expect(mockRedisClient.del).toHaveBeenCalledWith('traffic-source:1');
    });
  });

  describe('getStreamWithFilters', () => {
    const stream: Stream = {
      id: 1,
      name: 'Test Stream',
      targetUrl: 'https://example.com',
      status: Statuses.active,
      weight: 1,
      campaignId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const filters: Filter[] = [
      {
        id: 1,
        streamId: 1,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        streamId: 1,
        type: FilterTypes.browser,
        operation: FilterOperations.equals,
        value: 'Chrome',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should return stream with filters', async () => {
      const serializedStream = {
        ...stream,
        createdAt: stream.createdAt.toISOString(),
        updatedAt: stream.updatedAt.toISOString(),
      };
      const serializedFilters = filters.map(filter => ({
        ...filter,
        createdAt: filter.createdAt.toISOString(),
        updatedAt: filter.updatedAt.toISOString(),
      }));

      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedStream));
      mockRedisClient.sMembers.mockResolvedValueOnce(['1', '2']);
      mockRedisClient.get
        .mockResolvedValueOnce(JSON.stringify(serializedFilters[0]))
        .mockResolvedValueOnce(JSON.stringify(serializedFilters[1]));

      const result = await service.getStreamWithFilters(1);

      expect(result).toEqual({
        stream: serializedStream,
        filters: serializedFilters,
      });
    });

    it('should handle missing filters', async () => {
      const serializedStream = {
        ...stream,
        createdAt: stream.createdAt.toISOString(),
        updatedAt: stream.updatedAt.toISOString(),
      };
      mockRedisClient.get.mockResolvedValueOnce(JSON.stringify(serializedStream));
      mockRedisClient.sMembers.mockResolvedValueOnce([]);

      const result = await service.getStreamWithFilters(1);

      expect(result).toEqual({
        stream: serializedStream,
        filters: [],
      });
    });
  });
}); 