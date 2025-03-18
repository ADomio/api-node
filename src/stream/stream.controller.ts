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
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('streams')
@Controller('campaigns/:campaignId/streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stream' })
  @ApiResponse({ status: 201, description: 'Stream created successfully' })
  create(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Body() createStreamDto: CreateStreamDto
  ) {
    return this.streamService.create(campaignId, createStreamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all streams for a campaign' })
  @ApiResponse({ status: 200, description: 'List of streams' })
  findAll(@Param('campaignId', ParseIntPipe) campaignId: number) {
    return this.streamService.findAll(campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stream by ID' })
  @ApiResponse({ status: 200, description: 'Stream found' })
  @ApiResponse({ status: 404, description: 'Stream not found' })
  findOne(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.streamService.findOne(campaignId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a stream' })
  @ApiResponse({ status: 200, description: 'Stream updated successfully' })
  @ApiResponse({ status: 404, description: 'Stream not found' })
  update(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStreamDto: UpdateStreamDto
  ) {
    return this.streamService.update(campaignId, id, updateStreamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stream' })
  @ApiResponse({ status: 200, description: 'Stream deleted successfully' })
  @ApiResponse({ status: 404, description: 'Stream not found' })
  remove(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.streamService.remove(campaignId, id);
  }
} 