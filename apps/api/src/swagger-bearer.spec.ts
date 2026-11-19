import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { Reflector } from '@nestjs/core';
import { swaggerConfig } from './main.js';
import { AppModule } from './app.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { AppController } from './app.controller.js';
import { ProjectsController } from './modules/projects/projects.controller.js';
import { NotionController } from './modules/notion/notion.controller.js';

/**
 * PrismaService conecta ao banco em onModuleInit. Mockamos para não exigir
 * PostgreSQL nos testes de unidade do Swagger.
 */
class MockPrismaService {
  $connect = vi.fn().mockResolvedValue(undefined);
  $disconnect = vi.fn().mockResolvedValue(undefined);
}

describe('Swagger Bearer Auth (CA4)', () => {
  let app: INestApplication;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useClass(MockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    reflector = moduleFixture.get(Reflector);
  });

  afterEach(async () => {
    await app.close();
  });

  it('documento OpenAPI deve conter security scheme Bearer (http / bearer / bearerFormat JWT)', () => {
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    const schemes = document.components?.securitySchemes;
    expect(schemes).toBeDefined();
    const bearer = schemes!['bearer'];
    expect(bearer).toBeDefined();
    expect((bearer as { type: string; scheme: string; bearerFormat: string }).type).toBe('http');
    expect((bearer as { type: string; scheme: string; bearerFormat: string }).scheme).toBe('bearer');
    expect((bearer as { type: string; scheme: string; bearerFormat: string }).bearerFormat).toBe('JWT');
  });

  it('rota pública getHello() NÃO deve ter @ApiBearerAuth()', () => {
    const metadata = reflector.get(
      'swagger/apiSecurity',
      AppController.prototype.getHello,
    );
    expect(metadata).toBeUndefined();
  });

  it('rota protegida adminPing() deve ter @ApiBearerAuth()', () => {
    const metadata = reflector.get(
      'swagger/apiSecurity',
      AppController.prototype.adminPing,
    );
    expect(metadata).toBeDefined();
    expect(metadata).toContainEqual({ bearer: [] });
  });

  it('ProjectsController (protegido, sem @Public()) deve ter @ApiBearerAuth()', () => {
    const metadata = reflector.get('swagger/apiSecurity', ProjectsController);
    expect(metadata).toBeDefined();
    expect(metadata).toContainEqual({ bearer: [] });
  });

  it('NotionController (protegido, sem @Public()) deve ter @ApiBearerAuth()', () => {
    const metadata = reflector.get('swagger/apiSecurity', NotionController);
    expect(metadata).toBeDefined();
    expect(metadata).toContainEqual({ bearer: [] });
  });

  it('security scheme deve aparecer nas security requirements de rotas protegidas', () => {
    const document = SwaggerModule.createDocument(app, swaggerConfig);

    const adminPingPath = document.paths['/admin/ping'];
    expect(adminPingPath).toBeDefined();
    const adminPingGet = adminPingPath?.get;
    expect(adminPingGet?.security).toContainEqual({ bearer: [] });

    const createProjectPath = document.paths['/projects'];
    expect(createProjectPath).toBeDefined();
    const createProjectPost = createProjectPath?.post;
    expect(createProjectPost?.security).toContainEqual({ bearer: [] });
  });
});
