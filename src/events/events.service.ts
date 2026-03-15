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

    if (event.date < new Date()) {
      throw new BadRequestException('Na událost se již nelze přihlásit, protože proběhla');
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

  async cancelRegistration(userId: string, eventId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: {
        userId_eventId: { userId, eventId }
      },
      include: { event: true },
    });

    if (!registration) {
      throw new NotFoundException('Přihláška nebyla nalezena');
    }

    const eventDate = registration.event.date;
    const now = new Date();
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      throw new BadRequestException('Přihlášku nelze zrušit méně než 24 hodin před začátkem události');
    }

    return this.prisma.registration.delete({
      where: { id: registration.id },
    });
  }
}