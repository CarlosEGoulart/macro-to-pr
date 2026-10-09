# 🏗️ Software Architecture Document (SDD)

**Projeto:** Macro2PR
**Versão:** 1.0.0
**Última atualização:** 2026-10-08

> 🤖 **Este documento é a régua estrutural do projeto.** Tudo que envolve *onde* as coisas moram (stack, pastas, camadas, contratos, padrões) está aqui. Regra de negócio *o que* faz fica no `docs/prd.md`. Detalhe de tela/fluxo fica no `docs/user-flows.md`. Spec de história nasce depois, uma por uma.

---

## 1. Stack Decidida

| Camada | Tecnologia | Versão Principal | Observação |
|--------|------------|------------------|------------|
| **Backend** | NestJS | **v12** (major) | ESM, TypeScript 6, Node.js 22 LTS |
| **Frontend** | React | **18+** (major) | Vite, TypeScript, React Router v6, TanStack Query |
| **ORM** | Prisma | **v7** (GA) | Prisma Client + Migrate |
| **Banco (dev)** | PostgreSQL | 16+ | Via Docker Compose |
| **Banco (prod)** | PostgreSQL | 16+ | Neon.tech (com connection pooling / PgBouncer) |
| **Runtime** | Node.js | **22 LTS** | Requerido por Nest v12 schematics (v22.22.3+) |
| **Package Manager** | pnpm | 9+ | Workspaces + lockfile único |
| **Build/Task Runner** | Turborepo | 2+ | Pipeline paralelo (lint, typecheck, test, build) |

> 🔒 **Stack fixa da disciplina:** NestJS + Prisma ORM + PostgreSQL (checklist.md). Frontend livre entre React/Angular/Vue — **React** escolhido.

---

## 2. Estrutura do Monorepo

```
monorepo/
├── apps/
│   ├── api/          # NestJS v12 (backend)
│   └── web/          # React 18+ (frontend)
├── packages/         # (futuro) shared libs, types, configs
├── turbo.json        # Turborepo pipeline
├── package.json      # root scripts + workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── docs/
    ├── prd.md
    ├── user-flows.md
    ├── design-tokens.md
    └── architecture.md   ← este arquivo
```

### 2.1 apps/api (NestJS v12)

```
apps/api/
├── src/
│   ├── main.ts                 # bootstrap + Swagger + global pipes/filters/interceptors
│   ├── app.module.ts
│   ├── common/
│   │   ├── pipes/              # ValidationPipe global (whitelist, transform)
│   │   ├── filters/            # AllExceptionsFilter, HttpExceptionFilter
│   │   ├── interceptors/       # ResponseInterceptor (padroniza {data, meta})
│   │   ├── guards/             # JwtAuthGuard, RolesGuard
│   │   └── decorators/         # @Roles, @CurrentUser
│   ├── config/
│   │   ├── configuration.ts    # ConfigModule.register({ validationSchema })
│   │   └── validation.schema.ts # Joi/Zod para .env
│   ├── modules/
│   │   ├── auth/               # JWT, Passport, JwtStrategy, Guards
│   │   ├── users/              # Developer, GitHubAccount
│   │   ├── projects/           # Project, Repository
│   │   ├── demands/            # Demand, TaskPlan, Task
│   │   ├── executions/         # ExecutionAttempt, ExecutionResult, Review
│   │   ├── credits/            # CreditPackage, CreditOrder, Payment, CreditBalance, CreditMovement
│   │   └── admin/              # Admin panel endpoints
│   └── prisma/
│       ├── prisma.service.ts   # PrismaService (onModuleInit/onModuleDestroy)
│       └── prisma.module.ts    # Global PrismaModule
├── prisma/
│   └── schema.prisma           # Source of truth do banco
├── test/                       # e2e specs (supertest + Vitest)
├── vitest.config.ts
├── vitest.config.e2e.ts
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
└── package.json
```

### 2.2 apps/web (React 18+)

