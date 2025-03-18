import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { UpdateFilterDto } from './dto/update-filter.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('filters')
@Controller('campaigns/:campaignId/streams/:streamId/filters')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new filter' })
  @ApiResponse({ status: 201, description: 'Filter created successfully' })
  create(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('streamId', ParseIntPipe) streamId: number,
    @Body() createFilterDto: CreateFilterDto
  ) {
    return this.filterService.create(streamId, createFilterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all filters for a stream' })
  @ApiResponse({ status: 200, description: 'List of filters' })
  findAll(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('streamId', ParseIntPipe) streamId: number
  ) {
    return this.filterService.findAll(streamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a filter by ID' })
  @ApiResponse({ status: 200, description: 'Filter found' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  findOne(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('streamId', ParseIntPipe) streamId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.filterService.findOne(streamId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a filter' })
  @ApiResponse({ status: 200, description: 'Filter updated successfully' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('streamId', ParseIntPipe) streamId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFilterDto: UpdateFilterDto
  ) {
    return this.filterService.update(streamId, id, updateFilterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a filter' })
  @ApiResponse({ status: 200, description: 'Filter deleted successfully' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('streamId', ParseIntPipe) streamId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.filterService.remove(streamId, id);
  }
} 