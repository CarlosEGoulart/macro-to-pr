# Macro2PR

Plataforma que ajuda desenvolvedores a transformar demandas de alto nível em tarefas menores, executá-las com revisão independente e gerar um Pull Request após aprovação humana.

## Autor

Carlos Eduardo Goulart — @CarlosEGoulart

## Documentação

- [docs/prd.md](docs/prd.md) — requisitos e regras de negócio
- [docs/user-flows.md](docs/user-flows.md) — jornadas de usuário
- [docs/design-tokens.md](docs/design-tokens.md) — identidade visual e tokens de design
- [docs/checklist.md](docs/checklist.md) — acompanhamento dos indicadores da disciplina

## Stack

**Backend**
- NestJS v12
- Node.js 22 LTS

**Frontend**
- React 18+ (Vite, TypeScript)
- React Router v6
- TanStack Query

**ORM & Banco de Dados**
- Prisma ORM v7 (GA) — Client + Migrate
- PostgreSQL 16+ (desenvolvimento via Docker; produção no Neon.tech com PgBouncer)

**Ferramentas & Ecossistema**
- Node.js 22 LTS
- pnpm 9+ (workspaces)
- Turborepo (pipeline paralelo: lint, typecheck, test, build)

**Testes & Qualidade**
- Vitest (unit/integration + coverage)
- React Testing Library / supertest (E2E)
- ESLint (flat config) + Prettier
- TypeScript type-check

**CI/CD**
- GitHub Actions (pipeline paralelo via Turborepo)
- pnpm workspaces

**Deploy**
- Frontend: Vercel
- Backend: Railway (definido) — Render / Fly.io como alternativas
- Banco: Neon.tech (PostgreSQL com PgBouncer)

**Autenticação & Segurança**
- JWT (access + refresh) + GitHub OAuth
- Passport JWT Strategy + RolesGuard (@Roles)
- class-validator + ValidationPipe global (whitelist)
- RBAC: Developer | Admin

**Documentação da API**
- Swagger/OpenAPI via @nestjs/swagger
- OpenAPI 3.1 JSON em `/api/docs-json` + Swagger UI em `/api/docs`

**Pagamento (gateway a definir)**
- Mercado Pago **ou** Stripe (sandbox + webhook assíncrono com verificação de assinatura)

## Em produção

Ainda não disponível.

## Quick Start

Será preenchido após a criação do scaffold da aplicação.
