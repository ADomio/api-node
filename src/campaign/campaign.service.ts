import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { Campaign, Statuses, Currencies } from '@prisma/client';
import { randomBytes } from 'crypto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private generateCode(): string {
    // Generate 3 random bytes and convert to hex
    const hex = randomBytes(3).toString('hex');
    // Convert hex to decimal
    const decimal = parseInt(hex, 16);
    // Convert to base32 (using characters A-Z and 2-7)
    const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let code = '';
    let value = decimal;
    
    // Convert to base32 by repeatedly dividing by 32 and using remainder as index
    while (value > 0) {
      const remainder = value % 32;
      code = base32Chars[remainder] + code;
      value = Math.floor(value / 32);
    }

    // Ensure the code is exactly 5 characters by padding with 'A' if necessary
    return (code.padStart(5, 'A')).slice(0, 5);
  }

  async create(createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    const code = createCampaignDto.code || this.generateCode();

    // Check if code already exists
    const existingCampaign = await this.prisma.campaign.findUnique({
      where: { code },
    });

    if (existingCampaign) {
      throw new Error('Campaign code already exists');
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        name: createCampaignDto.name,
        code,
        status: createCampaignDto.status || 'active',
        currency: createCampaignDto.currency || 'usd',
      },
    });
    await this.redis.setCampaign(campaign);
    return campaign;
  }

  async findAll(): Promise<Campaign[]> {
    return this.prisma.campaign.findMany();
  }

  async findOne(id: number): Promise<Campaign> {
    // Try to get from Redis first
    const cached = await this.redis.getCampaign(id);
    if (cached) return cached;

    // If not in Redis, get from DB and cache
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });
    
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }
    
    await this.redis.setCampaign(campaign);
    return campaign;
  }

  async findByCode(code: string): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { code },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with code ${code} not found`);
    }

    return campaign;
  }

  async update(id: number, updateCampaignDto: UpdateCampaignDto): Promise<Campaign> {
    const campaign = await this.findOne(id);

    if (updateCampaignDto.code && updateCampaignDto.code !== campaign.code) {
      const existingCampaign = await this.prisma.campaign.findUnique({
        where: { code: updateCampaignDto.code },
      });

      if (existingCampaign) {
        throw new Error('Campaign code already exists');
      }
    }

    const updatedCampaign = await this.prisma.campaign.update({
      where: { id },
      data: updateCampaignDto,
    });
    await this.redis.setCampaign(updatedCampaign);
    return updatedCampaign;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Will throw if not found
    await this.redis.deleteCampaign(id);
    await this.prisma.campaign.delete({
      where: { id },
    });
  }
} 