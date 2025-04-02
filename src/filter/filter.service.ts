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

    // Get existing filters directly from database and update cache
    const existingFilters = await this.prisma.filter.findMany({
      where: { streamId },
    });
    await this.redis.setFilters(streamId, existingFilters);

    return filter;
  }

  async findAll(streamId: number): Promise<Filter[]> {
    // Try to get filters from Redis first
    const cachedFilters = await this.redis.getFilters(streamId);
    if (cachedFilters && cachedFilters.length > 0) {
      return cachedFilters;
    }

    // Verify stream exists
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }

    // Get filters from database
    const filters = await this.prisma.filter.findMany({
      where: { streamId },
    });

    // Cache the filters
    await this.redis.setFilters(streamId, filters);

    return filters;
  }

  async findOne(streamId: number, id: number): Promise<Filter> {
    // Try to get filters from Redis first
    const cachedFilters = await this.redis.getFilters(streamId);
    const cachedFilter = cachedFilters?.find(f => f.id === id);
    if (cachedFilter) {
      return cachedFilter;
    }

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

    // Get all filters and update the modified one in cache
    const filters = await this.findAll(streamId);
    const updatedFilters = filters.map(f => f.id === id ? updatedFilter : f);
    await this.redis.setFilters(streamId, updatedFilters);

    return updatedFilter;
  }

  async remove(streamId: number, id: number): Promise<void> {
    // Verify filter exists in stream
    await this.findOne(streamId, id);

    await this.prisma.filter.delete({
      where: { id },
    });

    // Get remaining filters and update cache
    const filters = await this.findAll(streamId);
    const remainingFilters = filters.filter(f => f.id !== id);
    await this.redis.setFilters(streamId, remainingFilters);
  }
} 