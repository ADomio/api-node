import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { TrafficSource } from '@prisma/client';

@Injectable()
export class TrafficSourceService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  async findAll(): Promise<TrafficSource[]> {
    return this.prisma.trafficSource.findMany();
  }

  async findOne(id: number): Promise<TrafficSource> {
    const cached = await this.redis.getTrafficSource(id);
    if (cached) return cached;

    const trafficSource = await this.prisma.trafficSource.findUnique({
      where: { id },
    });

    if (!trafficSource) {
      throw new NotFoundException(`Traffic source with ID ${id} not found`);
    }

    await this.redis.setTrafficSource(trafficSource);
    return trafficSource;
  }

  async getQueryParams(id: number): Promise<Record<string, string>> {
    const trafficSource = await this.findOne(id);
    return trafficSource.queryParams as Record<string, string>;
  }
} 