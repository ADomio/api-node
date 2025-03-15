import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { Filter } from '@prisma/client';

@Injectable()
export class FilterService {
  constructor(private prisma: PrismaService) {}

  async create(streamId: number, createFilterDto: CreateFilterDto): Promise<Filter> {
    // Verify stream exists
    const stream = await this.prisma.stream.findUnique({
      where: { id: streamId },
    });

    if (!stream) {
      throw new NotFoundException(`Stream with ID ${streamId} not found`);
    }

    return this.prisma.filter.create({
      data: {
        ...createFilterDto,
        streamId,
      },
    });
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

  async findOne(id: number): Promise<Filter> {
    const filter = await this.prisma.filter.findUnique({
      where: { id },
    });

    if (!filter) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }

    return filter;
  }

  async update(id: number, updateFilterDto: CreateFilterDto): Promise<Filter> {
    const filter = await this.prisma.filter.findUnique({
      where: { id },
    });

    if (!filter) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }

    return this.prisma.filter.update({
      where: { id },
      data: updateFilterDto,
    });
  }

  async remove(id: number): Promise<void> {
    const filter = await this.prisma.filter.findUnique({
      where: { id },
    });

    if (!filter) {
      throw new NotFoundException(`Filter with ID ${id} not found`);
    }

    await this.prisma.filter.delete({
      where: { id },
    });
  }
} 