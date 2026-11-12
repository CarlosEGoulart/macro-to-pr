# Plano — Issue #3

## Decisões técnicas

- Módulo `auth` (NestJS) com Passport `GitHubStrategy` para iniciar o fluxo OAuth e tratar o callback; rota `GET /auth/github` (início) e `GET /auth/github/callback` (conclusão).
- Entidades Prisma `GitHubAccount` (`githubUserId`, `githubLogin`, `accessToken` encriptado, `scopes`), `Developer` (FK → `GitHubAccount`) e `Repository` (FK → `GitHubAccount`, RN08).
- Callback bem-sucedido cria/vincula `GitHubAccount` + `Developer` e emite JWT (access + refresh). Callback com negação/interrupção não cria conta nem autentica (CA2).
- Camada estrita Controller → Service → Repository (Prisma); nenhum Controller acessa Prisma diretamente (ID6/ID8).
- Testes e2e em `test/` com supertest + Vitest; cada tarefa nasce com o teste RED que falha antes do código.
- Frontend: feature `auth` em `apps/web/src/features/auth/` com ligação às rotas de OAuth.

## Tarefas

- [ ] **Tarefa 1 — Scaffold do fluxo OAuth GitHub no módulo auth**
  - Cobre: passo técnico que destrava CA1 e CA2
  - Teste primeiro: `GET /auth/github` retorna URL/redirect de autorização do GitHub; o teste falha porque a rota/módulo ainda não existem
  - Arquivos previstos: `apps/api/src/modules/auth/auth.module.ts`, `auth.controller.ts`, `auth.service.ts`, `github-oauth.strategy.ts`

- [ ] **Tarefa 2 — Callback OAuth: vínculo da conta e emissão de JWT**
  - Cobre: CA1 (autenticação)
  - Teste primeiro: callback com `code` válido cria `GitHubAccount`+`Developer`, autentica e retorna JWT; falha antes do código pois o callback não existe
  - Arquivos previstos: `auth.controller.ts` (rota callback), `auth.service.ts`, `users/` (Developer/GitHubAccount service + repository), `prisma/schema.prisma`

- [ ] **Tarefa 3 — Callback OAuth: negação/interrupção da autorização**
  - Cobre: CA2
  - Teste primeiro: callback com `error=access_denied` (ou interrupção) não cria conta, não emite JWT e não autentica; falha antes do código pois não há tratamento
  - Arquivos previstos: `auth.controller.ts`, `auth.service.ts`

- [ ] **Tarefa 4 — Listagem de repositórios disponíveis da conta vinculada**
  - Cobre: CA1 (repositórios disponíveis para criação de Projeto)
  - Teste primeiro: `GET /repositories` retorna apenas repositórios da `GitHubAccount` vinculada ao Developer autenticado; falha antes do código pois não há endpoint
  - Arquivos previstos: `modules/projects/projects.module.ts`, `projects.controller.ts`, `projects.service.ts`, `projects.repository.ts`, `prisma/schema.prisma` (Repository)

- [ ] **Tarefa 5 — Exclusão de repositórios inacessíveis da seleção de Projeto**
  - Cobre: CA3
  - Teste primeiro: um repositório que não pertence à `GitHubAccount` autorizada não aparece na lista de seleção; falha antes do código pois não há filtro por conta
  - Arquivos previstos: `projects.service.ts`, `projects.repository.ts`

## Critérios sem tarefa

-
