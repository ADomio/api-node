import { Test, TestingModule } from '@nestjs/testing';
import { FilterService } from './filter.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateFilterDto, FilterOperation, FilterType } from './dto/create-filter.dto';

describe('FilterService', () => {
  let service: FilterService;
  let prisma: PrismaService;

  const mockPrismaService = {
    stream: {
      findUnique: jest.fn(),
    },
    filter: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilterService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<FilterService>(FilterService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateFilterDto = {
      type: FilterType.country,
      operation: FilterOperation.equals,
      value: 'US',
    };

    it('should create a filter when stream exists', async () => {
      const streamId = 1;
      const expectedResult = { id: 1, streamId, ...createDto };
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
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      const streamId = 1;
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(streamId, createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all filters for a stream when stream exists', async () => {
      const streamId = 1;
      const expectedResult = [
        { id: 1, streamId, type: FilterType.country, operation: FilterOperation.equals, value: 'US' },
        { id: 2, streamId, type: FilterType.browser, operation: FilterOperation.equals, value: 'Chrome' },
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
      const streamId = 1;
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.findAll(streamId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a filter by id', async () => {
      const expectedResult = { id: 1, type: FilterType.country, operation: FilterOperation.equals, value: 'US' };
      mockPrismaService.filter.findUnique.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.filter.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: CreateFilterDto = {
      type: FilterType.browser,
      operation: FilterOperation.equals,
      value: 'Firefox',
    };

    it('should update a filter when it exists', async () => {
      const expectedResult = { id: 1, ...updateDto };
      mockPrismaService.filter.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.filter.update.mockResolvedValueOnce(expectedResult);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.filter.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a filter when it exists', async () => {
      mockPrismaService.filter.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.filter.delete.mockResolvedValueOnce({ id: 1 });

      await service.remove(1);

      expect(mockPrismaService.filter.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when filter does not exist', async () => {
      mockPrismaService.filter.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.filter.delete).not.toHaveBeenCalled();
    });
  });
}); 