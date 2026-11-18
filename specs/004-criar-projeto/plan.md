# Plano — Issue #4

## Decisões técnicas

- Módulo `projects` (NestJS) com `ProjectsController`, `ProjectsService`, `ProjectsRepository` para criar Projetos associados a Repositórios.
- Entidade Prisma `Project` (`id`, `name`, `developerId` FK → `Developer`, `repositoryId` FK → `Repository`, `createdAt`, `updatedAt`).
- Rota `POST /projects` protegida por `JwtAuthGuard` (Bearer JWT).
- DTO `CreateProjectDto` com `repositoryId` obrigatório, validado por `ValidationPipe`.
- Isolamento: o repositório deve pertencer à `GitHubAccount` vinculada ao `Developer` autenticado (RN08).
- Unicidade: no máximo 1 Projeto por `Developer` + `Repository` (RN01).
- Testes e2e em `test/` com supertest + Vitest; cada tarefa nasce com o teste RED que falha antes do código.

## Tarefas

- [x] **Tarefa 0 — Infraestrutura base: PrismaService, modelos Developer/Repository, JWT guard**
  - Cobre: passo técnico que destrava toda a Issue #4 (infraestrutura ausente)
  - Teste primeiro: não existe PrismaService, PrismaModule, JwtAuthGuard, modelos Developer/Repository; qualquer teste de criação falha porque a infraestrutura não existe
  - Arquivos previstos: `apps/api/src/prisma/prisma.service.ts`, `prisma.module.ts`, `src/modules/auth/jwt.strategy.ts`, `jwt-auth.guard.ts`, `prisma/schema.prisma` (modelos Developer, Repository), `apps/api/.env` (DATABASE_URL), `docker-compose.yml` (Postgres se necessário)

- [x] **Tarefa 1 — Scaffold do módulo projects + entidade Prisma Project**
  - Cobre: passo técnico que destrava CA1, CA2, CA3
  - Teste primeiro: não existe módulo projects nem entidade Project; o teste de criação falha porque a rota e a entidade não existem
  - Arquivos previstos: `apps/api/src/modules/projects/projects.module.ts`, `projects.controller.ts`, `projects.service.ts`, `projects.repository.ts`, `prisma/schema.prisma` (model Project), `prisma/migrations/*` (nova migration)

- [x] **Tarefa 2 — Rota POST /projects: criação de Projeto (CA1)**
  - Cobre: CA1 (Projeto criado e aparece entre os do desenvolvedor)
  - Teste primeiro: callback com `code` válido cria `GitHubAccount`+`Developer`, autentica e retorna JWT; falha antes do código pois o callback não existe
  - Arquivos previstos: `apps/api/src/modules/projects/projects.controller.ts` (rota POST /projects), `dto/create-project.dto.ts`, `projects.service.ts`, `projects.repository.ts`

- [x] **Tarefa 3 — Validação: repositório não pertence à Conta GitHub vinculada (CA2)**
  - Cobre: CA2 (nego ou não tenho acesso ao repositório → não cria)
  - Teste primeiro: callback com `code` válido cria `GitHubAccount`+`Developer`, autentica e retorna JWT; falha antes do código pois o callback não existe
  - Arquivos previstos: `projects.service.ts`, `projects.repository.ts`

- [x] **Tarefa 4 — Validação: já existe Projeto para este Repositório (CA3)**
  - Cobre: CA3 (já existe Projeto meu para este Repositório → não cria)
  - Teste primeiro: callback com `code` válido cria `GitHubAccount`+`Developer`, autentica e retorna JWT; falha antes do código pois o callback não existe
  - Arquivos previstos: `projects.service.ts`, `projects.repository.ts`

- [x] **Tarefa 5 — Testes e2e integrados (CA1 + CA2 + CA3)**
  - Cobre: CA1, CA2, CA3
  - Teste primeiro: não existe teste e2e de criação de Projeto
  - Arquivos previstos: `apps/api/test/projects.e2e-spec.ts`

## Critérios sem tarefa

-
