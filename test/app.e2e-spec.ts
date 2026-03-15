import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
const request = require('supertest');
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('Integrační E2E testy (Controller -> Service)', () => {
  let app: INestApplication;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Základní routa', () => {
    it('/ (GET) - mělo by vrátit Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('EventsController', () => {
    it('/events/:id/register (POST) - Úspěšné přihlášení (201)', async () => {
      
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      prismaMock.event.findUnique.mockResolvedValue({
        id: 'event-1', capacity: 10, date: futureDate, isAdultOnly: false, registrations: []
      } as any);

      prismaMock.user.findUnique.mockResolvedValue({
        id: 'user-1', age: 25
      } as any);

      prismaMock.registration.create.mockResolvedValue({
        id: 'reg-1', userId: 'user-1', eventId: 'event-1', createdAt: new Date()
      } as any);

      return request(app.getHttpServer())
        .post('/events/event-1/register')
        .send({ userId: 'user-1' })
        .expect(201);
    });

    it('/events/:id/register (POST) - Selhání validace bez userId (400)', async () => {

      return request(app.getHttpServer())
        .post('/events/event-1/register')
        .send({}) 
        .expect(400);
    });
  });
});