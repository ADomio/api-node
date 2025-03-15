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
import type { Stream } from '@prisma/client';

@Controller('streams')
export class StreamController {
  constructor(private readonly streamService: StreamService) {}

  @Post()
  create(@Body() createStreamDto: CreateStreamDto): Promise<Stream> {
    return this.streamService.create(createStreamDto);
  }

  @Get()
  findAll(@Query('campaignId', ParseIntPipe) campaignId?: number): Promise<Stream[]> {
    return this.streamService.findAll(campaignId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Stream> {
    return this.streamService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStreamDto: CreateStreamDto,
  ): Promise<Stream> {
    return this.streamService.update(id, updateStreamDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.streamService.remove(id);
  }
} 