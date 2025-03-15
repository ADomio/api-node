import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { StreamService } from './stream.service';
import { CreateStreamDto } from './dto/create-stream.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import type { Stream } from '@prisma/client';

@ApiTags('streams')
@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new stream' })
  @ApiResponse({ 
    status: 201, 
    description: 'The stream has been successfully created.',
    type: CreateStreamDto 
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  create(@Body() createStreamDto: CreateStreamDto): Promise<Stream> {
    return this.streamService.create(createStreamDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all streams or streams for a specific campaign' })
  @ApiQuery({ 
    name: 'campaignId', 
    required: false, 
    description: 'Filter streams by campaign ID' 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'List of streams.',
    type: [CreateStreamDto]
  })
  @ApiResponse({ status: 404, description: 'Campaign not found.' })
  findAll(@Query('campaignId', ParseIntPipe) campaignId?: number): Promise<Stream[]> {
    return this.streamService.findAll(campaignId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a stream by ID' })
  @ApiParam({ name: 'id', description: 'Stream ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The found stream.',
    type: CreateStreamDto
  })
  @ApiResponse({ status: 404, description: 'Stream not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Stream> {
    return this.streamService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a stream' })
  @ApiParam({ name: 'id', description: 'Stream ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'The stream has been successfully updated.',
    type: CreateStreamDto
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  @ApiResponse({ status: 404, description: 'Stream not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStreamDto: CreateStreamDto,
  ): Promise<Stream> {
    return this.streamService.update(id, updateStreamDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a stream' })
  @ApiParam({ name: 'id', description: 'Stream ID' })
  @ApiResponse({ status: 200, description: 'The stream has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Stream not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.streamService.remove(id);
  }
} 