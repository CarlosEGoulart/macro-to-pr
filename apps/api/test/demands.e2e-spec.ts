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

describe('Demands (e2e) - POST /demands', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let developerId: string;
  let repositoryId: string;
  let projectId: string;
  let otherDeveloperId: string;
  let otherProjectId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const jwtService = moduleFixture.get(JwtService);

    // Dados de seed (idempotentes entre rodadas)
    await prisma.developer.deleteMany({ where: { email: 'dev-demand@test.com' } });
    const developer = await prisma.developer.create({
      data: {
        email: 'dev-demand@test.com',
        name: 'Dev Demand Teste',
        githubAccountId: 'gh-e2e-demand',
      },
    });
    developerId = developer.id;

    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-demand' } });
    const repository = await prisma.repository.create({
      data: {
        githubAccountId: 'gh-e2e-demand',
        name: 'repo-demand',
        fullName: 'owner/repo-demand',
        url: 'https://github.com/owner/repo-demand',
        owner: 'owner',
        private: false,
      },
    });
    repositoryId = repository.id;

    // Projeto associado ao desenvolvedor e ao repositório
    await prisma.project.deleteMany({ where: { developerId } });
    const project = await prisma.project.create({
      data: {
        name: 'Projeto Demand',
        developerId,
        repositoryId,
      },
    });
    projectId = project.id;

    // Outro desenvolvedor com seu próprio projeto (cenário de permissão CA3)
    await prisma.developer.deleteMany({ where: { email: 'dev-other@test.com' } });
    const otherDeveloper = await prisma.developer.create({
      data: {
        email: 'dev-other@test.com',
        name: 'Dev Outro Teste',
        githubAccountId: 'gh-e2e-other',
      },
    });
    otherDeveloperId = otherDeveloper.id;

    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-other' } });
    const otherRepository = await prisma.repository.create({
      data: {
        githubAccountId: 'gh-e2e-other',
        name: 'repo-other',
        fullName: 'owner/repo-other',
        url: 'https://github.com/owner/repo-other',
        owner: 'owner',
        private: false,
      },
    });

    await prisma.project.deleteMany({ where: { developerId: otherDeveloperId } });
    const otherProject = await prisma.project.create({
      data: {
        name: 'Projeto Outro',
        developerId: otherDeveloperId,
        repositoryId: otherRepository.id,
      },
    });
    otherProjectId = otherProject.id;

    accessToken = await jwtService.signAsync({
      userId: developerId,
      email: developer.email,
    });
  });

  afterAll(async () => {
    // Limpeza das tabelas envolvidas com tratamento de PrismaClientKnownRequestError
    // (tabelas que podem não existir no RED)
    try {
      await prisma.demand.deleteMany({ where: {} });
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
    try {
      await prisma.project.deleteMany({ where: { developerId } });
    } catch (error) {
      const isTableNotFound =
        error instanceof PrismaClientKnownRequestError &&
        (error.message.includes('does not exist') ||
          error.message.includes('undefined_table'));
      if (!isTableNotFound) {
        throw error;
      }
    }
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-demand' } });
    await prisma.developer.deleteMany({ where: { email: 'dev-demand@test.com' } });
    await prisma.project.deleteMany({ where: { developerId: otherDeveloperId } });
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-other' } });
    await prisma.developer.deleteMany({ where: { email: 'dev-other@test.com' } });
    await app.close();
  });

  it('deve criar uma demanda associada ao projeto e retornar o objeto completo com id (CA1)', async () => {
    const response = await request(app.getHttpServer())
      .post('/demands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Nova demanda',
        description: 'Descrição da demanda',
        type: 'feature',
        priority: 'high',
        projectId,
      })
      .expect(201);

    const body = (response.body.data ?? response.body) as {
      id: string;
      title: string;
      description: string;
      projectId: string;
    };
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body.id.length).toBeGreaterThan(0);
    expect(body.title).toBe('Nova demanda');
    expect(body.description).toBe('Descrição da demanda');
    expect(body.projectId).toBe(projectId);
  });

  it('deve retornar 403 quando o projeto não pertence ao desenvolvedor autenticado (CA3)', async () => {
    await request(app.getHttpServer())
      .post('/demands')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Demanda em projeto alheio',
        description: 'Tentativa de criar demanda em projeto de outro desenvolvedor',
        type: 'feature',
        priority: 'high',
        projectId: otherProjectId,
      })
      .expect(403);
  });

  it('deve retornar 401 quando POST /demands é chamado sem token', async () => {
    await request(app.getHttpServer())
      .post('/demands')
      .send({
        title: 'Nova demanda',
        description: 'Descrição da demanda',
        type: 'feature',
        priority: 'high',
        projectId,
      })
      .expect(401);
  });
});