```
apps/web/
├── src/
│   ├── main.tsx                # Entry point (React 18 createRoot)
│   ├── App.tsx                 # Providers + Router
│   ├── app/
│   │   ├── providers/          # QueryClientProvider, AuthProvider, ThemeProvider
│   │   ├── router/             # React Router v6 + lazy loading por feature
│   │   └── layout/             # Shell, Sidebar, Topbar
│   ├── features/               # Feature folders (colocation)
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── demands/
│   │   ├── executions/
│   │   ├── credits/
│   │   └── admin/
│   ├── shared/
│   │   ├── api/                # API client (fetch) + tipos derivados do OpenAPI
│   │   ├── components/         # UI primitives (Button, Card, Modal, Table, etc.)
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Helpers
│   │   └── types/              # Tipos espelhados do OpenAPI
│   └── styles/                 # CSS Modules / Tailwind / global CSS
├── vitest.config.ts
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
└── package.json
```

### 2.3 Configuração de Workspace

- **pnpm-workspace.yaml** — define `packages: ["apps/*", "packages/*"]`
- **turbo.json** — pipeline `build`, `lint`, `typecheck`, `test`, `test:e2e` em paralelo
- **tsconfig.base.json** — `references` para cada app/package; cada app estende o base
- **pnpm-workspace.yaml** na raiz

---

## 3. Glossário Técnico (PT → EN)

| Termo (PT) | Entidade (EN) | Atributos Principais |
|------------|---------------|---------------------|
| **Demanda** | `Demand` | `id`, `title`, `description`, `projectId`, `status` (Draft, AwaitingPlanApproval, AwaitingNewPlan, PlanApproved, InExecution, ReadyForPR, Concluded), `createdAt`, `updatedAt` |
| **Tarefa** | `Task` | `id`, `title`, `description`, `demandId`, `planId`, `status` (Pending, Eligible, Executing, AwaitingReview, AwaitingDecision, Approved, Rejected), `dependencies` (self ManyToMany), `order`, `createdAt`, `updatedAt` |
| **Tentativa de execução** | `ExecutionAttempt` | `id`, `taskId`, `status` (Executing, CompletedWithResult, Failed), `startedAt`, `finishedAt`, `resultId?`, `failureReason?`, `creditConsumed`, `creditRefunded` |
| **Crédito de execução** | `ExecutionCredit` | (unidade de medida — reflete em `CreditBalance` e `CreditMovement`) |
| **Saldo** | `CreditBalance` | `developerId`, `amount` (int), `updatedAt` |
| **Pedido de créditos** | `CreditOrder` | `id`, `developerId`, `packageId`, `creditsAmount`, `priceCents`, `status` (AwaitingPayment, Paid, NotPaid), `createdAt`, `paidAt?` |
| **Pagamento** | `Payment` | `id`, `creditOrderId`, `gateway` (MercadoPago\|Stripe), `gatewayPaymentId`, `amountCents`, `status` (AwaitingConfirmation, Confirmed, NotApproved), `payload` (JSON), `signatureVerified`, `createdAt`, `confirmedAt?` |
| **Projeto** | `Project` | `id`, `name`, `developerId`, `repositoryId`, `repositoryName`, `repositoryUrl`, `createdAt`, `updatedAt` |
| **Plano de tarefas** | `TaskPlan` | `id`, `demandId`, `status` (Generated, Approved, Rejected), `rejectionReason?`, `createdAt`, `approvedAt?`, `rejectedAt?` |
| **Revisão** | `Review` | `id`, `executionAttemptId`, `reviewerAgentId`, `status` (Pending, Completed), `verdict` (Approved\|Rejected), `reason?`, `feedback`, `createdAt`, `completedAt` |
| **Regeneração** | (ação) | Cria nova `ExecutionAttempt` |
| **Resultado de execução** | `ExecutionResult` | `id`, `executionAttemptId`, `diff` (JSON), `filesChanged`, `summary`, `createdAt` |
| **Repositório** | `Repository` | Dado externo GitHub — `id`, `name`, `fullName`, `url`, `owner`, `private` (referência no `Project`) |
| **Pull Request** | `PullRequest` | `id`, `demandId`, `githubPrNumber`, `githubPrUrl`, `status` (Open, Merged, Closed), `createdAt`, `mergedAt?` |
| **Conta GitHub** | `GitHubAccount` | `id`, `githubUserId`, `githubLogin`, `accessToken` (encrypted), `scopes`, `createdAt` |
| **Pacote de créditos** | `CreditPackage` | `id`, `name`, `creditsAmount`, `priceCents`, `active`, `sortOrder` |
| **Desenvolvedor** | `Developer` | `id`, `email`, `name`, `avatarUrl`, `githubAccountId`, `role` (Developer\|Admin), `createdAt` |
| **Admin da plataforma** | (role em `Developer`) | — |

