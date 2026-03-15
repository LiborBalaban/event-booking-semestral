import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':id/register')
  async register(@Param('id') eventId: string, @Body('userId') userId: string) {
    return this.eventsService.registerUserForEvent(userId, eventId);
  }

  @Delete(':id/register')
  async cancel(@Param('id') eventId: string, @Body('userId') userId: string) {
    return this.eventsService.cancelRegistration(userId, eventId);
  }
}