# Plano — Issue #5

## Decisões técnicas

- Nova entidade `Demand` no `prisma/schema.prisma` com relação 1:N para `Project` (um Projeto tem muitas Demandas).
- Campos da Demand: `id` (uuid), `title` (string), `description` (string), `type` (enum: feature|bug|refactor), `priority` (enum: low|medium|high), `deadline` (datetime, opcional), `projectId` (FK → Project), `createdAt`, `updatedAt`.
- Endpoint `GET /projects` (listar projetos do desenvolvedor autenticado) para o seletor do frontend.
- Endpoint `POST /demandas` (criar demanda) protegido por `JwtAuthGuard` global.
- DTO `CreateDemandDto` com `@IsString`, `@IsEnum`, `@IsOptional` para validação via `ValidationPipe` global (whitelist).
- Verificação no service: o `projectId` informado deve pertencer ao `developerId` extraído do token JWT (CA3).
- Frontend reutiliza `Login.tsx`, `Menu.tsx` e `apiService.ts` existentes; conecta `apiService` ao backend real (base URL).
- Frontend: tela de seletor de projeto (consome `GET /projects`) e tela de criar demanda (formulário com validação).
- Nenhum salvamento de rascunho ao fechar a aba (fora de escopo).

## Tarefas

- [x] **Tarefa 1 — Entidade Demand no Prisma schema + migration**
  - Cobre: CA1
  - Teste primeiro: não se aplica (mudança de schema; validada pelo teste e2e de POST /demandas na Tarefa 4)
  - Arquivos previstos: `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/<timestamp>_create_demand/migration.sql`

- [x] **Tarefa 2 — GET /projects no controller, service e repository**
  - Cobre: CA4
  - Teste primeiro: e2e `GET /projects` sem token → 401; com token → lista projetos do desenvolvedor (200)
  - Arquivos previstos: `apps/api/src/modules/projects/projects.controller.ts`, `apps/api/src/modules/projects/projects.service.ts`, `apps/api/src/modules/projects/projects.repository.ts`

- [x] **Tarefa 3 — DTO CreateDemandDto com validações (CA2)**
  - Cobre: CA2
  - Teste primeiro: unitário do DTO — campos obrigatórios ausentes → erros de validação (class-validator)
  - Arquivos previstos: `apps/api/src/modules/demands/dto/create-demand.dto.ts`

- [x] **Tarefa 4 — POST /demandas no controller, service e repository**
  - Cobre: CA1
  - Teste primeiro: e2e `POST /demandas` com dados válidos → 201, retorna objeto completo com `id`; sem token → 401
  - Arquivos previstos: `apps/api/src/modules/demands/demands.controller.ts`, `apps/api/src/modules/demands/demands.service.ts`, `apps/api/src/modules/demands/demands.repository.ts`, `apps/api/src/modules/demands/demands.module.ts`

- [x] **Tarefa 5 — Verificação de permissão: projeto pertence ao desenvolvedor (CA3)**
  - Cobre: CA3
  - Teste primeiro: e2e `POST /demandas` com `projectId` de outro desenvolvedor → 403
  - Arquivos previstos: `apps/api/src/modules/demands/demands.service.ts` (regra de permissão)

- [x] **Tarefa 6 — Conectar apiService ao backend real (frontend)**
  - Cobre: CA4, CA1
  - Teste primeiro: unitário `apiService` — base URL aponta para `http://localhost:3000` e cabeçalho `Authorization: Bearer <token>` é anexado
  - Arquivos previstos: `apps/web/src/features/auth/apiService.ts`

- [ ] **Tarefa 7 — Refatorar Login e Menu com Design Tokens (incluindo App.tsx)**
  - Cobre: US01, US02, US03 (telas de acesso e workspace seguindo design tokens do Figma)
  - Teste primeiro: testes de componente — tela de login renderiza com tokens de cor/tipografia, menu renderiza com cores de superfície e botões com estados; seletor de projeto exibe lista com tokens aplicados
  - Arquivos previstos: `apps/web/src/features/auth/Login.tsx`, `apps/web/src/features/auth/Menu.tsx`, `apps/web/src/App.tsx`, `apps/web/src/features/auth/Login.test.tsx`, `apps/web/src/features/auth/Menu.test.tsx`

- [ ] **Tarefa 8 — Tela de seletor de Projeto (frontend) consumindo GET /projects**
  - Cobre: CA4
  - Teste primeiro: teste de componente — seletor exibe lista de projetos retornada pelo mock do `GET /projects`
  - Arquivos previstos: `apps/web/src/features/projects/`, `apps/web/src/features/projects/ProjectsSelect.tsx`

- [ ] **Tarefa 9 — Tela de criar Demanda (frontend) com formulário e validação**
  - Cobre: CA1, CA2
  - Teste primeiro: teste de componente — envio de formulário com campo obrigatório vazio → exibe erro de validação; envio válido → chama `POST /demandas`
  - Arquivos previstos: `apps/web/src/features/demands/CreateDemand.tsx`

- [ ] **Tarefa 10 — Tratamento de erros no frontend (401, 403, 400, rede)**
  - Cobre: CA2, CA3
  - Teste primeiro: teste de componente — resposta 403 → exibe "sem permissão"; resposta 400 → exibe campo inválido; resposta 401 → limpa token e redireciona para login; erro de rede → exibe mensagem de conexão
  - Arquivos previstos: `apps/web/src/features/auth/apiService.ts`, `apps/web/src/features/demands/CreateDemand.tsx`

- [ ] **Tarefa 11 — Testes e2e completos (sucesso e erro) no backend**
  - Cobre: CA1, CA2, CA3, CA4
  - Teste primeiro: e2e `POST /demandas` — sucesso (201), dados vazios (400), projeto não pertence (403), sem token (401); `GET /projects` — sucesso (200), sem token (401)
  - Arquivos previstos: `apps/api/test/demands.e2e-spec.ts`, `apps/api/test/projects.e2e-spec.ts` (adicionar GET)

## Critérios sem tarefa

-
