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
import { FilterService } from './filter.service';
import { CreateFilterDto } from './dto/create-filter.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('filters')
@Controller('streams/:streamId/filters')
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new filter for a stream' })
  @ApiParam({ name: 'streamId', description: 'Stream ID' })
  @ApiResponse({ 
    status: 201, 
    description: 'The filter has been successfully created.',
    type: CreateFilterDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Stream not found.' })
  create(
    @Param('streamId', ParseIntPipe) streamId: number,
    @Body() createFilterDto: CreateFilterDto,
  ) {
    return this.filterService.create(streamId, createFilterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all filters for a stream' })
  @ApiParam({ name: 'streamId', description: 'Stream ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of filters.',
    type: [CreateFilterDto]
  })
  @ApiResponse({ status: 404, description: 'Stream not found.' })
  findAll(@Param('streamId', ParseIntPipe) streamId: number) {
    return this.filterService.findAll(streamId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a filter by ID' })
  @ApiParam({ name: 'streamId', description: 'Stream ID' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found filter.',
    type: CreateFilterDto
  })
  @ApiResponse({ status: 404, description: 'Filter not found.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.filterService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a filter' })
  @ApiParam({ name: 'streamId', description: 'Stream ID' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The filter has been successfully updated.',
    type: CreateFilterDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Filter not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFilterDto: CreateFilterDto,
  ) {
    return this.filterService.update(id, updateFilterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a filter' })
  @ApiParam({ name: 'streamId', description: 'Stream ID' })
  @ApiParam({ name: 'id', description: 'Filter ID' })
  @ApiResponse({ status: 200, description: 'The filter has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Filter not found.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.filterService.remove(id);
  }
} 