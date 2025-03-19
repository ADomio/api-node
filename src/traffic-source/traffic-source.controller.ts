import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { TrafficSourceService } from './traffic-source.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('traffic-sources')
@Controller('traffic-sources')
export class TrafficSourceController {
  constructor(private readonly trafficSourceService: TrafficSourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all traffic sources' })
  @ApiResponse({ status: 200, description: 'List of traffic sources' })
  findAll() {
    return this.trafficSourceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a traffic source by ID' })
  @ApiResponse({ status: 200, description: 'Traffic source found' })
  @ApiResponse({ status: 404, description: 'Traffic source not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.trafficSourceService.findOne(id);
  }

  @Get(':id/query-params')
  @ApiOperation({ summary: 'Get query parameters for a traffic source' })
  @ApiResponse({ status: 200, description: 'Query parameters found' })
  @ApiResponse({ status: 404, description: 'Traffic source not found' })
  getQueryParams(@Param('id', ParseIntPipe) id: number) {
    return this.trafficSourceService.getQueryParams(id);
  }
} 