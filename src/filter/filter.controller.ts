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
import { Filter } from '@prisma/client';

@Controller()
export class FilterController {
  constructor(private readonly filterService: FilterService) {}

  @Post('streams/:streamId/filters')
  create(
    @Param('streamId', ParseIntPipe) streamId: number,
    @Body() createFilterDto: CreateFilterDto,
  ): Promise<Filter> {
    return this.filterService.create(streamId, createFilterDto);
  }

  @Get('streams/:streamId/filters')
  findAll(@Param('streamId', ParseIntPipe) streamId: number): Promise<Filter[]> {
    return this.filterService.findAll(streamId);
  }

  @Get('filters/:id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Filter> {
    return this.filterService.findOne(id);
  }

  @Put('filters/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFilterDto: CreateFilterDto,
  ): Promise<Filter> {
    return this.filterService.update(id, updateFilterDto);
  }

  @Delete('filters/:id')
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.filterService.remove(id);
  }
} 