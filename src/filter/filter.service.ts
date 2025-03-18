import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { Filter } from '@prisma/client';

@Injectable()
export class FilterService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async create(streamId: number, createFilterDto: CreateFilterDto): Promise<Filter> {
    // Verify stream exists
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }

    const filter = await this.prisma.filter.create({
      data: {
        ...createFilterDto,
        streamId,
      },
    });
    await this.redis.setFilter(filter);
    return filter;
  }

  async findAll(streamId: number): Promise<Filter[]> {
    // Verify stream exists
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }

    return this.prisma.filter.findMany({
      where: { streamId },
    });
  }

  async findOne(streamId: number, id: number): Promise<Filter> {
    const filter = await this.prisma.filter.findFirst({
      where: {
        id,
        streamId,
      },
    });

    if (!filter) {
      throw new NotFoundException(`Filter with ID ${id} not found in stream ${streamId}`);
    }

    return filter;
  }

  async update(streamId: number, id: number, updateFilterDto: UpdateFilterDto): Promise<Filter> {
    // Verify filter exists in stream
    await this.findOne(streamId, id);

    const updatedFilter = await this.prisma.filter.update({
      where: { id },
      data: updateFilterDto,
    });
    await this.redis.setFilter(updatedFilter);
    return updatedFilter;
  }

  async remove(streamId: number, id: number): Promise<void> {
    // Verify filter exists in stream
    await this.findOne(streamId, id);

    await this.redis.deleteFilter(id, streamId);
    await this.prisma.filter.delete({
      where: { id },
    });
  }
} 