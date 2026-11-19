# Parecer de Código — Tarefa 8 (Rodada 2)

## Veredito final: PENDENTE COM APONTAMENTOS

## Apontamentos (bloqueiam)

### Apontamento A — Job `typecheck` referencia script inexistente

**Evidência:** `.github/workflows/ci.yml`, linha 30: `- run: npm run typecheck -w apps/api`. `apps/api/package.json`, linhas 9–23: scripts declarados são `build, deploy, format, start, start:dev, start:debug, start:prod, lint, test, test:watch, test:cov, test:debug, test:e2e`. **Não existe script `typecheck`.**

**Padrão violado:** `docs/architecture.md`, Seção 7 (tabela de comandos e bloco `apps/api/package.json`): declara `"typecheck": "tsc --noEmit"` como script do app. `docs/architecture.md`, Seção 5, ID18: o workflow deve conter o job `typecheck` executando `npm run typecheck`.

**Consequência:** o job `typecheck` falharia no CI porque o script não existe.

### Apontamento B — Divergência de credenciais/banco Postgres entre specs de e2e e serviço do CI

**Evidência:** `apps/api/test/auth-guard.e2e-spec.ts`, linhas 9–10: `process.env.DATABASE_URL = 'postgresql://app:app@localhost:5432/appdb?schema=public'`. `apps/api/test/roles.e2e-spec.ts`, linhas 11–12: mesmo hardcode `app:app@localhost:5432/appdb`. `apps/api/test/projects.e2e-spec.ts`, linhas 12–13: mesmo hardcode `app:app@localhost:5432/appdb`. `.github/workflows/ci.yml`, linhas 49–53: serviço `postgres` com `POSTGRES_USER: test`, `POSTGRES_PASSWORD: test`, `POSTGRES_DB: macro2pr_test`; linha 62: `DATABASE_URL: postgresql://test:test@localhost:5432/macro2pr_test?schema=public`.

**Padrão violado:** `docs/architecture.md`, Seção 9 (CI/CD): o workflow sobe o serviço postgres e roda `npx prisma migrate deploy` antes dos testes e2e. Os specs de e2e, no entanto, sobrescrevem `DATABASE_URL` para `app:app/appdb`, banco e usuário que **não existem** no serviço Postgres do CI (que expõe apenas `test:test/macro2pr_test`).

**Consequência:** os testes e2e não conseguiriam conectar ao banco no CI, fazendo o job `test-e2e` falhar.

## Sugestões (não bloqueiam)

1. **Escopo excedido em relação ao plan.md:** o `plan.md` da Tarefa 8 previa apenas `.github/workflows/ci.yml`, mas o diff alterou 3 arquivos (ci.yml + `vitest.config.ts` + `vitest.config.e2e.ts`). Os dois vitest configs são necessários para o `coverage` threshold 80% exigido pelo ID18, portanto justificáveis, mas ficam fora do escopo literal do plano.

2. **Nomes dos jobs:** `architecture.md` ID18 declara jobs `lint, typecheck, test, test:e2e`; o arquivo usa `test-e2e` (com hífen), coerente com o texto da Tarefa 8, mas diverge da tabela ID18. Não impede funcionamento.

3. **Execução local não verificada:** não foi possível rodar `cd /workspaces/macro-to-pr/apps/api && npm run test:e2e` localmente (ambiente com restrição de shell / Postgres não confirmado). O item "O comando `npm run test:e2e -w apps/api` passa localmente?" não pôde ser verificado. Recomenda-se que o autor rode o comando em ambiente com Postgres antes de abrir o PR.

## O que está em conformidade (sem apontamento)

- `.github/workflows/ci.yml` existe ✅
- 4 jobs presentes: `lint`, `typecheck`, `test`, `test-e2e` ✓
- Job `test-e2e` com serviço `postgres`, imagem `postgres:16` ✓
- Job `test-e2e` roda `npx prisma migrate deploy` antes de `npm run test:e2e -w apps/api` ✓
- `on: [push, pull_request]` ✓
- `npm ci` presente em todos os jobs ✓
- `apps/api/vitest.config.ts` e `vitest.config.e2e.ts` com bloco `coverage` threshold 80% (lines, functions, branches) ✓
- `apps/api/test/` contém specs e2e (supertest + Vitest) ✓
- `plan.md` não foi alterado (não consta no diff) ✓
- Nenhum arquivo fora de `.github/workflows/ci.yml` + vitest configs foi alterado ✓

## Justificativa do veredito

O workflow atende à maioria dos requisitos estruturais do ID18 e Seção 9, mas os dois apontamentos bloqueantes (A e B) fariam o CI falhar: o job `typecheck` executaria um script inexistente, e os specs de e2e se conectariam a um banco/usuário que não existem no serviço Postgres do CI. Por se tratar da rodada 2 e última permitida, o veredito é **PENDENTE COM APONTAMENTOS**. Estes itens devem ser corrigidos antes de uma nova submissão.
