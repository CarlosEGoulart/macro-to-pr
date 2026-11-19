import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { Role } from '../src/generated/prisma/enums.js';

// Variáveis de ambiente exigidas para bootar a AppModule (JwtStrategy + PrismaClient)
process.env.JWT_SECRET = 'test-secret-123456';
process.env.DATABASE_URL =
  'postgresql://app:app@localhost:5432/appdb?schema=public';

describe('Roles (e2e) - CA2: Desenvolvedor em rota de Admin recebe 403', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let devToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const jwtService = moduleFixture.get(JwtService);

    // Desenvolvedor (papel padrão Developer) — idempotente entre rodadas
    await prisma.developer.deleteMany({ where: { email: 'dev-roles@test.com' } });
    await prisma.developer.create({
      data: {
        email: 'dev-roles@test.com',
        name: 'Dev Roles',
        githubAccountId: 'gh-roles-test',
      },
    });

    devToken = await jwtService.signAsync({
      userId: 'dev-roles-id',
      email: 'dev-roles@test.com',
      role: Role.Developer,
    });

    adminToken = await jwtService.signAsync({
      userId: 'dev-roles-id',
      email: 'dev-roles@test.com',
      role: Role.Admin,
    });
  });

  afterAll(async () => {
    await prisma.developer.deleteMany({ where: { email: 'dev-roles@test.com' } });
    await app.close();
  });

  it('Desenvolvedor com token válido em rota @Roles(Role.Admin) responde 403 (não 500, não 200)', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/ping')
      .set('Authorization', `Bearer ${devToken}`)
      .expect(403);

    expect(response.body.statusCode).toBe(403);
  });

  it('sem token na rota @Roles(Role.Admin) responde 401 (AuthGuard antes do RolesGuard, nunca 500)', async () => {
    await request(app.getHttpServer()).get('/admin/ping').expect(401);
  });

  it('Admin com token válido em rota @Roles(Role.Admin) responde 200', async () => {
    await request(app.getHttpServer())
      .get('/admin/ping')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });
});
