import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { JwtModule } from '@nestjs/jwt';

// Variáveis de ambiente exigidas para bootar a AppModule (JwtStrategy + PrismaClient)
process.env.JWT_SECRET = 'test-secret-123456';
process.env.DATABASE_URL =
  'postgresql://app:app@localhost:5432/appdb?schema=public';

describe('AuthGuard (e2e) - rotas protegidas e públicas', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rota protegida sem @Public() e sem token responde 401', async () => {
    await request(app.getHttpServer())
      .post('/projects')
      .send({ name: 'X', repositoryId: '00000000-0000-0000-0000-000000000000' })
      .expect(401);
  });

  it('rota pública com @Public() passa sem token', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200);

    expect(response.body).toEqual({ data: 'Hello World!' });
  });
});
