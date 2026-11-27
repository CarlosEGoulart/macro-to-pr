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

- [x] **Tarefa 7 — Refatorar Login com Design Tokens (incluindo App.tsx)**
  - Cobre: US01, US02, US03 (telas de acesso e workspace seguindo design tokens do Figma)
  - Teste primeiro: testes de componente — tela de login renderiza com tokens de cor/tipografia, menu renderiza com cores de superfície e botões com estados; seletor de projeto exibe lista com tokens aplicados
  - Arquivos previstos: `apps/web/src/features/auth/Login.tsx`, `apps/web/src/App.tsx`, `apps/web/src/features/auth/Login.test.tsx`

- [x] **Tarefa 8 — Botão "Autorizar com GitHub" iniciando fluxo OAuth**
  - Cobre: US01 (tela de acesso)
  - Teste primeiro: teste de componente — clicar no botão "Autorizar com GitHub" dispara o fluxo de autorização OAuth (redireciona para callback ou inicia requisição de autorização); botão exibe estado de carregamento durante a ação
  - Arquivos previstos: `apps/web/src/features/auth/Login.tsx` (onClick do botão), `apps/web/src/features/auth/apiService.ts` (integração com callback/token), `apps/web/src/features/auth/Login.test.tsx` (teste de clique no botão)

- [x] **Tarefa 9 — Corrigir build do backend (NestJS compilação com nodenext)**
  - Cobre: US01 (backend precisa rodar para o fluxo OAuth de login funcionar)
  - Teste primeiro: `npm run build` e `npm run start` em `apps/api` concluem sem erro TS2307; `nest start` sobe a API na porta 3000 e o endpoint `GET /auth/github` responde
  - Arquivos previstos: `apps/api/tsconfig.json`, `apps/api/tsconfig.build.json`, `apps/api/src/modules/demands/demands.controller.ts`, `apps/api/src/modules/demands/demands.service.ts` (ajuste de extensões de importação para `.ts` ou configuração de `moduleResolution`/`allowImportingTsExtensions`)

- [x] **Tarefa 10 — Corrigir DI do ProjectsRepository no DemandsModule (backend rodando)**
  - Cobre: US01 (backend precisa subir para o fluxo OAuth de login funcionar)
  - Teste primeiro: `npm run start` em `apps/api` sobe a API na porta 3000 sem UnknownDependenciesException; o endpoint `GET /auth/github` responde
  - Arquivos previstos: `apps/api/src/modules/demands/demands.module.ts` (importar o módulo que exporta ProjectsRepository ou fornecer o provider no DemandsModule)

- [x] **Tarefa 11 — Tela de seletor de Projeto (frontend) consumindo GET /projects**
  - Cobre: CA4
  - Teste primeiro: teste de componente — seletor exibe lista de projetos retornada pelo mock do `GET /projects`
  - Arquivos previstos: `apps/web/src/features/projects/`, `apps/web/src/features/projects/ProjectsSelect.tsx`

- [x] **Tarefa 12 — Tela de criar Demanda via modal na `/projects` + tela `/demandas` (detalhe) + componentes reutilizáveis (header/sidebar)**
  - Cobre: CA1, CA2, CA4
  - Justificativa: o fluxo de usuário identificado no Figma mostra que a criação de Demanda ocorre via modal na tela `/projects` (não como tela separada), e a criação de Projeto também ocorre via modal. O header e a sidebar são componentes reutilizáveis entre `/projects` e `/demandas`. A seção de Demandas é sincronizada dentro de `/projects` (design `2-8451` / `2-8461`).
  - Teste primeiro: teste de componente — envio de formulário com campo obrigatório vazio → exibe erro de validação e não chama `POST /demandas`; envio válido → chama `POST /demandas` com dados e token (CA1, CA2). Teste de componente do modal de criação de Projeto abre com select de repositórios (CA4).
  - Arquivos envolvidos:
    - `apps/web/src/features/demands/CreateDemandModal.tsx` (novo — modal de criação de Demanda, design `82-923`)
    - `apps/web/src/features/demands/CreateDemand.test.tsx` (novo — teste primeiro, CA1 e CA2)
    - `apps/web/src/features/demands/CreateProjectModal.tsx` (novo — modal de criação de Projeto, design `82-906`)
    - `apps/web/src/features/layout/Header.tsx` (novo — componente reutilizável, design `126-2259` / `44:336`)
    - `apps/web/src/features/layout/Sidebar.tsx` (novo — componente reutilizável, design `27-307` / `27:263`)
    - `apps/web/src/features/projects/ProjectsSelect.tsx` (modificado — integrar botões "Novo Projeto" e "Nova Demanda", exibir seção de Demandas do projeto selecionado `2-8451` / `2-8461`, usar Header e Sidebar reutilizáveis, passar `projectId` para o modal de criar Demanda)
    - `apps/web/src/features/auth/apiService.ts` (modificado — adicionar `createDemand(data)` → `POST /demandas` e `createProject(data)` → `POST /projects`, reutilizando `request()`)

- [x] **Tarefa 13 — Tratamento de erros no frontend (401, 403, 400, rede)**
  - Cobre: CA2, CA3
  - Teste primeiro: teste de componente — resposta 403 → exibe "sem permissão"; resposta 400 → exibe campo inválido; resposta 401 → limpa token e redireciona para login; erro de rede → exibe mensagem de conexão
  - Arquivos previstos: `apps/web/src/features/auth/apiService.ts`, `apps/web/src/features/demands/CreateDemand.tsx`

