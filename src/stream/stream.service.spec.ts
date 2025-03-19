import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from './stream.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Statuses } from '@prisma/client';

describe('StreamService', () => {
  let service: StreamService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    campaign: {
      findUnique: jest.fn(),
    },
    stream: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockRedisService = {
    setStream: jest.fn(),
    getStream: jest.fn(),
    deleteStream: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamService,
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

    service = module.get<StreamService>(StreamService);
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateStreamDto = {
      name: 'Test Stream',
      targetUrl: 'https://example.com',
      status: Statuses.active,
      weight: 1,
    };

    it('should create a stream when campaign exists', async () => {
      const campaignId = 1;
      const expectedResult = { id: 1, ...createDto, campaignId };
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: campaignId });
      mockPrismaService.stream.create.mockResolvedValueOnce(expectedResult);

      const result = await service.create(campaignId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: campaignId },
      });
      expect(mockPrismaService.stream.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          campaignId,
        },
      });
      expect(mockRedisService.setStream).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      const campaignId = 1;
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(campaignId, createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const campaignId = 1;

    it('should return streams for specific campaign', async () => {
      const expectedResult = [
        { id: 1, name: 'Stream 1', campaignId },
        { id: 2, name: 'Stream 2', campaignId },
      ];
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: campaignId });
      mockPrismaService.stream.findMany.mockResolvedValueOnce(expectedResult);

      const result = await service.findAll(campaignId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.findMany).toHaveBeenCalledWith({
        where: { campaignId },
        include: { filters: true },
      });
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.findAll(campaignId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const campaignId = 1;
    const streamId = 1;

    it('should return a stream by id', async () => {
      const expectedResult = { id: streamId, name: 'Test Stream', campaignId };
      mockPrismaService.stream.findFirst.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(campaignId, streamId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.findFirst).toHaveBeenCalledWith({
        where: {
          id: streamId,
          campaignId,
        },
        include: { filters: true },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(campaignId, streamId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const campaignId = 1;
    const streamId = 1;
    const updateDto = {
      name: 'Updated Stream',
      targetUrl: 'https://example.com/updated',
      status: Statuses.inactive,
      weight: 2,
    };

    it('should update a stream when it exists', async () => {
      const expectedResult = { id: streamId, ...updateDto, campaignId };
      mockPrismaService.stream.findFirst.mockResolvedValueOnce({ id: streamId, campaignId });
      mockPrismaService.stream.update.mockResolvedValueOnce(expectedResult);

      const result = await service.update(campaignId, streamId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.update).toHaveBeenCalledWith({
        where: { id: streamId },
        data: updateDto,
        include: { filters: true },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findFirst.mockResolvedValueOnce(null);

      await expect(service.update(campaignId, streamId, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const campaignId = 1;
    const streamId = 1;

    it('should delete a stream when it exists', async () => {
      mockPrismaService.stream.findFirst.mockResolvedValueOnce({ id: streamId, campaignId });
      mockPrismaService.stream.delete.mockResolvedValueOnce({ id: streamId });

      await service.remove(campaignId, streamId);

      expect(mockRedisService.deleteStream).toHaveBeenCalledWith(streamId, campaignId);
      expect(mockPrismaService.stream.delete).toHaveBeenCalledWith({
        where: { id: streamId },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findFirst.mockResolvedValueOnce(null);

      await expect(service.remove(campaignId, streamId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.delete).not.toHaveBeenCalled();
      expect(mockRedisService.deleteStream).not.toHaveBeenCalled();
    });
  });
}); 