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
| **Tarefa** | `Task` | `id`, `title`, `description`, `demandId`, `planId`, `status` (Pending, Eligible, Executing, AwaitingReview, AwaitingDecision, Approved, Rejected), `order`, `createdAt`, `updatedAt` — dependências entre Tarefas são registradas na entidade `TaskDependency`, não como atributo desta tabela |
| **Tentativa de execução** | `ExecutionAttempt` | `id`, `taskId`, `status` (Executing, CompletedWithResult, Failed), `startedAt`, `finishedAt`, `failureReason?`, `creditConsumed`, `creditRefunded` — a referência ao resultado vive em `ExecutionResult.executionAttemptId` (FK única, sem FK circular) |
| **Crédito de execução** | `ExecutionCredit` | (unidade de medida — reflete em `CreditBalance` e `CreditMovement`) |
| **Saldo** | `CreditBalance` | `developerId` (**PK e FK** → `Developer.id` — a unicidade dessa chave materializa o 1:1 com o Desenvolvedor; no diagrama Mermaid o atributo aparece só como `PK`, porque a sintaxe não aceita `PK FK` no mesmo atributo — a FK é expressa pela relação `Developer \|\|--\|\| CreditBalance`), `amount` (int), `updatedAt` — agregado derivado das `CreditMovement` do Desenvolvedor |
| **Pedido de créditos** | `CreditOrder` | `id`, `developerId`, `packageId`, `creditsAmount`, `priceCents`, `status` (AwaitingPayment, Paid, NotPaid), `createdAt`, `paidAt?` |
| **Pagamento** | `Payment` | `id`, `creditOrderId` (UK e FK → `CreditOrder` — no máximo um Pagamento por Pedido), `gateway` (MercadoPago), `gatewayPaymentId` (UK — idempotência da confirmação, RN07), `amountCents`, `status` (AwaitingConfirmation, Confirmed, NotApproved), `payload` (JSON), `signatureVerified`, `createdAt`, `confirmedAt?` |
| **Projeto** | `Project` | `id`, `name`, `developerId`, `repositoryId` (FK → `Repository`), `createdAt`, `updatedAt` |
| **Plano de tarefas** | `TaskPlan` | `id`, `demandId` (FK — **sem** unicidade: uma Demanda acumula planos rejeitados e gera novos, RN03), `status` (Generated, Approved, Rejected), `rejectionReason?`, `createdAt`, `approvedAt?`, `rejectedAt?` |
| **Revisão** | `Review` | `id`, `executionAttemptId` (UK e FK → `ExecutionAttempt`), `reviewerAgentId`, `status` (Pending, Completed), `verdict` (Approved\|Rejected — **parecer do agente revisor**, não é a decisão do Desenvolvedor), `reason?`, `feedback`, `createdAt`, `completedAt` |
| **Aprovação de resultado** | `ExecutionResult.decision` | Não é entidade: é a **decisão do Desenvolvedor** sobre o resultado, registrada em `decision?` (Approved\|Rejected), `decisionReason` (obrigatório ao rejeitar — RN05) e `decidedAt`. Antes da decisão, os três campos ficam ausentes — o Resultado já existe (fim da Tentativa) e aguarda o Desenvolvedor (US07/US08). Confundir com `Review.verdict` violaria o glossário do PRD (revisão = análise; aprovação = decisão) |
| **Regeneração** | (ação) | Cria nova `ExecutionAttempt` |
| **Resultado de execução** | `ExecutionResult` | `id`, `executionAttemptId` (UK e FK → `ExecutionAttempt` — no máximo um Resultado por Tentativa), `diff` (JSON), `filesChanged`, `summary`, `decision?` (Approved\|Rejected — decisão do Desenvolvedor; **ausente** enquanto a decisão não foi tomada — o Resultado existe desde o fim da Tentativa, antes da aprovação/rejeição da US08), `decisionReason?` (obrigatório quando `decision = Rejected` — RN05; **ausente** enquanto não há decisão), `decidedAt?` (**ausente** até a decisão), `createdAt` |
| **Repositório** | `Repository` | Entidade real — repositórios **disponibilizados pela conta GitHub autorizada** (RN08): `id`, `githubAccountId` (FK), `name`, `fullName`, `url`, `owner`, `private`. `Project.repositoryId` referencia esta entidade |
| **Pull Request** | `PullRequest` | `id`, `demandId` (UK e FK → `Demand` — no máximo um PR final por Demanda, RN06), `githubPrNumber`, `githubPrUrl`, `status` (Open, Merged, Closed), `createdAt`, `mergedAt?` |
| **Conta GitHub** | `GitHubAccount` | `id`, `githubUserId`, `githubLogin`, `accessToken` (encrypted), `scopes`, `createdAt` |
| **Pacote de créditos** | `CreditPackage` | `id`, `name`, `creditsAmount`, `priceCents`, `active`, `sortOrder` |
| **Desenvolvedor** | `Developer` | `id`, `email`, `name`, `avatarUrl`, `githubAccountId` (FK → `GitHubAccount`), `role` (Developer\|Admin), `createdAt` |
| **Admin da plataforma** | (role em `Developer`) | — |
| **Movimentação de créditos** | `CreditMovement` | `id`, `developerId` (FK → `Developer`), `type` (Credit\|Debit), `amount`, `balanceAfter`, `source` (CreditOrder\|ExecutionAttempt\|Refund), `sourceId`, `createdAt` — implementa a rastreabilidade da RN04/NFR02 e o histórico exigido pela US13 |
| **Dependência de tarefa** | `TaskDependency` | `taskId` + `dependsOnTaskId` (PK composto, ambas FK → `Task`) — tabela de junção que materializa a relação N:N de dependência entre Tarefas prevista na US04/US06 |
| **Ação de administração** | `AdminAction` | `id`, `adminId` (FK → `Developer`), `action`, `details` (JSON), `createdAt` — trilha de auditoria das ações de suporte do Admin (US14) |

