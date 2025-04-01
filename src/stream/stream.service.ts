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

    // Get existing streams directly from database and update cache
    const existingStreams = await this.prisma.stream.findMany({
      where: { campaignId },
    });
    await this.redis.setStreams(campaignId, existingStreams);

    return stream;
  }

  async findAll(campaignId: number): Promise<Stream[]> {
    // Try to get streams from Redis first
    const cachedStreams = await this.redis.getStreams(campaignId);
    if (cachedStreams) {
      return cachedStreams;
    }

    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
    }

    // Get streams from database
    const streams = await this.prisma.stream.findMany({
      where: { campaignId },
    });

    // Cache the streams (will be empty array if no streams)
    await this.redis.setStreams(campaignId, streams);

    return streams;
  }

  async findOne(campaignId: number, id: number): Promise<Stream> {
    // Try to get streams from Redis first
    const cachedStreams = await this.redis.getStreams(campaignId);
    const cachedStream = cachedStreams?.find(s => s.id === id);
    if (cachedStream) {
      return cachedStream;
    }

    const stream = await this.prisma.stream.findFirst({
      where: {
        id,
        campaignId,
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

    const updatedStream = await this.prisma.stream.update({
      where: { id },
      data: updateStreamDto,
    });

    // Get all streams and update the modified one
    const streams = await this.findAll(campaignId);
    const updatedStreams = streams.map(s => s.id === id ? updatedStream : s);
    
    // Update Redis cache
    await this.redis.setStreams(campaignId, updatedStreams);

    return updatedStream;
  }

  async remove(campaignId: number, id: number): Promise<void> {
    // Verify stream exists in campaign
    await this.findOne(campaignId, id);

    // Delete stream from Redis cache (this will cascade delete filters in the database)
    await this.redis.deleteFilters(id);

    // Delete stream from database (this will cascade delete filters)
    await this.prisma.stream.delete({
      where: { id },
    });

    // Get remaining streams and update Redis
    const streams = await this.findAll(campaignId);
    const remainingStreams = streams.filter(s => s.id !== id);
    await this.redis.setStreams(campaignId, remainingStreams);
  }
} 