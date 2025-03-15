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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('campaigns')
@Controller('campaigns')
export class CampaignController {
  constructor(private readonly campaignService: CampaignService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new campaign' })
  @ApiResponse({ 
    status: 201, 
    description: 'The campaign has been successfully created.',
    type: CreateCampaignDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignService.create(createCampaignDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all campaigns.',
    type: [CreateCampaignDto]
  })
  findAll() {
    return this.campaignService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found campaign.',
    type: CreateCampaignDto
  })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.findOne(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get a campaign by code' })
  @ApiParam({ name: 'code', description: 'Campaign code' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found campaign.',
    type: CreateCampaignDto
  })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  findByCode(@Param('code') code: string) {
    return this.campaignService.findByCode(code);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The campaign has been successfully updated.',
    type: CreateCampaignDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCampaignDto: CreateCampaignDto,
  ) {
    return this.campaignService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign' })
  @ApiParam({ name: 'id', description: 'Campaign ID' })
  @ApiResponse({ status: 200, description: 'The campaign has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.campaignService.remove(id);
  }
} 