### Relações do modelo (escopo mínimo da ficha + derivadas do PRD)

As linhas 1–6 são o **escopo mínimo da disciplina** (2+ entidades em 1:N e fluxo de pagamento). Todas as demais derivam de regras do PRD e estão exatamente como no diagrama da seção 4.

1. `Developer` 1 — N `Project`
2. `Developer` 1 — N `CreditOrder`
3. `Project` 1 — N `Demand`
4. `Demand` 1 — N `Task`
5. `TaskPlan` 1 — N `Task`
6. `Task` 1 — N `ExecutionAttempt`
7. `ExecutionAttempt` 1 — 0..1 `ExecutionResult` (tentativa falha não produz resultado — US06)
8. `ExecutionAttempt` 1 — 0..1 `Review` (sem resultado não há revisão — US07)
9. `CreditOrder` 1 — 0..1 `Payment` (o PRD não exige transação para um Pedido abandonado antes do gateway; no máximo um Pagamento por Pedido)
10. `Developer` 1 — 1 `CreditBalance` (unicidade materializada por `developerId`, PK e FK → `Developer.id`)
11. `Developer` 1 — N `CreditMovement` (o FK é `developerId` → `Developer`; o Saldo é o agregado derivado dessas movimentações)
12. `Developer` 1 — 1 `GitHubAccount` (FK `Developer.githubAccountId` → `GitHubAccount.id`; `GitHubAccount` não tem FK de volta — sem circularidade)
13. `GitHubAccount` 1 — N `Repository` (repositórios disponíveis para a conta autorizada — RN08)
14. `Project` N — 1 `Repository`, com **no máximo 1 Projeto por Repositório da conta** (RN01)
15. `Demand` 1 — N `TaskPlan` (histórico de planos rejeitados e regenerados — RN03)
16. `Demand` 1 — 0..1 `PullRequest` (no máximo um PR final por Demanda — RN06)
17. `Task` 1 — N `TaskDependency` (nos dois papéis: dono da dependência e dependência)
18. `CreditOrder` N — 1 `CreditPackage`
19. `Developer` 1 — N `AdminAction`

---

## 4. Diagrama ER (Mermaid)

