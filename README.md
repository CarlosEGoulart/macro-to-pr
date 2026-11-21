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
- npm (workspaces)
- Turborepo (pipeline paralelo: lint, typecheck, test, build)

**Testes & Qualidade**
- Vitest (unit/integration + coverage)
- React Testing Library / supertest (E2E)
- ESLint (flat config) + Prettier
- TypeScript type-check

**CI/CD**
- GitHub Actions (pipeline paralelo via Turborepo)
- npm workspaces

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

Siga estes passos num computador que nunca viu o projeto:

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo

# 2. Instale as dependências (monorepo com npm workspaces)
npm install

# 3. Suba o banco de dados (PostgreSQL via Docker Compose, porta 5432)
docker compose up -d

# 4. Crie o arquivo de variáveis de ambiente da API a partir do exemplo
cp apps/api/.env.example apps/api/.env
# (ajuste o DATABASE_URL se usar outro banco/credenciais)

# 5. Aplique as migrações no banco e gere o cliente Prisma
cd apps/api
npx prisma migrate deploy
npx prisma generate

# 6. Inicie a API (modo desenvolvimento, reinicia ao salvar)
cd ../..
npm run start -w apps/api
# A API fica disponível em http://localhost:3000
# Swagger: http://localhost:3000/docs
```

Em outro terminal, rode os testes e o lint:

```bash
npm run test -w apps/api
npm run test:e2e -w apps/api
npm run lint -w apps/api
```

> ✅ Deu certo quando: a página `http://localhost:3000/docs` abre com as rotas das histórias, uma chamada de login devolve um token, e os testes e o lint passam, sem instruções que não estejam neste README.
