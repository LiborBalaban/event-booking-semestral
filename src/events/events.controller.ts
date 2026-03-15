import { Controller, Post, Delete, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post(':id/register')
  @ApiOperation({ summary: 'Přihlásí uživatele na událost' })
  @ApiResponse({ status: 201, description: 'Uživatel úspěšně přihlášen.' })
  @ApiResponse({ status: 400, description: 'Špatný požadavek (vyprodáno, po termínu, atd.).' })
  async register(@Param('id') eventId: string, @Body() body: RegisterUserDto) {
    return this.eventsService.registerUserForEvent(body.userId, eventId);
  }

  @Delete(':id/register')
  @ApiOperation({ summary: 'Zruší přihlášku uživatele (max 24h předem)' })
  async cancel(@Param('id') eventId: string, @Body() body: RegisterUserDto) {
    return this.eventsService.cancelRegistration(body.userId, eventId);
  }
}