```mermaid
erDiagram
    Developer ||--o{ Project : owns
    Developer ||--o{ CreditOrder : places
    Developer ||--|| CreditBalance : has
    Developer ||--|| GitHubAccount : links
    Developer ||--o{ CreditMovement : records
    Developer ||--o{ AdminAction : performs
    Developer {
        uuid id PK
        string email UK
        string name
        string avatarUrl
        enum role "Developer|Admin"
        uuid githubAccountId FK
        datetime createdAt
    }

    GitHubAccount ||--o{ Repository : provides
    GitHubAccount {
        uuid id PK
        string githubUserId UK
        string githubLogin
        string accessTokenEncrypted
        string scopes
        datetime createdAt
    }

    Project |o--|| Repository : references
    Repository {
        uuid id PK
        uuid githubAccountId FK
        string name
        string fullName
        string url
        string owner
        boolean private
    }

    Project ||--o{ Demand : contains
    Project {
        uuid id PK
        string name
        uuid developerId FK
        uuid repositoryId FK
        datetime createdAt
        datetime updatedAt
    }

    CreditOrder }o--|| CreditPackage : selects
    CreditOrder ||--o| Payment : generates
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

    Payment {
        uuid id PK
        uuid creditOrderId UK
        enum gateway "MercadoPago"
        string gatewayPaymentId UK
        int amountCents
        enum status "AwaitingConfirmation|Confirmed|NotApproved"
        json payload
        boolean signatureVerified
        datetime createdAt
        datetime confirmedAt
    }

    CreditBalance {
        uuid developerId PK
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

    Demand ||--o{ TaskPlan : generates
    Demand ||--o{ Task : comprises
    Demand ||--o| PullRequest : finalizes
    Demand {
        uuid id PK
        string title
        text description
        uuid projectId FK
        enum status "Draft|AwaitingPlanApproval|AwaitingNewPlan|PlanApproved|InExecution|ReadyForPR|Concluded"
        datetime createdAt
        datetime updatedAt
    }

    TaskPlan ||--o{ Task : contains
    TaskPlan {
        uuid id PK
        uuid demandId FK
        enum status "Generated|Approved|Rejected"
        text rejectionReason
        datetime createdAt
        datetime approvedAt
        datetime rejectedAt
    }

    Task ||--o{ TaskDependency : owns
    Task ||--o{ TaskDependency : dependsOn
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

    TaskDependency {
        uuid taskId PK
        uuid dependsOnTaskId PK
    }

    ExecutionAttempt ||--o| ExecutionResult : produces
    ExecutionAttempt ||--o| Review : receives
    ExecutionAttempt {
        uuid id PK
        uuid taskId FK
        enum status "Executing|CompletedWithResult|Failed"
        datetime startedAt
        datetime finishedAt
        text failureReason
        boolean creditConsumed
        boolean creditRefunded
    }

    ExecutionResult {
        uuid id PK
        uuid executionAttemptId UK
        json diff
        string[] filesChanged
        text summary
        enum? decision "Approved|Rejected — ausente ate a decisao do Desenvolvedor"
        text? decisionReason "obrigatorio quando decision = Rejected (RN05)"
        datetime? decidedAt "ausente ate a decisao"
        datetime createdAt
    }

    Review {
        uuid id PK
        uuid executionAttemptId UK
        string reviewerAgentId
        enum status "Pending|Completed"
        enum verdict "Approved|Rejected"
        text reason
        text feedback
        datetime createdAt
        datetime completedAt
    }

    PullRequest {
        uuid id PK
        uuid demandId UK
        int githubPrNumber
        string githubPrUrl
        enum status "Open|Merged|Closed"
        datetime createdAt
        datetime mergedAt
    }

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
| **ID17** | Secrets via ConfigModule + env | **ConfigModule** global (`isGlobal: true`) com `validationSchema` (Joi). `ConfigService` tipado via `config.schema.ts`. Secrets: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `MERCADO_PAGO_ACCESS_TOKEN`, `MERCADO_PAGO_PUBLIC_KEY`, `MERCADO_PAGO_WEBHOOK_SECRET`. **Nenhum secret no repo** — `.env` nunca é versionado (o `.gitignore` será criado na Entrega 2), injetados na nuvem (Vercel/Neon/GitHub Actions secrets). |
| **ID18** | GitHub Actions CI | Workflow `.github/workflows/ci.yml`: `on: [push, pull_request]` → `jobs: lint, typecheck, test, test:e2e` (paralelos via Turbo). `pnpm install --frozen-lockfile` → `pnpm lint`, `pnpm typecheck`, `pnpm test:cov`, `pnpm test:e2e`. Coverage threshold mínimo (ex.: 80%). Falha bloqueia merge. |
| **ID19** | Deploy público + banco nuvem + pooling | **Deploy**: Vercel (frontend) + Railway/Render/Fly.io (backend) ou tudo no Vercel. **Banco**: Neon.tech (PostgreSQL) com **Prisma Connection Pooling** (PgBouncer via `?pgbouncer=true` na `DATABASE_URL` ou Prisma Accelerate). `DATABASE_URL` injetada via env da plataforma. Health check `/health` para readiness. |
| **ID20** | Payment gateway sandbox + webhook | **Gateway escolhido: Mercado Pago** (decisão do estudante). `PaymentService` cria a ordem/preferência de pagamento via API do Mercado Pago → retorna os dados necessários para o frontend iniciar o checkout. **Webhook endpoint** (`/webhooks/payment`) valida assinatura (`MERCADO_PAGO_WEBHOOK_SECRET`), atualiza `Payment` + `CreditOrder` + `CreditBalance` + `CreditMovement` em transação atômica. Idempotência por `gatewayPaymentId` único. |
| **ID21** | Webhook assíncrono + verificação de assinatura | **Signature verification** obrigatória no webhook do Mercado Pago, validando a assinatura `x-signature` conforme a documentação oficial. Payload validado contra `Payment` existente. Idempotência: `gatewayPaymentId` único + check de `signatureVerified`. Falha de assinatura → 400, não processa. Log de auditoria em `AdminAction`. |

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

# Payment Gateway: Mercado Pago
MERCADO_PAGO_ACCESS_TOKEN="<seu-token-de-teste>"
MERCADO_PAGO_PUBLIC_KEY="<sua-chave-publica-de-teste>"
MERCADO_PAGO_WEBHOOK_SECRET="<segredo-configurado-no-painel-do-mercado-pago>"

# App
PORT=3000
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
```