### Relações 1:N do Escopo Mínimo (Ficha da Disciplina)

1. `Developer` 1 — N `Project`
2. `Developer` 1 — N `CreditOrder`
3. `Project` 1 — N `Demand`
4. `Demand` 1 — N `Task`
5. `TaskPlan` 1 — N `Task`
6. `Task` 1 — N `ExecutionAttempt`
7. `ExecutionAttempt` 1 — 1 `ExecutionResult` (opcional)
8. `ExecutionAttempt` 1 — 1 `Review` (opcional)
9. `CreditOrder` 1 — 1 `Payment`
10. `Developer` 1 — 1 `CreditBalance` (1:1)
11. `CreditBalance` 1 — N `CreditMovement`
12. `Developer` 1 — 1 `GitHubAccount`

---

## 4. Diagrama ER (Mermaid)

```mermaid
erDiagram
    Developer ||--o{ Project : owns
    Developer ||--o{ CreditOrder : places
    Developer ||--o| CreditBalance : has
    Developer ||--o| GitHubAccount : links
    Developer {
        uuid id PK
        string email UK
        string name
        string avatarUrl
        enum role "Developer|Admin"
        uuid githubAccountId FK
        datetime createdAt
    }

    GitHubAccount ||--o{ Project : provides
    GitHubAccount {
        uuid id PK
        string githubUserId UK
        string githubLogin
        string accessTokenEncrypted
        string scopes
        datetime createdAt
    }

    Project ||--o{ Demand : contains
    Project }|--|| GitHubAccount : references
    Project {
        uuid id PK
        string name
        uuid developerId FK
        string repositoryId
        string repositoryName
        string repositoryUrl
        datetime createdAt
        datetime updatedAt
    }

    Developer }o--o{ CreditOrder : places
    CreditOrder ||--|| CreditPackage : selects
    CreditOrder ||--|{ Payment : generates
    CreditOrder {
        uuid id PK
        uuid developerId FK
        uuid packageId FK
        int creditsAmount
        int priceCents
        enum status "AwaitingPayment|Paid|NotPaid"
        datetime createdAt
        datetime paidAt
    }

    CreditPackage {
        uuid id PK
        string name
        int creditsAmount
        int priceCents
        boolean active
        int sortOrder
    }

    CreditOrder ||--|| Payment : has
    Payment {
        uuid id PK
        uuid creditOrderId FK UK
        enum gateway "MercadoPago|Stripe"
        string gatewayPaymentId
        int amountCents
        enum status "AwaitingConfirmation|Confirmed|NotApproved"
        json payload
        boolean signatureVerified
        datetime createdAt
        datetime confirmedAt
    }

    Developer ||--|| CreditBalance : has
    CreditBalance ||--o{ CreditMovement : records
    CreditBalance {
        uuid developerId PK FK
        int amount
        datetime updatedAt
    }

    CreditMovement {
        uuid id PK
        uuid developerId FK
        enum type "Credit|Debit"
        int amount
        int balanceAfter
        enum source "CreditOrder|ExecutionAttempt|Refund"
        uuid sourceId
        datetime createdAt
    }

    Project ||--o{ Demand : has
    Demand ||--|| TaskPlan : generates
    Demand {
        uuid id PK
        string title
        text description
        uuid projectId FK
        enum status "Draft|AwaitingPlanApproval|AwaitingNewPlan|PlanApproved|InExecution|ReadyForPR|Concluded"
        datetime createdAt
        datetime updatedAt
    }

    Demand ||--|| TaskPlan : has
    TaskPlan ||--o{ Task : contains
    TaskPlan {
        uuid id PK
        uuid demandId FK UK
        enum status "Generated|Approved|Rejected"
        text rejectionReason
        datetime createdAt
        datetime approvedAt
        datetime rejectedAt
    }

    TaskPlan ||--o{ Task : contains
    Task }o--o{ Task : dependsOn
    Task ||--o{ ExecutionAttempt : executes
    Task {
        uuid id PK
        string title
        text description
        uuid demandId FK
        uuid planId FK
        enum status "Pending|Eligible|Executing|AwaitingReview|AwaitingDecision|Approved|Rejected"
        int order
        datetime createdAt
        datetime updatedAt
    }

    Task }o--o{ Task : dependsOn
    TaskDependency {
        uuid taskId FK
        uuid dependsOnTaskId FK
    }

    Task ||--o{ ExecutionAttempt : has
    ExecutionAttempt ||--|| ExecutionResult : produces
    ExecutionAttempt ||--|| Review : receives
    ExecutionAttempt {
        uuid id PK
        uuid taskId FK
        enum status "Executing|CompletedWithResult|Failed"
        datetime startedAt
        datetime finishedAt
        uuid resultId FK
        text failureReason
        boolean creditConsumed
        boolean creditRefunded
    }

    ExecutionResult {
        uuid id PK
        uuid executionAttemptId FK UK
        json diff
        string[] filesChanged
        text summary
        datetime createdAt
    }

    ExecutionAttempt ||--|| Review : receives
    Review {
        uuid id PK
        uuid executionAttemptId FK UK
        string reviewerAgentId
        enum status "Pending|Completed"
        enum verdict "Approved|Rejected"
        text reason
        text feedback
        datetime createdAt
        datetime completedAt
    }

    Task ||--o{ PullRequest : generates
    Demand ||--|| PullRequest : finalizes
    PullRequest {
        uuid id PK
        uuid demandId FK UK
        int githubPrNumber
        string githubPrUrl
        enum status "Open|Merged|Closed"
        datetime createdAt
        datetime mergedAt
    }

    Developer }|--o{ AdminAction : performs
    AdminAction {
        uuid id PK
        uuid adminId FK
        enum action
        json details
        datetime createdAt
    }
```

