import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from './campaign.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CampaignService', () => {
  let service: CampaignService;
  let prisma: PrismaService;

  const mockPrismaService = {
    campaign: {
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
        CampaignService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      name: 'Test Campaign',
      code: 'TEST1',
    };

    it('should create a campaign with provided code', async () => {
      const expectedResult = { id: 1, ...createDto };
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.campaign.create.mockResolvedValueOnce(expectedResult);

      const result = await service.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { code: createDto.code },
      });
      expect(mockPrismaService.campaign.create).toHaveBeenCalledWith({
        data: createDto,
        include: {
          streams: {
            include: {
              filters: true,
            },
          },
        },
      });
    });

    it('should create a campaign with generated code when code is not provided', async () => {
      const createDtoWithoutCode = { name: 'Test Campaign' };
      const mockGeneratedCode = 'ABC12'; // Example of a valid generated code
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.campaign.create.mockImplementationOnce(({ data }) => {
        return Promise.resolve({
          id: 1,
          ...data,
          code: data.code || mockGeneratedCode,
        });
      });

      const result = await service.create(createDtoWithoutCode);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe(createDtoWithoutCode.name);
      expect(result.code).toBeDefined();
      expect(typeof result.code).toBe('string');
      expect(result.code.length).toBe(5);
      expect(result.code).toMatch(/^[A-Z2-7]{5}$/);
      expect(mockPrismaService.campaign.create).toHaveBeenCalled();
      const createCall = mockPrismaService.campaign.create.mock.calls[0][0];
      expect(createCall.data.name).toBe(createDtoWithoutCode.name);
      expect(createCall.data.code).toMatch(/^[A-Z2-7]{5}$/);
    });

    it('should throw error if campaign code already exists', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: 1, ...createDto });

      await expect(service.create(createDto)).rejects.toThrow('Campaign code already exists');
    });
  });

  describe('findAll', () => {
    it('should return all campaigns', async () => {
      const expectedResult = [
        { id: 1, name: 'Campaign 1' },
        { id: 2, name: 'Campaign 2' },
      ];
      mockPrismaService.campaign.findMany.mockResolvedValueOnce(expectedResult);

      const result = await service.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findMany).toHaveBeenCalledWith({
        include: {
          streams: {
            include: {
              filters: true,
            },
          },
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      const expectedResult = { id: 1, name: 'Test Campaign' };
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(expectedResult);

      const result = await service.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          streams: {
            include: {
              filters: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCode', () => {
    it('should return a campaign by code', async () => {
      const expectedResult = { id: 1, name: 'Test Campaign', code: 'TEST1' };
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(expectedResult);

      const result = await service.findByCode('TEST1');

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.findUnique).toHaveBeenCalledWith({
        where: { code: 'TEST1' },
        include: {
          streams: {
            include: {
              filters: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.findByCode('TEST1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = {
      name: 'Updated Campaign',
      code: 'TEST2',
    };

    it('should update a campaign', async () => {
      const existingCampaign = { id: 1, name: 'Test Campaign', code: 'TEST1' };
      const expectedResult = { ...existingCampaign, ...updateDto };
      mockPrismaService.campaign.findUnique
        .mockResolvedValueOnce(existingCampaign) // First call for checking existence
        .mockResolvedValueOnce(null); // Second call for checking code uniqueness
      mockPrismaService.campaign.update.mockResolvedValueOnce(expectedResult);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.campaign.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateDto,
        include: {
          streams: {
            include: {
              filters: true,
            },
          },
        },
      });
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(1, updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if new code already exists', async () => {
      mockPrismaService.campaign.findUnique
        .mockResolvedValueOnce({ id: 1, name: 'Test Campaign', code: 'TEST1' })
        .mockResolvedValueOnce({ id: 2, name: 'Other Campaign', code: 'TEST2' });

      await expect(service.update(1, updateDto)).rejects.toThrow('Campaign code already exists');
    });
  });

  describe('remove', () => {
    it('should delete a campaign', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce({ id: 1 });
      mockPrismaService.campaign.delete.mockResolvedValueOnce({ id: 1 });

      await service.remove(1);

      expect(mockPrismaService.campaign.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException if campaign not found', async () => {
      mockPrismaService.campaign.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
}); 