> ⚠️ **Nenhum destes valores entra no repositório.** O `.env` é um arquivo local e não deve ser commitado; este repositório ainda **não possui `.gitignore`** — ele será criado junto com o scaffold da Entrega 2 (não faz parte da Entrega 1). Em produção, os valores são injetados via secrets da plataforma (Vercel, Railway, GitHub Actions).

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
| **Secrets** | Platform secrets | `DATABASE_URL`, `JWT_SECRET`, `GITHUB_*`, `MERCADO_PAGO_*` e segredo de assinatura do webhook |
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
| **Lint (scaffold)** | oxlint (gerador oficial NestJS v12 / Vite) — divergencia da declaracao de ESLint na secao 7, a ser ratificada |
| **Test runner (scaffold)** | Vitest 4 nos dois apps; web requer vitest.config.ts + setupTests.ts + dep. de teste (@testing-library/*, jsdom) instaladas manualmente (create-vite nao inclui por padrão), a ser ratificada |

---

## 12. Próximos Passos

1. **Commit** deste `docs/architecture.md` pelo aluno (autor da decisão).
2. Rodar `/utf-setup` para gerar o monorepo com esta arquitetura.
3. `/utf-architecture` **não gera código** — apenas documenta as decisões que o setup e os implementadores vão seguir.

---

> ✍️ **Documento pronto para commit.**  
> Antes de commitar, rode `/utf-tutor architecture` se quiser entender monorepo, camadas, ORM e o diagrama ER em cima das *suas* escolhas, não em exemplo genérico.  
> Próximo passo oficial: `/utf-setup`.