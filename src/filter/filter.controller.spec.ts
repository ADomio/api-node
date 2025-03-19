import { Test, TestingModule } from '@nestjs/testing';
import { FilterController } from './filter.controller';
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { FilterOperations, FilterTypes } from '@prisma/client';

describe('FilterController', () => {
  let controller: FilterController;
  let service: FilterService;

  const mockFilterService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilterController],
      providers: [
        {
          provide: FilterService,
          useValue: mockFilterService,
        },
      ],
    }).compile();

    controller = module.get<FilterController>(FilterController);
    service = module.get<FilterService>(FilterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a filter', async () => {
      const campaignId = 1;
      const streamId = 1;
      const createDto: CreateFilterDto = {
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US',
      };
      const expectedResult = { id: 1, ...createDto, streamId };
      mockFilterService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(campaignId, streamId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.create).toHaveBeenCalledWith(streamId, createDto);
    });
  });

  describe('findAll', () => {
    it('should return filters for stream', async () => {
      const campaignId = 1;
      const streamId = 1;
      const expectedResult = [
        { id: 1, type: FilterTypes.country, operation: FilterOperations.equals, value: 'US', streamId },
        { id: 2, type: FilterTypes.browser, operation: FilterOperations.equals, value: 'Chrome', streamId },
      ];
      mockFilterService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(campaignId, streamId);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.findAll).toHaveBeenCalledWith(streamId);
    });
  });

  describe('findOne', () => {
    it('should return a filter by id', async () => {
      const campaignId = 1;
      const streamId = 1;
      const filterId = 1;
      const expectedResult = {
        id: filterId,
        type: FilterTypes.country,
        operation: FilterOperations.equals,
        value: 'US',
        streamId,
      };
      mockFilterService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(campaignId, streamId, filterId);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.findOne).toHaveBeenCalledWith(streamId, filterId);
    });
  });

  describe('update', () => {
    it('should update a filter', async () => {
      const campaignId = 1;
      const streamId = 1;
      const filterId = 1;
      const updateDto = {
        type: FilterTypes.browser,
        operation: FilterOperations.equals,
        value: 'Chrome',
      };
      const expectedResult = { id: filterId, ...updateDto, streamId };
      mockFilterService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update(campaignId, streamId, filterId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.update).toHaveBeenCalledWith(streamId, filterId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a filter', async () => {
      const campaignId = 1;
      const streamId = 1;
      const filterId = 1;
      await controller.remove(campaignId, streamId, filterId);

      expect(mockFilterService.remove).toHaveBeenCalledWith(streamId, filterId);
    });
  });
}); 