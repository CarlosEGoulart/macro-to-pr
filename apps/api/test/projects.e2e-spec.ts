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
  let repositoryIdOutOfAccount: string;

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
      data: { email: 'dev@test.com', name: 'Dev Teste', githubAccountId: 'gh-e2e-test' },
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

    // Repositório de OUTRA Conta GitHub (não pertence ao desenvolvedor) — CA2
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-out-of-account' } });
    const repositoryOutOfAccount = await prisma.repository.create({
      data: {
        githubAccountId: 'gh-out-of-account',
        name: 'repo-fora-da-conta',
        fullName: 'outro/repo-fora-da-conta',
        url: 'https://github.com/outro/repo-fora-da-conta',
        owner: 'outro',
        private: false,
      },
    });
    repositoryIdOutOfAccount = repositoryOutOfAccount.id;

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
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-out-of-account' } });
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

  it('não deve criar projeto quando o repositório não pertence à Conta GitHub vinculada ao desenvolvedor (CA2)', async () => {
    const response = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Projeto Bloqueado', repositoryId: repositoryIdOutOfAccount })
      .expect(400);

    expect(response.body.statusCode).toBe(400);
    expect(response.body.message).toContain('não pertence');
  });

  it('não deve criar outro projeto para o mesmo repositório (CA3)', async () => {
    // Isola do teste CA1: remove qualquer projeto já existente neste repositório
    await prisma.project.deleteMany({ where: { repositoryId } });

    // Cria o primeiro projeto — deve funcionar
    await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Projeto 1', repositoryId })
      .expect(201);

    // Tenta criar um segundo projeto para o mesmo repositório — CA3 deve impedir
    const response = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Projeto 2', repositoryId })
      .expect(409);

    expect(response.body.statusCode).toBe(409);
    expect(response.body.message).toContain('Já existe');
  });
});

describe('Projects (e2e) - GET /projects (CA4)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;
  let developerId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, JwtModule.register({ secret: process.env.JWT_SECRET })],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get(PrismaService);
    await app.init();

    const jwtService = moduleFixture.get(JwtService);

    // Desenvolvedor autenticado
    await prisma.developer.deleteMany({ where: { email: 'dev-get@test.com' } });
    const developer = await prisma.developer.create({
      data: {
        email: 'dev-get@test.com',
        name: 'Dev Get Teste',
        githubAccountId: 'gh-e2e-get',
      },
    });
    developerId = developer.id;

    // Outro desenvolvedor (seus projetos NÃO devem aparecer no seletor)
    await prisma.developer.deleteMany({ where: { email: 'dev-outro@test.com' } });
    const outroDeveloper = await prisma.developer.create({
      data: {
        email: 'dev-outro@test.com',
        name: 'Dev Outro',
        githubAccountId: 'gh-e2e-get-outro',
      },
    });

    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-get' } });
    const repository = await prisma.repository.create({
      data: {
        githubAccountId: 'gh-e2e-get',
        name: 'repo-get',
        fullName: 'owner/repo-get',
        url: 'https://github.com/owner/repo-get',
        owner: 'owner',
        private: false,
      },
    });

    // Dois projetos do desenvolvedor autenticado
    await prisma.project.createMany({
      data: [
        { name: 'Projeto A', developerId, repositoryId: repository.id },
        { name: 'Projeto B', developerId, repositoryId: repository.id },
      ],
    });

    // Um projeto de OUTRO desenvolvedor (deve ser filtrado pelo repository)
    await prisma.project.create({
      data: {
        name: 'Projeto Outro Dev',
        developerId: outroDeveloper.id,
        repositoryId: repository.id,
      },
    });

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
    }
    await prisma.repository.deleteMany({ where: { githubAccountId: 'gh-e2e-get' } });
    await prisma.developer.deleteMany({ where: { email: 'dev-get@test.com' } });
    await prisma.developer.deleteMany({ where: { email: 'dev-outro@test.com' } });
    await app.close();
  });

  it('deve retornar 401 quando GET /projects é chamado sem token', async () => {
    await request(app.getHttpServer()).get('/projects').expect(401);
  });

  it('deve retornar 200 com a lista de projetos do desenvolvedor autenticado (CA4)', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = (response.body.data ?? response.body) as {
      id: string;
      name: string;
      developerId: string;
    }[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body.every((p) => p.developerId === developerId)).toBe(true);
    expect(body.map((p) => p.name).sort()).toEqual(['Projeto A', 'Projeto B']);
  });
});
