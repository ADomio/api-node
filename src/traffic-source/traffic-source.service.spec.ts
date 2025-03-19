import { Test, TestingModule } from '@nestjs/testing';
import { TrafficSourceService } from './traffic-source.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException } from '@nestjs/common';

describe('TrafficSourceService', () => {
  let service: TrafficSourceService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    trafficSource: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  const mockRedisService = {
    setTrafficSource: jest.fn(),
    getTrafficSource: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrafficSourceService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<TrafficSourceService>(TrafficSourceService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all traffic sources', async () => {
      const expectedResult = [
        { id: 1, name: 'Facebook Ads' },
        { id: 2, name: 'Google Ads' },
      ];
      mockPrismaService.trafficSource.findMany.mockResolvedValueOnce(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.trafficSource.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a traffic source by id', async () => {
      const expectedResult = { id: 1, name: 'Facebook Ads' };
      mockRedisService.getTrafficSource.mockResolvedValueOnce(null);
      mockPrismaService.trafficSource.findUnique.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.trafficSource.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockRedisService.setTrafficSource).toHaveBeenCalledWith(expectedResult);
    });

    it('should return cached traffic source if available', async () => {
      const expectedResult = { id: 1, name: 'Facebook Ads' };
      mockRedisService.getTrafficSource.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.trafficSource.findUnique).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if traffic source not found', async () => {
      mockRedisService.getTrafficSource.mockResolvedValueOnce(null);
      mockPrismaService.trafficSource.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getQueryParams', () => {
    it('should return query params for a traffic source', async () => {
      const trafficSource = {
        id: 1,
        name: 'Facebook Ads',
        queryParams: { utm_source: 'facebook', utm_medium: 'cpc' },
      };
      mockRedisService.getTrafficSource.mockResolvedValueOnce(null);
      mockPrismaService.trafficSource.findUnique.mockResolvedValueOnce(trafficSource);

      const result = await service.getQueryParams(1);

      expect(result).toEqual(trafficSource.queryParams);
    });

    it('should throw NotFoundException if traffic source not found', async () => {
      mockRedisService.getTrafficSource.mockResolvedValueOnce(null);
      mockPrismaService.trafficSource.findUnique.mockResolvedValueOnce(null);

      await expect(service.getQueryParams(1)).rejects.toThrow(NotFoundException);
    });
  });
}); 