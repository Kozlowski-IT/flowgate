import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;
  let token: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login → 200 + token', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'requester@flowgate.demo', password: 'Demo1234!' })
      .expect(200);
    token = (res.body as { accessToken: string }).accessToken;
    expect(token).toBeDefined();
  });

  it('GET /auth/me without token → 401', () =>
    request(app.getHttpServer()).get('/api/v1/auth/me').expect(401));

  it('GET /auth/me with token → 200 + role', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect((res.body as { role: string }).role).toBe('requester');
  });

  it('GET /users as requester → 403 (admin only)', () =>
    request(app.getHttpServer())
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(403));

  it('GET /users as admin → 200 + list', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@flowgate.demo', password: 'Demo1234!' })
      .expect(200);
    const res = await request(app.getHttpServer())
      .get('/api/v1/users')
      .set(
        'Authorization',
        `Bearer ${(login.body as { accessToken: string }).accessToken}`,
      )
      .expect(200);
    expect((res.body as unknown[]).length).toBeGreaterThanOrEqual(3);
  });
});
