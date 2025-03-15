import { Test, TestingModule } from '@nestjs/testing';
import { FilterController } from './filter.controller';
import { FilterService } from './filter.service';
import { CreateFilterDto, FilterOperation, FilterType } from './dto/create-filter.dto';

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
      const streamId = 1;
      const createDto: CreateFilterDto = {
        type: FilterType.country,
        operation: FilterOperation.equals,
        value: 'US',
      };
      const expectedResult = { id: 1, streamId, ...createDto };
      mockFilterService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(streamId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.create).toHaveBeenCalledWith(streamId, createDto);
    });
  });

  describe('findAll', () => {
    it('should return all filters for a stream', async () => {
      const streamId = 1;
      const expectedResult = [
        { id: 1, streamId, type: FilterType.country, operation: FilterOperation.equals, value: 'US' },
        { id: 2, streamId, type: FilterType.browser, operation: FilterOperation.equals, value: 'Chrome' },
      ];
      mockFilterService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(streamId);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.findAll).toHaveBeenCalledWith(streamId);
    });
  });

  describe('findOne', () => {
    it('should return a filter by id', async () => {
      const expectedResult = { id: 1, type: FilterType.country, operation: FilterOperation.equals, value: 'US' };
      mockFilterService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a filter', async () => {
      const updateDto: CreateFilterDto = {
        type: FilterType.browser,
        operation: FilterOperation.equals,
        value: 'Firefox',
      };
      const expectedResult = { id: 1, ...updateDto };
      mockFilterService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockFilterService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a filter', async () => {
      await controller.remove(1);

      expect(mockFilterService.remove).toHaveBeenCalledWith(1);
    });
  });
}); 