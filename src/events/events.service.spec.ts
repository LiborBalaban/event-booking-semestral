import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

describe('EventsService', () => {
  let service: EventsService;
  let prismaMock: DeepMockProxy<PrismaClient>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  describe('Pravidlo 1: Omezení kapacity', () => {
    it('měl by vyhodit BadRequestException, pokud je událost vyprodaná', async () => {
      const eventId = 'event-1';
      const userId = 'user-1';

      prismaMock.event.findUnique.mockResolvedValue({
        id: eventId,
        name: 'Super koncert',
        capacity: 2,
        date: futureDate,
        isAdultOnly: false,
        registrations: [
          { id: 'reg1', userId: 'u1', eventId, createdAt: new Date() },
          { id: 'reg2', userId: 'u2', eventId, createdAt: new Date() }
        ]
      } as any);

      await expect(service.registerUserForEvent(userId, eventId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Pravidlo 2: Zabránění duplicitě', () => {
    it('měl by vyhodit ConflictException, pokud se uživatel hlásí podruhé', async () => {
      const eventId = 'event-1';
      const userId = 'user-1';

      prismaMock.event.findUnique.mockResolvedValue({
        id: eventId,
        name: 'Super koncert',
        capacity: 10,
        date: futureDate, 
        isAdultOnly: false,
        registrations: [
          { id: 'reg1', userId: userId, eventId: eventId, createdAt: new Date() }
        ]
      } as any);

      await expect(service.registerUserForEvent(userId, eventId)).rejects.toThrow(ConflictException);
    });
  });

  describe('Pravidlo 3: Deadline přihlášek', () => {
    it('měl by vyhodit BadRequestException, pokud událost již proběhla', async () => {
      const eventId = 'event-1';
      const userId = 'user-1';

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      prismaMock.event.findUnique.mockResolvedValue({
        id: eventId,
        name: 'Včerejší párty',
        capacity: 10,
        date: pastDate,
        isAdultOnly: false,
        registrations: []
      } as any);

      await expect(service.registerUserForEvent(userId, eventId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('Pravidlo 4: Validace zrušení', () => {
    it('měl by vyhodit BadRequestException při pokusu o zrušení méně než 24h předem', async () => {
      const eventId = 'event-1';
      const userId = 'user-1';

      const closeDate = new Date();
      closeDate.setHours(closeDate.getHours() + 12);

      prismaMock.registration.findUnique.mockResolvedValue({
        id: 'reg1',
        userId: userId,
        eventId: eventId,
        createdAt: new Date(),
        event: {
          date: closeDate
        }
      } as any);

      await expect(service.cancelRegistration(userId, eventId)).rejects.toThrow(BadRequestException);
    });
  });
});