- [x] **Tarefa 14 — Testes e2e completos (sucesso e erro) no backend**
  - Cobre: CA1, CA2, CA3, CA4
  - Teste primeiro: e2e `POST /demandas` — sucesso (201), dados vazios (400), projeto não pertence (403), sem token (401); `GET /projects` — sucesso (200), sem token (401)
  - Arquivos previstos: `apps/api/test/demands.e2e-spec.ts`, `apps/api/test/projects.e2e-spec.ts` (adicionar GET)

- [x] **Tarefa 15 — Dependência técnica: fluxo de OAuth GitHub (pré-requisito da issue #3)**
  - Cobre: US01 (autenticação necessária para criar demanda)
  - Justificativa: a issue #3 está fechada no GitHub, mas seu código de auth nunca foi entregue na main. Para a #5 funcionar (tela de criar demanda exigindo token JWT), o fluxo de autorização precisou ser implementado como dependência desta branch.
  - Arquivos envolvidos:
    - `apps/api/src/modules/auth/auth.controller.ts` (novo)
    - `apps/api/src/modules/auth/auth.service.ts` (novo)
    - `apps/api/src/modules/auth/github-account.repository.ts` (novo)
    - `apps/api/src/modules/auth/developer.repository.ts` (novo)
    - `apps/api/src/modules/auth/jwt-auth.guard.ts` (modificado — respeita @Public())
    - `apps/api/src/main.ts` (modificado — CORS)
    - `apps/api/prisma/schema.prisma` + migration `20261126023309_add_github_account` (novo)
    - `apps/api/src/app.module.ts` (modificado — registro de AuthController + providers)
    - `apps/web/src/features/auth/apiService.ts` (modificado — navegação direta p/ backend)
    - `apps/web/src/features/auth/Login.tsx` (modificado — captura ?token=)
    - Teste primeiro: não se aplica (código já implementado e validado manualmente; complementar com testes e2e se necessário)

- [x] **Tarefa 16 — Sincronizar repositórios do GitHub após OAuth + exibir perfil do usuário no header (pré-requisito de Projeto e Demanda)**
  - Cobre: CA1 da issue #3 (repositórios da conta vinculada ficam disponíveis), CA4 da issue #5 (seletor de Projeto exibe lista do desenvolvedor autenticado) e dependência técnica da issue #5 (sem repositórios não há projetos; sem projetos não há demandas).
  - Justificativa: o fluxo OAuth da issue #3 foi entregue, mas sua Tarefa 4 (sincronizar repositórios) nunca foi implementada. A issue #5 depende disso: criar uma Demanda exige um `projectId` válido, que só existe se houver um `Repository` cadastrado para o desenvolvedor autenticado. Além disso, o header do Workspace (`HeaderUser` em `ProjectsSelect.tsx`) está hardcoded ("Desenvolvedor" / avatar "D") e não exibe dados reais do perfil do usuário autenticado, o que confunde o desenvolvedor após o login.
  - Teste primeiro:
    - Backend: e2e `GET /repositories` com token válido → 200 com repositórios da `GitHubAccount` do desenvolvedor; sem token → 401. `POST /projects` só passa se houver repositório sincronizado prévio.
    - Backend: e2e `GET /developer/me` com token válido → 200 com `{ id, name, email, avatarUrl }` do desenvolvedor; sem token → 401.
    - Frontend: teste de componente — `HeaderUser` renderiza nome e avatar do desenvolvedor carregados da API (não hardcoded).
  - Arquivos envolvidos:
    - `apps/api/src/modules/auth/auth.service.ts` (modificado — após criar/vincular a `GitHubAccount`, buscar `GET /user/repos` com o `accessToken` e gravar na tabela `Repository`, com paginação)
    - `apps/api/src/modules/projects/projects.controller.ts` (novo endpoint `GET /repositories`)
    - `apps/api/src/modules/projects/projects.service.ts` (novo `findRepositoriesByDeveloper`)
    - `apps/api/src/modules/projects/projects.repository.ts` (novo `prisma.repository.findMany({ where: { githubAccountId } })`)
    - `apps/api/src/modules/projects/projects.module.ts` (garantir exports/providers)
    - `apps/api/test/projects.e2e-spec.ts` (adicionar suíte `GET /repositories` e `GET /developer/me`)
    - `.env` / `.env.example` (garantir `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`)
    - `apps/web/src/features/projects/ProjectsSelect.tsx` (modificado — `HeaderUser` busca e exibe nome e avatar do desenvolvedor autenticado; remove hardcode)
    - `apps/web/src/features/auth/apiService.ts` (modificado — adicionar método para buscar perfil do desenvolvedor, ex.: `GET /developer/me`, com token no header)
    - Novo endpoint backend `GET /developer/me` (controller/service/repository ou reuso de módulo existente) que retorna dados do desenvolvedor a partir do token JWT.

- [x] **Tarefa 17 — Persistir tipo e prioridade na entidade Demand (fechar CA1 — objeto completo)**
  - Cobre: CA1
  - Justificativa: o auditor final apontou que `type` e `priority` são obrigatórios de entrada (validados pelo DTO e pelo front) mas não são persistidos nem retornados no objeto da Demanda, deixando o critério CA1 parcialmente coberto ("objeto completo" não inclui tipo nem prioridade).
  - Teste primeiro: e2e `POST /demandas` sucesso 201 deve asserir que o objeto retornado inclui `id`, `title`, `description`, `projectId`, `type` e `priority`.
  - Arquivos previstos: `apps/api/prisma/schema.prisma` (colunas `type` enum feature|bug|refactor e `priority` enum low|medium|high), nova migration para `Demand.type`/`Demand.priority`, `apps/api/src/modules/demands/demands.service.ts` (passar `type`/`priority` ao `prisma.demand.create`), `apps/api/test/demands.e2e-spec.ts` (asserir `type`/`priority` no objeto retornado).

## Critérios sem tarefa

-
