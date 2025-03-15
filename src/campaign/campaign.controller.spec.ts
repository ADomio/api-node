import { Test, TestingModule } from '@nestjs/testing';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';

describe('CampaignController', () => {
  let controller: CampaignController;
  let service: CampaignService;

  const mockCampaignService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByCode: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CampaignController],
      providers: [
        {
          provide: CampaignService,
          useValue: mockCampaignService,
        },
      ],
    }).compile();

    controller = module.get<CampaignController>(CampaignController);
    service = module.get<CampaignService>(CampaignService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign', async () => {
      const createDto: CreateCampaignDto = {
        name: 'Test Campaign',
        code: 'TEST1',
      };
      const expectedResult = { id: 1, ...createDto };
      mockCampaignService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockCampaignService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all campaigns', async () => {
      const expectedResult = [
        { id: 1, name: 'Campaign 1' },
        { id: 2, name: 'Campaign 2' },
      ];
      mockCampaignService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll();

      expect(result).toEqual(expectedResult);
      expect(mockCampaignService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      const expectedResult = { id: 1, name: 'Test Campaign' };
      mockCampaignService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockCampaignService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findByCode', () => {
    it('should return a campaign by code', async () => {
      const expectedResult = { id: 1, name: 'Test Campaign', code: 'TEST1' };
      mockCampaignService.findByCode.mockResolvedValueOnce(expectedResult);

      const result = await controller.findByCode('TEST1');

      expect(result).toEqual(expectedResult);
      expect(mockCampaignService.findByCode).toHaveBeenCalledWith('TEST1');
    });
  });

  describe('update', () => {
    it('should update a campaign', async () => {
      const updateDto: CreateCampaignDto = {
        name: 'Updated Campaign',
        code: 'TEST2',
      };
      const expectedResult = { id: 1, ...updateDto };
      mockCampaignService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockCampaignService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a campaign', async () => {
      await controller.remove(1);

      expect(mockCampaignService.remove).toHaveBeenCalledWith(1);
    });
  });
}); 