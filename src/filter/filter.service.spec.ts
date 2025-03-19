import { Test, TestingModule } from '@nestjs/testing';
import { FilterService } from './filter.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { NotFoundException } from '@nestjs/common';
import { CreateFilterDto } from './dto/create-filter.dto';
import { FilterOperations, FilterTypes } from '@prisma/client';

describe('FilterService', () => {
  let service: FilterService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    stream: {
      findUnique: jest.fn(),
    },
    filter: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockRedisService = {
    setFilter: jest.fn(),
    getFilter: jest.fn(),
    deleteFilter: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterService,
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

    service = module.get<FilterService>(FilterService);
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
    const createDto: CreateFilterDto = {
      type: FilterTypes.country,
      operation: FilterOperations.equals,
      value: 'US',
    };

    it('should create a filter when stream exists', async () => {
      const streamId = 1;
      const expectedResult = { id: 1, ...createDto, streamId };
      mockPrismaService.stream.findUnique.mockResolvedValueOnce({ id: streamId });
      mockPrismaService.filter.create.mockResolvedValueOnce(expectedResult);

      const result = await service.create(streamId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.findUnique).toHaveBeenCalledWith({
        where: { id: streamId },
      });
      expect(mockPrismaService.filter.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          streamId,
        },
      });
      expect(mockRedisService.setFilter).toHaveBeenCalledWith(expectedResult);
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      const streamId = 1;
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(streamId, createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    const streamId = 1;

    it('should return filters for specific stream', async () => {
      const expectedResult = [
        { id: 1, type: FilterTypes.country, operation: FilterOperations.equals, value: 'US', streamId },
        { id: 2, type: FilterTypes.browser, operation: FilterOperations.equals, value: 'Chrome', streamId },
      ];
      mockPrismaService.stream.findUnique.mockResolvedValueOnce({ id: streamId });
      mockPrismaService.filter.findMany.mockResolvedValueOnce(expectedResult);

      const result = await service.findAll(streamId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.filter.findMany).toHaveBeenCalledWith({
        where: { streamId },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.findAll(streamId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    const streamId = 1;
    const filterId = 1;

    it('should return a filter by id', async () => {
      const expectedResult = {
        id: filterId,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US',
        streamId,
      };
      mockPrismaService.filter.findFirst.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(streamId, filterId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.filter.findFirst).toHaveBeenCalledWith({
        where: {
          id: filterId,
          streamId,
        },
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findFirst.mockResolvedValueOnce(null);

      await expect(service.findOne(streamId, filterId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const streamId = 1;
    const filterId = 1;
    const updateDto = {
      type: FilterTypes.browser,
      operation: FilterOperations.equals,
      value: 'Chrome',
    };

    it('should update a filter when it exists', async () => {
      const expectedResult = { id: filterId, ...updateDto, streamId };
      mockPrismaService.filter.findFirst.mockResolvedValueOnce({ id: filterId, streamId });
      mockPrismaService.filter.update.mockResolvedValueOnce(expectedResult);

      const result = await service.update(streamId, filterId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.filter.update).toHaveBeenCalledWith({
        where: { id: filterId },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findFirst.mockResolvedValueOnce(null);

      await expect(service.update(streamId, filterId, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    const streamId = 1;
    const filterId = 1;

    it('should delete a filter when it exists', async () => {
      mockPrismaService.filter.findFirst.mockResolvedValueOnce({ id: filterId, streamId });
      mockPrismaService.filter.delete.mockResolvedValueOnce({ id: filterId });

      await service.remove(streamId, filterId);

      expect(mockRedisService.deleteFilter).toHaveBeenCalledWith(filterId, streamId);
      expect(mockPrismaService.filter.delete).toHaveBeenCalledWith({
        where: { id: filterId },
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findFirst.mockResolvedValueOnce(null);

      await expect(service.remove(streamId, filterId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.delete).not.toHaveBeenCalled();
      expect(mockRedisService.deleteFilter).not.toHaveBeenCalled();
    });
  });
}); 