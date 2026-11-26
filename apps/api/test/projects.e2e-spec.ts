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

    // Conta GitHub do desenvolvedor (simula a conta criada no fluxo OAuth)
    const GITHUB_ACCOUNT_ID = '00000000-0000-0000-0000-000000000100';
    await prisma.gitHubAccount.deleteMany({ where: { id: GITHUB_ACCOUNT_ID } });
    await prisma.gitHubAccount.create({
      data: {
        id: GITHUB_ACCOUNT_ID,
        githubUserId: 'gh-e2e-test-user',
        githubLogin: 'e2etest',
        accessToken: 'ghp_e2e_token',
        scopes: 'repo user:email',
      },
    });

    // Conta GitHub de outro desenvolvedor (para CA2 — repositório fora da conta)
    const GITHUB_ACCOUNT_OUT_ID = '00000000-0000-0000-0000-000000000101';
    await prisma.gitHubAccount.deleteMany({ where: { id: GITHUB_ACCOUNT_OUT_ID } });
    await prisma.gitHubAccount.create({
      data: {
        id: GITHUB_ACCOUNT_OUT_ID,
        githubUserId: 'gh-e2e-out-user',
        githubLogin: 'e2eout',
        accessToken: 'ghp_e2e_out_token',
        scopes: 'repo user:email',
      },
    });

    // Dados de seed (idempotentes entre rodadas)
    await prisma.developer.deleteMany({ where: { email: 'dev@test.com' } });
    const developer = await prisma.developer.create({
      data: { email: 'dev@test.com', name: 'Dev Teste', githubAccountId: GITHUB_ACCOUNT_ID },
    });
    developerId = developer.id;

    await prisma.repository.deleteMany({ where: { githubAccountId: GITHUB_ACCOUNT_ID } });
    const repository = await prisma.repository.create({
      data: {
        githubAccountId: GITHUB_ACCOUNT_ID,
        name: 'repo-teste',
        fullName: 'owner/repo-teste',
        url: 'https://github.com/owner/repo-teste',
        owner: 'owner',
        private: false,
      },
    });
    repositoryId = repository.id;

    // Repositório de OUTRA Conta GitHub (não pertence ao desenvolvedor) — CA2
    await prisma.repository.deleteMany({ where: { githubAccountId: GITHUB_ACCOUNT_OUT_ID } });
    const repositoryOutOfAccount = await prisma.repository.create({
      data: {
        githubAccountId: GITHUB_ACCOUNT_OUT_ID,
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
    }
    await prisma.repository.deleteMany({ where: { githubAccountId: '00000000-0000-0000-0000-000000000100' } });
    await prisma.repository.deleteMany({ where: { githubAccountId: '00000000-0000-0000-0000-000000000101' } });
    await prisma.gitHubAccount.deleteMany({ where: { id: '00000000-0000-0000-0000-000000000100' } });
    await prisma.gitHubAccount.deleteMany({ where: { id: '00000000-0000-0000-0000-000000000101' } });
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

  it('POST /projects só passa se houver repositório sincronizado prévio (pré-requisito de Demanda)', async () => {
    // Simula o fluxo de sync do OAuth: cria a GitHubAccount e o Repository
    // vinculados ao desenvolvedor autenticado, como se viessem do GitHub.
    await prisma.gitHubAccount.deleteMany({ where: { githubUserId: 'gh-sync-test' } });
    const githubAccount = await prisma.gitHubAccount.create({
      data: {
        githubUserId: 'gh-sync-test',
        githubLogin: 'synceddev',
        accessToken: 'ghp_sync_token',
        scopes: 'repo user:email',
      },
    });

    await prisma.repository.deleteMany({ where: { githubAccountId: githubAccount.id } });
    const syncedRepository = await prisma.repository.create({
      data: {
        githubAccountId: githubAccount.id,
        name: 'repo-sync',
        fullName: 'synceddev/repo-sync',
        url: 'https://github.com/synceddev/repo-sync',
        owner: 'synceddev',
        private: false,
      },
    });

    // Vincula o desenvolvedor à Conta GitHub (como ocorre após o OAuth)
    await prisma.developer.update({
      where: { id: developerId },
      data: { githubAccountId: githubAccount.id },
    });

    const response = await request(app.getHttpServer())
      .post('/projects')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Projeto Sincronizado', repositoryId: syncedRepository.id })
      .expect(201);

    const body = response.body.data ?? response.body;
    expect(body).toHaveProperty('id');
    expect(body.name).toBe('Projeto Sincronizado');
    expect(body.repositoryId).toBe(syncedRepository.id);
    expect(body.developerId).toBe(developerId);

    // Limpeza do fluxo de sync simulado
    await prisma.project.deleteMany({ where: { repositoryId: syncedRepository.id } });
    await prisma.repository.deleteMany({ where: { id: syncedRepository.id } });
    await prisma.gitHubAccount.deleteMany({ where: { id: githubAccount.id } });
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

    // Conta GitHub do desenvolvedor autenticado
    const GITHUB_ACCOUNT_GET_ID = '00000000-0000-0000-0000-000000000200';
    await prisma.gitHubAccount.deleteMany({ where: { id: GITHUB_ACCOUNT_GET_ID } });
    await prisma.gitHubAccount.create({
      data: {
        id: GITHUB_ACCOUNT_GET_ID,
        githubUserId: 'gh-e2e-get-user',
        githubLogin: 'e2eget',
        accessToken: 'ghp_e2e_get_token',
        scopes: 'repo user:email',
      },
    });

    // Desenvolvedor autenticado
    await prisma.developer.deleteMany({ where: { email: 'dev-get@test.com' } });
    const developer = await prisma.developer.create({
      data: {
        email: 'dev-get@test.com',
        name: 'Dev Get Teste',
        githubAccountId: GITHUB_ACCOUNT_GET_ID,
      },
    });
    developerId = developer.id;

    // Outro desenvolvedor (seus projetos NÃO devem aparecer no seletor)
    // Precisa de uma Conta GitHub distinta porque Developer.githubAccountId é @unique
    const GITHUB_ACCOUNT_OUTRO_ID = '00000000-0000-0000-0000-000000000201';
    await prisma.gitHubAccount.deleteMany({ where: { id: GITHUB_ACCOUNT_OUTRO_ID } });
    await prisma.gitHubAccount.create({
      data: {
        id: GITHUB_ACCOUNT_OUTRO_ID,
        githubUserId: 'gh-e2e-get-outro-user',
        githubLogin: 'e2egetoutro',
        accessToken: 'ghp_e2e_get_outro_token',
        scopes: 'repo user:email',
      },
    });
    await prisma.developer.deleteMany({ where: { email: 'dev-outro@test.com' } });
    const outroDeveloper = await prisma.developer.create({
      data: {
        email: 'dev-outro@test.com',
        name: 'Dev Outro',
        githubAccountId: GITHUB_ACCOUNT_OUTRO_ID,
      },
    });

    await prisma.repository.deleteMany({ where: { githubAccountId: GITHUB_ACCOUNT_GET_ID } });
    const repository = await prisma.repository.create({
      data: {
        githubAccountId: GITHUB_ACCOUNT_GET_ID,
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
    await prisma.repository.deleteMany({ where: { githubAccountId: '00000000-0000-0000-0000-000000000200' } });
    await prisma.gitHubAccount.deleteMany({ where: { id: '00000000-0000-0000-0000-000000000200' } });
    await prisma.gitHubAccount.deleteMany({ where: { id: '00000000-0000-0000-0000-000000000201' } });
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

describe('Projects (e2e) - GET /projects/repositories', () => {
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

    // Desenvolvedor com Conta GitHub vinculada
    await prisma.developer.deleteMany({ where: { email: 'dev-repos@test.com' } });
    const developer = await prisma.developer.create({
      data: {
        email: 'dev-repos@test.com',
        name: 'Dev Repos Teste',
        githubAccountId: '00000000-0000-0000-0000-000000000001',
      },
    });
    developerId = developer.id;

    // Conta GitHub vinculada
    await prisma.gitHubAccount.deleteMany({ where: { githubUserId: 'gh-user-1' } });
    await prisma.gitHubAccount.create({
      data: {
        id: '00000000-0000-0000-0000-000000000001',
        githubUserId: 'gh-user-1',
        githubLogin: 'devtest',
        accessToken: 'ghp_token_teste',
        scopes: 'repo user:email',
      },
    });

    // Vincula o desenvolvedor à conta (já tem githubAccountId no create acima, mas garante)
    await prisma.developer.update({
      where: { id: developerId },
      data: { githubAccountId: '00000000-0000-0000-0000-000000000001' },
    });

    // Repositórios sincronizados
    await prisma.repository.deleteMany({ where: { githubAccountId: '00000000-0000-0000-0000-000000000001' } });
    await prisma.repository.createMany({
      data: [
        {
          githubAccountId: '00000000-0000-0000-0000-000000000001',
          name: 'repo-alpha',
          fullName: 'devtest/repo-alpha',
          url: 'https://github.com/devtest/repo-alpha',
          owner: 'devtest',
          private: false,
        },
        {
          githubAccountId: '00000000-0000-0000-0000-000000000001',
          name: 'repo-beta',
          fullName: 'devtest/repo-beta',
          url: 'https://github.com/devtest/repo-beta',
          owner: 'devtest',
          private: true,
        },
      ],
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
    await prisma.repository.deleteMany({ where: { githubAccountId: '00000000-0000-0000-0000-000000000001' } });
    await prisma.gitHubAccount.deleteMany({ where: { githubUserId: 'gh-user-1' } });
    await prisma.developer.deleteMany({ where: { email: 'dev-repos@test.com' } });
    await app.close();
  });

  it('deve retornar 401 quando GET /projects/repositories é chamado sem token', async () => {
    await request(app.getHttpServer()).get('/projects/repositories').expect(401);
  });

  it('deve retornar 200 com os repositórios da Conta GitHub do desenvolvedor autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/projects/repositories')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = (response.body.data ?? response.body) as {
      id: string;
      name: string;
      fullName: string;
      githubAccountId: string;
    }[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body.every((r) => r.githubAccountId === '00000000-0000-0000-0000-000000000001')).toBe(true);
    expect(body.map((r) => r.name).sort()).toEqual(['repo-alpha', 'repo-beta']);
  });
});

describe('Projects (e2e) - GET /developer/me', () => {
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

    await prisma.developer.deleteMany({ where: { email: 'dev-me@test.com' } });
    const developer = await prisma.developer.create({
      data: {
        email: 'dev-me@test.com',
        name: 'Dev Me Teste',
        avatarUrl: 'https://github.com/avatar.png',
        githubAccountId: '00000000-0000-0000-0000-000000000002',
      },
    });
    developerId = developer.id;

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
    await prisma.developer.deleteMany({ where: { email: 'dev-me@test.com' } });
    await app.close();
  });

  it('deve retornar 401 quando GET /developer/me é chamado sem token', async () => {
    await request(app.getHttpServer()).get('/developer/me').expect(401);
  });

  it('deve retornar 200 com os dados do desenvolvedor autenticado', async () => {
    const response = await request(app.getHttpServer())
      .get('/developer/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const body = (response.body.data ?? response.body) as {
      id: string;
      name: string;
      email: string;
      avatarUrl: string | null;
    };
    expect(body.id).toBe(developerId);
    expect(body.name).toBe('Dev Me Teste');
    expect(body.email).toBe('dev-me@test.com');
    expect(body.avatarUrl).toBe('https://github.com/avatar.png');
  });
});