---

## 5. Padrões Estruturais Cobrados pelos IDs

| ID | Exigência | Padrão Declarado |
|----|-----------|------------------|
| **ID6** | Separação estrita de camadas (Controllers, Services, Modules) | **Arquitetura modular por feature**: cada domínio (`auth`, `users`, `projects`, `demands`, `executions`, `credits`, `admin`) é um `Module` NestJS com `Controller` → `Service` → `Repository` (Prisma). `Controller` só recebe request/response → delega para `Service` → `Service` usa `PrismaService` via repositórios tipados. Nenhum `Controller` acessa Prisma diretamente. |
| **ID7** | DTOs + ValidationPipe (whitelist) | **ValidationPipe global** em `main.ts`: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, `transformOptions: { enableImplicitConversion: true }`. Todos inputs de `Controller` usam **DTO classes** com `class-validator` (`@IsString`, `@IsUUID`, `@IsEnum`, `@IsInt`, `@Min`, `@Max`, `@IsOptional`, `@ValidateNested`). `ValidationPipe` aplicado globalmente em `main.ts`. |
| **ID8** | CRUD relacional com Prisma ORM | **PrismaService** como provider global (`PrismaModule` global). `PrismaService` extende `PrismaClient` com `onModuleInit`/`onModuleDestroy`. **Repositórios** encapsulam queries Prisma (ex.: `ProjectRepository`, `DemandRepository`) — `Service` usa repositórios, não Prisma direto. Transações atômicas com `prisma.$transaction([])` (ex.: criar `CreditOrder` + `Payment` + `CreditMovement`). |
| **ID9** | JWT + Roles/Guards | **JWT Strategy** (`PassportStrategy` + `passport-jwt`) validando `accessToken` do header `Authorization: Bearer`. **JwtAuthGuard** global via `app.useGlobalGuards`. **RolesGuard** + `@Roles(...)` decorator + `Reflector` para RBAC (`Developer` \| `Admin`). `GitHubAccount` linkado ao `Developer` para auth externa OAuth. |
| **ID10** | Interceptors (resposta) + Exception Filters globais (erro) | **ResponseInterceptor** (implementa `NestInterceptor`) padroniza resposta: `{ data, meta?, timestamp, path }`. **AllExceptionsFilter** (implementa `ExceptionFilter`) captura todas as exceções, loga, retorna formato padrão: `{ statusCode, error, message, timestamp, path }`. `HttpExceptionFilter` para `HttpException`. Registrados globalmente em `main.ts` (`app.useGlobalInterceptors`, `app.useGlobalFilters`). |
| **ID14** | Swagger/OpenAPI interativo | **SwaggerModule** configurado em `main.ts` com `DocumentBuilder`. Endpoints vivos: `GET /api/docs` (Swagger UI) e `GET /api/docs-json` (OpenAPI 3.1 JSON). **`swagger.json` NÃO é commitado** — fonte de verdade é o endpoint vivo. DTOs decorados com `@ApiProperty`/`@ApiPropertyOptional`. Frontend deriva tipos via `openapi-typescript` ou `orval` no build. |
| **ID17** | Secrets via ConfigModule + env | **ConfigModule** global (`isGlobal: true`) com `validationSchema` (Joi). `ConfigService` tipado via `config.schema.ts`. Secrets: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MERCADO_PAGO_ACCESS_TOKEN` / `STRIPE_SECRET_KEY`, `WEBHOOK_SECRET`. **Nenhum secret no repo** — `.env` no `.gitignore`, injetados na nuvem (Vercel/Neon/GitHub Actions secrets). |
| **ID18** | GitHub Actions CI | Workflow `.github/workflows/ci.yml`: `on: [push, pull_request]` → `jobs: lint, typecheck, test, test:e2e` (paralelos via Turbo). `pnpm install --frozen-lockfile` → `pnpm lint`, `pnpm typecheck`, `pnpm test:cov`, `pnpm test:e2e`. Coverage threshold mínimo (ex.: 80%). Falha bloqueia merge. |
| **ID19** | Deploy público + banco nuvem + pooling | **Deploy**: Vercel (frontend) + Railway/Render/Fly.io (backend) ou tudo no Vercel. **Banco**: Neon.tech (PostgreSQL) com **Prisma Connection Pooling** (PgBouncer via `?pgbouncer=true` na `DATABASE_URL` ou Prisma Accelerate). `DATABASE_URL` injetada via env da plataforma. Health check `/health` para readiness. |
| **ID20** | Payment gateway sandbox + webhook | **Gateway**: Mercado Pago **ou** Stripe (escolha do aluno). `PaymentService` cria `Preference` (MP) / `PaymentIntent` (Stripe) → retorna URL/token pro frontend. **Webhook endpoint** (`/webhooks/payment`) valida assinatura (`WEBHOOK_SECRET`), atualiza `Payment` + `CreditOrder` + `CreditBalance` + `CreditMovement` em transação atômica. Idempotência por `gatewayPaymentId` único. |
| **ID21** | Webhook assíncrono + verificação de assinatura | **Signature verification** obrigatória no webhook (HMAC SHA256 para Stripe / `x-signature` para Mercado Pago). Payload validado contra `Payment` existente. Idempotência: `gatewayPaymentId` único + check de `signatureVerified`. Falha de assinatura → 400, não processa. Log de auditoria em `AdminAction`. |

---

## 6. Contrato da API (Swagger/OpenAPI)

> **O contrato da API é a documentação viva** gerada do código via **SwaggerModule** (`@nestjs/swagger`).  
> - Endpoints vivos: `GET /api/docs` (Swagger UI) e `GET /api/docs-json` (OpenAPI 3.1 JSON).  
> - **Não existe tabela de endpoints manual no `architecture.md`** (apodrece).  
> - **`swagger.json` NÃO é commitado** — cópia no repo desatualiza; a fonte é o endpoint vivo da API rodando.  
> - Frontend deriva tipos/client a partir do endpoint vivo (ex.: `openapi-typescript` ou `orval` no build do frontend).  
> - DTOs decorados com `@ApiProperty`/`@ApiPropertyOptional` para documentação automática.

---

## 7. Testes — Stack e Comandos

| Camada | Ferramenta | Configuração | Comandos |
|--------|------------|--------------|----------|
| **Unit/Integration (API)** | Vitest + `@nestjs/testing` + `supertest` (E2E) | Vitest + `unplugin-swc` + `@vitest/coverage-v8` | `test`, `test:watch`, `test:cov`, `test:e2e` |
| **Unit/Integration (Web)** | Vitest + React Testing Library + `@testing-library/user-event` | Vitest + `jsdom` + `@testing-library/jest-dom` | `test`, `test:watch`, `test:cov` |
| **Lint** | ESLint (flat config) + Prettier | `eslint.config.js` + `prettier.config.js` | `lint`, `lint:fix` |
| **Type-check** | TypeScript | `tsc --noEmit` | `typecheck` |

**Scripts por app:**

```json
// apps/api/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "test:e2e": "vitest run --config vitest.config.e2e.ts",
    "lint": "eslint . --ext .ts",
    "lint:fix": "eslint . --ext .ts --fix",
    "typecheck": "tsc --noEmit"
  }
}

