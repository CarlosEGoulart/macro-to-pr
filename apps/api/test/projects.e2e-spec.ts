import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { AppModule } from '../src/app.module.js';
import request from 'supertest';
import { JwtModule } from '@nestjs/jwt';

// Variáveis de ambiente exigidas para bootar a AppModule (JwtStrategy + PrismaClient)
process.env.JWT_SECRET = 'test-secret-123456';
process.env.DATABASE_URL =
  'postgresql://app:app@localhost:5432/appdb?schema=public';

describe('Projects (e2e) - POST /projects', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let developerId: string;
  let repositoryId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const jwtService = moduleFixture.get(JwtService);

    // Dados de seed (idempotentes entre rodadas)
    await prisma.developer.deleteMany({ where: { email: 'dev@test.com' } });
    const developer = await prisma.developer.create({
      data: { email: 'dev@test.com', name: 'Dev Teste' },
    });
    developerId = developer.id;

    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-test' } });
    const repository = await prisma.repository.create({
      data: {
        githubAccountId: 'gh-e2e-test',
        name: 'repo-teste',
        fullName: 'owner/repo-teste',
        url: 'https://github.com/owner/repo-teste',
        owner: 'owner',
        private: false,
      },
    });
    repositoryId = repository.id;

    accessToken = await jwtService.signAsync({
      userId: developerId,
      email: developer.email,
    });
  });

  afterAll(async () => {
    try {
      await prisma.project.deleteMany({ where: {} });
    } catch (error) {
      const isTableNotFound =
        error instanceof PrismaClientKnownRequestError &&
        (error.message.includes('does not exist') ||
          error.message.includes('undefined_table'));
      if (!isTableNotFound) {
        throw error;
      }
      // Tabela ainda não existe (RED) — ignora
    }
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-test' } });
    await prisma.developer.deleteMany({ where: { email: 'dev@test.com' } });
    await app.close();
  });

  it('deve criar um projeto associado ao repositório do desenvolvedor autenticado (CA1)', async () => {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Meu Projeto', repositoryId })
      .expect(201);

    const body = response.body.data ?? response.body;
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Meu Projeto');
    expect(body.repositoryId).toBe(repositoryId);
    expect(body.developerId).toBe(developerId);
  });
});
