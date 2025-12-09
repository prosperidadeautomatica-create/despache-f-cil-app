import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Quotes (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    // Login to get token (assuming demo client exists)
    const loginResponse = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'demo@easydispatch.com',
        password: 'demo123',
      });

    if (loginResponse.status === 200) {
      authToken = loginResponse.body.token;
    }
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/quotes (POST)', () => {
    it('should create a quote with valid data', () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token available');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originPostal: '01310100',
          destinationPostal: '04547000',
          weight: 5.5,
          length: 30,
          width: 20,
          height: 10,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('quoteId');
          expect(res.body).toHaveProperty('finalPrice');
          expect(res.body).toHaveProperty('correlationId');
        });
    });

    it('should reject invalid postal code', () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token available');
        return;
      }

      return request(app.getHttpServer())
        .post('/api/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          originPostal: 'invalid',
          destinationPostal: '04547000',
          weight: 5.5,
          length: 30,
          width: 20,
          height: 10,
        })
        .expect(400);
    });

    it('should require authentication', () => {
      return request(app.getHttpServer())
        .post('/api/quotes')
        .send({
          originPostal: '01310100',
          destinationPostal: '04547000',
          weight: 5.5,
          length: 30,
          width: 20,
          height: 10,
        })
        .expect(401);
    });
  });

  describe('/api/quotes (GET)', () => {
    it('should return list of quotes', () => {
      if (!authToken) {
        console.warn('Skipping test - no auth token available');
        return;
      }

      return request(app.getHttpServer())
        .get('/api/quotes')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('quotes');
          expect(Array.isArray(res.body.quotes)).toBe(true);
        });
    });
  });
});

