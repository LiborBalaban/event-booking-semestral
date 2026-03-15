import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async registerUserForEvent(userId: string, eventId: string) {
    
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { registrations: true },
    });

    if (!event) {
      throw new NotFoundException('Událost nebyla nalezena');
    }

    if (event.registrations.length >= event.capacity) {
      throw new BadRequestException('Událost je již vyprodaná');
    }

    const alreadyRegistered = event.registrations.some(reg => reg.userId === userId);
    if (alreadyRegistered) {
      throw new ConflictException('Uživatel je již na tuto událost přihlášen');
    }

    return this.prisma.registration.create({
      data: {
        userId,
        eventId,
      },
    });
  }
}