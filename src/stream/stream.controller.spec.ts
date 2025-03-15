import { Test, TestingModule } from '@nestjs/testing';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { CreateStreamDto, StreamStatus } from './dto/create-stream.dto';

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
      const createDto: CreateStreamDto = {
        campaignId: 1,
        name: 'Test Stream',
        targetUrl: 'https://example.com',
        status: StreamStatus.active,
        weight: 1,
      };
      const expectedResult = { id: 1, ...createDto };
      mockStreamService.create.mockResolvedValueOnce(expectedResult);

      const result = await controller.create(createDto);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all streams when no campaignId provided', async () => {
      const expectedResult = [
        { id: 1, name: 'Stream 1' },
        { id: 2, name: 'Stream 2' },
      ];
      mockStreamService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(undefined);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should return streams for specific campaign when campaignId provided', async () => {
      const campaignId = 1;
      const expectedResult = [{ id: 1, name: 'Stream 1', campaignId }];
      mockStreamService.findAll.mockResolvedValueOnce(expectedResult);

      const result = await controller.findAll(campaignId);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.findAll).toHaveBeenCalledWith(campaignId);
    });
  });

  describe('findOne', () => {
    it('should return a stream by id', async () => {
      const expectedResult = { id: 1, name: 'Test Stream' };
      mockStreamService.findOne.mockResolvedValueOnce(expectedResult);

      const result = await controller.findOne(1);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a stream', async () => {
      const updateDto: CreateStreamDto = {
        campaignId: 1,
        name: 'Updated Stream',
        targetUrl: 'https://example.com/updated',
        status: StreamStatus.inactive,
        weight: 2,
      };
      const expectedResult = { id: 1, ...updateDto };
      mockStreamService.update.mockResolvedValueOnce(expectedResult);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(expectedResult);
      expect(mockStreamService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should delete a stream', async () => {
      await controller.remove(1);

      expect(mockStreamService.remove).toHaveBeenCalledWith(1);
    });
  });
}); 