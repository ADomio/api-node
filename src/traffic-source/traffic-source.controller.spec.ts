import { Test, TestingModule } from '@nestjs/testing';
import { TrafficSourceController } from './traffic-source.controller';
import { TrafficSourceService } from './traffic-source.service';

describe('TrafficSourceController', () => {
  let controller: TrafficSourceController;
  let service: TrafficSourceService;

  const mockTrafficSourceService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    getQueryParams: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrafficSourceController],
      providers: [
        {
          provide: TrafficSourceService,
          useValue: mockTrafficSourceService,
        },
      ],
    }).compile();

    controller = module.get<TrafficSourceController>(TrafficSourceController);
    service = module.get<TrafficSourceService>(TrafficSourceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all traffic sources', async () => {
      const expectedResult = [
        { id: 1, name: 'Facebook Ads' },
        { id: 2, name: 'Google Ads' },
      ];
      mockTrafficSourceService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockTrafficSourceService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a traffic source by id', async () => {
      const expectedResult = { id: 1, name: 'Facebook Ads' };
      mockTrafficSourceService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockTrafficSourceService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('getQueryParams', () => {
    it('should return query parameters for a traffic source', async () => {
      const expectedResult = { utm_source: 'facebook', utm_medium: 'cpc' };
      mockTrafficSourceService.getQueryParams.mockResolvedValueOnce(expectedResult);

      const result = await controller.getQueryParams(1);

      expect(result).toEqual(expectedResult);
      expect(mockTrafficSourceService.getQueryParams).toHaveBeenCalledWith(1);
    });
  });
}); 