// apps/web/package.json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:cov": "vitest run --coverage",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "typecheck": "tsc --noEmit"
  }
}
```

**Dependências de dev (API):**
```
vitest unplugin-swc @swc/core @vitest/coverage-v8 supertest @types/supertest @nestjs/testing
```

**Dependências de dev (Web):**
```
vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @types/jsdom
```

**Shared (raiz):**
```
eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier turbo
```

---

## 8. Configuração de Ambiente (.env)

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/macro2pr?schema=public"
# ou com pooling (produção Neon):
# DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-1.aws.neon.tech/macro2pr?pgbouncer=true"

# Auth
JWT_SECRET="super-secret-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
GITHUB_CALLBACK_URL="http://localhost:3000/api/auth/github/callback"

# Payment Gateway (escolher um)
# Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-xxx"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-xxx"
MERCADO_PAGO_WEBHOOK_SECRET="whsec_xxx"
# OU Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Webhook
WEBHOOK_SECRET="your-webhook-secret-for-signature-verification"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

> ⚠️ **Nenhum destes valores entra no repositório.** `.env` está no `.gitignore`. Em produção, injetados via secrets da plataforma (Vercel, Railway, GitHub Actions).

---

## 9. CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:cov
  test-e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env: { POSTGRES_USER: test, POSTGRES_PASSWORD: test, POSTGRES_DB: macro2pr_test }
        ports: [5432:5432]
        options: --health-cmd="pg_isready" --health-interval=10s --health-timeout=5s --health-retries=5
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma migrate deploy
      - run: pnpm test:e2e
```

