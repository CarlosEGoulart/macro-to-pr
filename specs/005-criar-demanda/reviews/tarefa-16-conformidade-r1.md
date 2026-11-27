O shell não está mais disponível para execução de testes nesta sessão, mas a revisão de conformidade se baseia na leitura integral do diff e dos arquivos (método do revisor: "leia o diff inteiro"). Tenho evidência suficiente para o parecer.

---

# Parecer de Conformidade — Tarefa 16

**Veredito:** APONTAMENTOS

## Critérios verificados

| Critério (da spec / tarefa 16) | Situação | Onde |
|---|---|---|
| 1. Após o OAuth, backend chama `GET https://api.github.com/user/repos` com `accessToken` e grava em `Repository` vinculada à `GitHubAccount` (CA1 issue #3) | atendido | `apps/api/src/modules/auth/auth.service.ts:145-146` (chama `syncRepositoriesFromGitHub`) e `:166-216` (busca paginada + upsert) |
| 2. Endpoint `GET /repositories` (ou similar) lista repositórios da `GitHubAccount` do dev autenticado; sem token → 401 | atendido | `apps/api/src/modules/projects/projects.controller.ts:19-25` (`GET /projects/repositories` → service → repository); `apps/api/test/projects.e2e-spec.ts` (suíte `GET /projects/repositories`: 401 sem token, 200 com token) |
| 3. Endpoint `GET /developer/me` retorna `{ id, name, email, avatarUrl }`; sem token → 401 | atendido | `apps/api/src/app.controller.ts:45-56`; `apps/api/test/projects.e2e-spec.ts` (suíte `GET /developer/me`: 401 sem token, 200 com token) |
| 4. Frontend `HeaderUser` exibe nome e avatar reais da API (não hardcoded) | atendido | `apps/web/src/features/projects/ProjectsSelect.tsx:81-148`; `apps/web/src/features/projects/ProjectsSelect.test.tsx` (assert `queryByText('Desenvolvedor')` ausente quando dados carregam) |
| 5. Testes e2e e de componente existem e cobrem cenários do plano | não atendido (parcial) | E2e cobre `GET /repositories` e `GET /developer/me`; **falta teste dedicado para "POST /projects só passa se houver repositório sincronizado prévio"** (listado no plano da tarefa 16) |
| 6. Separação de camadas Controller → Service → Repository (ID6, ID8 architecture.md) | não atendido | `GET /developer/me` no `AppController` acessa `DeveloperRepository` diretamente (`apps/api/src/app.controller.ts:45-56`), sem Service |
| 7. `JwtAuthGuard` global protege os novos endpoints (ID9) | atendido | `apps/api/src/app.module.ts:56-59` (APP_GUARD global); endpoints não são `@Public()`; testes esperam 401 sem token |

## Apontamentos

### 1. `GET /developer/me` quebra a separação estrita de camadas (ID6) — `apps/api/src/app.controller.ts:45-56`
**Bloqueante**

O endpoint `GET /developer/me` foi implementado no `AppController`, que injeta `DeveloperRepository` e chama `this.developerRepository.findById(...)` diretamente, sem passar por uma camada `Service`.

O `ID6` da `docs/architecture.md` exige: *"Controller só recebe request/response → delega para Service → Service usa repositórios (Prisma). Nenhum Controller acessa Prisma diretamente."* Um Controller acessando repositório diretamente fere esse padrão estrutural declarado.

**Evidência:** no diff, `app.controller.ts` adiciona `DeveloperRepository` ao construtor e o método `getDeveloperMe` consulta o banco direto no controller (linhas 45-56). O endpoint `GET /projects/repositories`, por outro lado, respeita a camada (controller → service → repository).

**Critério violado:** item 6 da tarefa 16 ("A separação de camadas Controller → Service → Repository (Prisma) foi respeitada (ID6, ID8 da architecture.md)?") e `ID6` da `docs/architecture.md`.

### 2. Falta teste e2e dedicado para "`POST /projects` só passa se houver repositório sincronizado prévio"
**Não-bloqueante / sugestão**

O plano da tarefa 16 lista, entre os testes primeiro do backend: *"`POST /projects` só passa se houver repositório sincronizado prévio."* A suíce adicionada em `apps/api/test/projects.e2e-spec.ts` cobre apenas as novas suítes `GET /projects/repositories` e `GET /developer/me`. Não há um cenário que exija repositório sincronizado como pré-condição vinculado à tarefa 16.

O teste existente de `POST /projects` cria repositórios manualmente no banco antes de postar (cobertura indireta do comportamento), mas não materializa o cenário específico de pré-condição de sincronização descrito no plano.

**Evidência:** `apps/api/test/projects.e2e-spec.ts` — as novas descrições `describe` são apenas `GET /projects/repositories` e `GET /developer/me`; nenhuma iteração sobre `POST /projects` com repositório pré-sincronizado.

**Critério violado:** item 5 da tarefa 16 ("Os testes e2e e de componente existem e cobrem os cenários descritos no plano?").

---

### Observações (não são apontamentos formais)

- **Camada de `AuthService → ProjectsRepository`:** `AuthService` injeta `ProjectsRepository` e chama `upsertRepositoryByFullName` (`auth.service.ts:37, 196`). Isso é Service → Repository, que **está dentro** do padrão `ID6`/`ID8` (não é Controller acessando diretamente). Não há violação aqui.
- **`projects.module.ts`:** já exporta `ProjectsRepository` (linha 11), então a injeção em `AuthService` funciona sem alteração. O plano o listava como "garantir exports/providers", já satisfeito.
- **`.env` / `.env.example`:** o plano lista esses arquivos, mas o diff não os altera. As variáveis `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` já são lidas via `ConfigService` (ex.: `auth.controller.ts:32-33`) e estão documentadas na `docs/architecture.md` seção 8; o `.env` não é versionado por decisão de arquitetura. Não configura perda de conformidade.
- **Execução de testes:** não foi possível rodar `npm run test:e2e` (backend precisa de PostgreSQL) nem `npm test` (frontend) nesta sessão por restrição de ambiente de shell. O parecer se baseia na leitura integral do diff e dos arquivos envolvidos.
