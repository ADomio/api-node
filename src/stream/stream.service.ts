import { Injectable, NotFoundException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import type { Stream } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StreamService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(campaignId: number, createStreamDto: CreateStreamDto): Promise<Stream> {
    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    const stream = await this.prisma.stream.create({
      data: {
        ...createStreamDto,
        campaignId,
      },
    });
    await this.redis.setStream(stream);
    return stream;
  }

  async findAll(campaignId: number): Promise<Stream[]> {
    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    return this.prisma.stream.findMany({
      where: { campaignId },
      include: {
        filters: true,
      },
    });
  }

  async findOne(campaignId: number, id: number): Promise<Stream> {
    const stream = await this.prisma.stream.findFirst({
      where: {
        id,
        campaignId,
      },
      include: {
        filters: true,
      },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found in campaign ${campaignId}`);
    }

    return stream;
  }

  async update(campaignId: number, id: number, updateStreamDto: UpdateStreamDto): Promise<Stream> {
    // Verify stream exists in campaign
    await this.findOne(campaignId, id);

    return this.prisma.stream.update({
      where: { id },
      data: updateStreamDto,
      include: {
        filters: true,
      },
    });
  }

  async remove(campaignId: number, id: number): Promise<void> {
    // Verify stream exists in campaign
    await this.findOne(campaignId, id);

    await this.redis.deleteStream(id, campaignId);
    await this.prisma.stream.delete({
      where: { id },
    });
  }
} 