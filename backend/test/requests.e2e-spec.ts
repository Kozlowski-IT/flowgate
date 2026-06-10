import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { DomainErrorFilter } from '../src/shared/filters/domain-error.filter';

const TITLE = `e2e-antrag-${process.pid}`;

describe('Requests (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let requesterToken: string;
  let reviewerToken: string;
  let requestId: string;

  const login = async (email: string): Promise<string> => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'Demo1234!' })
      .expect(200);
    return (res.body as { accessToken: string }).accessToken;
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new DomainErrorFilter());
    await app.init();
    dataSource = moduleRef.get(DataSource);
    requesterToken = await login('requester@flowgate.demo');
    reviewerToken = await login('reviewer@flowgate.demo');
  });

  afterAll(async () => {
    await dataSource.query('DELETE FROM requests WHERE title LIKE $1', [
      'e2e-antrag-%',
    ]);
    await app.close();
  });

  it('POST /requests creates a draft', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        title: TITLE,
        payload: {
          category: 'purchase',
          description: 'Neue Tastatur für das Büro',
        },
      })
      .expect(201);
    const body = res.body as { id: string; status: string };
    requestId = body.id;
    expect(body.status).toBe('draft');
  });

  it('PUT /requests/:id updates an own draft', async () => {
    const res = await request(app.getHttpServer())
      .put(`/api/v1/requests/${requestId}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        title: TITLE,
        payload: {
          category: 'purchase',
          description: 'Neue Tastatur und Maus für das Büro',
          amountEur: 120,
        },
      })
      .expect(200);
    expect(
      (res.body as { payload: { amountEur: number } }).payload.amountEur,
    ).toBe(120);
  });

  it('rejects validation errors (400)', () =>
    request(app.getHttpServer())
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({ title: 'x', payload: { category: 'nope', description: 'kurz' } })
      .expect(400));

  it('POST /requests/:id/submit moves draft to submitted', async () => {
    const res = await request(app.getHttpServer())
      .post(`/api/v1/requests/${requestId}/submit`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .expect(200);
    expect((res.body as { status: string }).status).toBe('submitted');
  });

  it('PUT after submit → 422 (not editable)', () =>
    request(app.getHttpServer())
      .put(`/api/v1/requests/${requestId}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .send({
        title: TITLE,
        payload: { category: 'purchase', description: 'Änderung nach Submit' },
      })
      .expect(422));

  it('reviewer sees the submitted request in the list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/requests')
      .set('Authorization', `Bearer ${reviewerToken}`)
      .expect(200);
    const titles = (res.body as Array<{ title: string }>).map((r) => r.title);
    expect(titles).toContain(TITLE);
  });

  it('requester cannot read a foreign request (403)', async () => {
    const foreign = await request(app.getHttpServer())
      .post('/api/v1/requests')
      .set('Authorization', `Bearer ${reviewerToken}`)
      .send({
        title: `${TITLE}-foreign`,
        payload: {
          category: 'other',
          description: 'Antrag eines anderen Users',
        },
      })
      .expect(201);
    await request(app.getHttpServer())
      .get(`/api/v1/requests/${(foreign.body as { id: string }).id}`)
      .set('Authorization', `Bearer ${requesterToken}`)
      .expect(403);
  });
});
