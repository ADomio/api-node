import { Module } from '@nestjs/common';
import { StreamController } from './stream.controller';
import { StreamService } from './stream.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [StreamController],
  providers: [StreamService, PrismaService],
  exports: [StreamService],
})
export class StreamModule {} 