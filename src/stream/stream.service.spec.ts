import { Test, TestingModule } from '@nestjs/testing';
import { StreamService } from './stream.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';
import { CreateStreamDto, StreamStatus } from './dto/create-stream.dto';

describe('StreamService', () => {
  let service: StreamService;
  let prisma: PrismaService;

  const mockPrismaService = {
    campaign: {
      findUnique: jest.fn(),
    },
    stream: {
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
        StreamService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StreamService>(StreamService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateStreamDto = {
      campaignId: 1,
      name: 'Test Stream',
      targetUrl: 'https://example.com',
      status: StreamStatus.active,
      weight: 1,
    };

    it('should create a stream when campaign exists', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.stream.create.mockResolvedValueOnce(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: createDto.campaignId },
      });
      expect(mockPrismaService.stream.create).toHaveBeenCalledWith({
        data: createDto,
      });
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all streams when no campaignId provided', async () => {
      const expectedResult = [
        { id: 1, name: 'Stream 1' },
        { id: 2, name: 'Stream 2' },
      ];
      mockPrismaService.stream.findMany.mockResolvedValueOnce(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.findMany).toHaveBeenCalledWith({
        include: { filters: true },
      });
    });

    it('should return streams for specific campaign when campaignId provided', async () => {
      const campaignId = 1;
      const expectedResult = [{ id: 1, name: 'Stream 1', campaignId }];
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
      const campaignId = 1;
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.findAll(campaignId)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a stream by id', async () => {
      const expectedResult = { id: 1, name: 'Test Stream' };
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { filters: true },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: CreateStreamDto = {
      campaignId: 1,
      name: 'Updated Stream',
      targetUrl: 'https://example.com/updated',
      status: StreamStatus.inactive,
      weight: 2,
    };

    it('should update a stream when it exists and campaign exists', async () => {
      const expectedResult = { id: 1, ...updateDto };
      mockPrismaService.stream.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.stream.update.mockResolvedValueOnce(expectedResult);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.stream.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: { filters: true },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when campaign does not exist', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a stream when it exists', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.stream.delete.mockResolvedValueOnce({ id: 1 });

      await service.remove(1);

      expect(mockPrismaService.stream.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when stream does not exist', async () => {
      mockPrismaService.stream.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
      expect(mockPrismaService.stream.delete).not.toHaveBeenCalled();
    });
  });
}); 