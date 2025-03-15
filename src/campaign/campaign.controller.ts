import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import type { Campaign } from '@prisma/client';

@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  create(@Body() createCampaignDto: CreateCampaignDto): Promise<Campaign> {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  findAll(): Promise<Campaign[]> {
    return this.campaignService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Campaign> {
    return this.campaignService.findOne(id);
  }

  @Get('code/:code')
  findByCode(@Param('code') code: string): Promise<Campaign> {
    return this.campaignService.findByCode(code);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampaignDto: CreateCampaignDto,
  ): Promise<Campaign> {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.campaignService.remove(id);
  }
} 