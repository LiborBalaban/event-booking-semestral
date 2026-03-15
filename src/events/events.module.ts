import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';
import { EventsController } from './events.controller';

@Module({
  providers: [EventsService, PrismaService],
  controllers: [EventsController]
})
export class EventsModule {}
