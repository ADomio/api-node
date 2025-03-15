import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import type { Stream } from '@prisma/client';

@Injectable()
export class StreamService {
  constructor(private prisma: PrismaService) {}

  async create(createStreamDto: CreateStreamDto): Promise<Stream> {
    // Verify campaign exists
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: createStreamDto.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${createStreamDto.campaignId} not found`);
    }

    return this.prisma.stream.create({
      data: createStreamDto,
    });
  }

  async findAll(campaignId?: number): Promise<Stream[]> {
    if (campaignId) {
      // Verify campaign exists
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${campaignId} not found`);
      }

      return this.prisma.stream.findMany({
        where: { campaignId },
        include: { filters: true },
      });
    }

    return this.prisma.stream.findMany({
      include: { filters: true },
    });
  }

  async findOne(id: number): Promise<Stream> {
    const stream = await this.prisma.stream.findUnique({
      where: { id },
      include: { filters: true },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    return stream;
  }

  async update(id: number, updateStreamDto: CreateStreamDto): Promise<Stream> {
    const stream = await this.prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    // Verify campaign exists if campaignId is being updated
    if (updateStreamDto.campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: updateStreamDto.campaignId },
      });

      if (!campaign) {
        throw new NotFoundException(`Campaign with ID ${updateStreamDto.campaignId} not found`);
      }
    }

    return this.prisma.stream.update({
      where: { id },
      data: updateStreamDto,
      include: { filters: true },
    });
  }

  async remove(id: number): Promise<void> {
    const stream = await this.prisma.stream.findUnique({
      where: { id },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${id} not found`);
    }

    await this.prisma.stream.delete({
      where: { id },
    });
  }
} 