- **Coverage threshold**: 80% (lines, functions, branches)
- **Falha em qualquer job bloqueia merge**

---

## 10. Deploy e Produção

| Componente | Plataforma | Detalhes |
|------------|------------|----------|
| **Frontend** | Vercel | `apps/web` → `vercel.json` com `buildCommand: pnpm build`, `outputDirectory: dist` |
| **Backend** | Railway / Render / Fly.io | Dockerfile multi-stage (builder → runner), `pnpm build`, `pnpm start:prod` |
| **Banco** | Neon.tech | PostgreSQL 16+, connection pooling (PgBouncer) via `?pgbouncer=true` ou Prisma Accelerate |
| **Secrets** | Platform secrets | `DATABASE_URL`, `JWT_SECRET`, `GITHUB_*`, `MERCADO_PAGO_*` / `STRIPE_*`, `WEBHOOK_SECRET` |
| **Health Check** | `GET /health` | Retorna `{ status: "ok", timestamp, uptime }` — usado por load balancer |

---

## 11. Decisões de Arquitetura Registradas

| Tópico | Decisão |
|--------|---------|
| **Monorepo** | pnpm workspaces + Turborepo |
| **API Style** | REST (OpenAPI 3.1), JSON, UTF-8 |
| **Auth** | JWT (access + refresh), GitHub OAuth para onboarding |
| **RBAC** | `Developer` \| `Admin` via `RolesGuard` + `@Roles()` |
| **Validação** | `class-validator` + `ValidationPipe` global (whitelist) |
| **Erro Global** | `AllExceptionsFilter` + `ResponseInterceptor` |
| **Docs API** | Swagger vivo (`/api/docs`), OpenAPI JSON (`/api/docs-json`) |
| **DB Migrations** | `prisma migrate deploy` no CI/CD |
| **Secrets** | ConfigModule + Joi validation, zero secrets no repo |
| **CI** | GitHub Actions + Turbo pipeline paralelo |
| **Deploy** | Vercel (web) + Railway (api) + Neon (db) |

---

## 12. Próximos Passos

1. **Commit** deste `docs/architecture.md` pelo aluno (autor da decisão).
2. Rodar `/utf-setup` para gerar o monorepo com esta arquitetura.
3. `/utf-architecture` **não gera código** — apenas documenta as decisões que o setup e os implementadores vão seguir.

---

> ✍️ **Documento pronto para commit.**  
> Antes de commitar, rode `/utf-tutor architecture` se quiser entender monorepo, camadas, ORM e o diagrama ER em cima das *suas* escolhas, não em exemplo genérico.  
> Próximo passo oficial: `/utf-setup`.