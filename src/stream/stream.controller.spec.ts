import { Test, TestingModule } from '@nestjs/testing';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { Statuses } from '@prisma/client';

describe('StreamController', () => {
  let controller: StreamController;
  let service: StreamService;

  const mockStreamService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StreamController],
      providers: [
        {
          provide: StreamService,
          useValue: mockStreamService,
        },
      ],
    }).compile();

    controller = module.get<StreamController>(StreamController);
    service = module.get<StreamService>(StreamService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a stream', async () => {
      const campaignId = 1;
      const createDto: CreateStreamDto = {
        name: 'Test Stream',
        targetUrl: 'https://example.com',
        status: Statuses.active,
        weight: 1,
      };
      const expectedResult = { id: 1, ...createDto, campaignId };
      mockStreamService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(campaignId, createDto);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.create).toHaveBeenCalledWith(campaignId, createDto);
    });
  });

  describe('findAll', () => {
    it('should return streams for campaign', async () => {
      const campaignId = 1;
      const expectedResult = [
        { id: 1, name: 'Stream 1', campaignId },
        { id: 2, name: 'Stream 2', campaignId },
      ];
      mockStreamService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(campaignId);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.findAll).toHaveBeenCalledWith(campaignId);
    });
  });

  describe('findOne', () => {
    it('should return a stream by id', async () => {
      const campaignId = 1;
      const streamId = 1;
      const expectedResult = { id: streamId, name: 'Test Stream', campaignId };
      mockStreamService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(campaignId, streamId);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.findOne).toHaveBeenCalledWith(campaignId, streamId);
    });
  });

  describe('update', () => {
    it('should update a stream', async () => {
      const campaignId = 1;
      const streamId = 1;
      const updateDto = {
        name: 'Updated Stream',
        targetUrl: 'https://example.com/updated',
        status: Statuses.inactive,
        weight: 2,
      };
      const expectedResult = { id: streamId, ...updateDto, campaignId };
      mockStreamService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update(campaignId, streamId, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.update).toHaveBeenCalledWith(campaignId, streamId, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a stream', async () => {
      const campaignId = 1;
      const streamId = 1;
      await controller.remove(campaignId, streamId);

      expect(mockStreamService.remove).toHaveBeenCalledWith(campaignId, streamId);
    });
  });
}); 