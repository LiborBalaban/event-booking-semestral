import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [EventsService, PrismaService]
})
export class EventsModule {}
