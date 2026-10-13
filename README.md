# Macro2PR

Plataforma que ajuda desenvolvedores a transformar demandas de alto nível em tarefas menores, executá-las com revisão independente e gerar um Pull Request após aprovação humana.

## Autor

Carlos Eduardo Goulart — @CarlosEGoulart

## Documentação

- [docs/prd.md](docs/prd.md) — requisitos e regras de negócio
- [docs/user-flows.md](docs/user-flows.md) — jornadas de usuário
- [docs/design-tokens.md](docs/design-tokens.md) — identidade visual e tokens de design
- [docs/architecture.md](docs/architecture.md) — arquitetura, modelo de dados e decisões técnicas
- [docs/checklist.md](docs/checklist.md) — acompanhamento dos indicadores da disciplina
- [Protótipo no Figma](https://www.figma.com/proto/edq6lzgx0DPXApm2WZLpxT/Macro2PR?node-id=2-8503&t=gXpPr2kY26pjqXQF-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=2%3A8503) — telas das principais jornadas

## Stack

**Backend**
- NestJS
- Node.js

**Frontend**
- React (Vite, TypeScript)
- React Router
- TanStack Query

**ORM & Banco de Dados**
- Prisma ORM (Client + Migrate)
- PostgreSQL (desenvolvimento via Docker; produção no Neon.tech com PgBouncer)

**Ferramentas & Ecossistema**
- pnpm (workspaces)
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

**Pagamento**
- Mercado Pago (sandbox + webhook assíncrono com verificação de assinatura)

## Em produção

O deploy público será entregue na Entrega 3 — até lá, a aplicação não está disponível online.

## Quick Start

O Quick Start (clonagem, instalação, banco e execução local) será preenchido junto com o scaffold da aplicação, na Entrega 2.
