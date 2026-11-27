# PARECER DE CONFORMIDADE — TAREFA 18 (revisor-conformidade)

**Issue:** #5 (005-criar-demanda)  
**Base SHA:** b5674112534e19f27d737471551915baf9b3a137  
**Spec:** specs/005-criar-demanda/spec.md (status: aprovada)  
**Plano:** specs/005-criar-demanda/plan.md (tarefa 18)

---

## 1. Backend: GET /demands/:id no DemandsController

**Status: NÃO CONFORME (parcial)**

- `@Get(':id')` existe: **CONFORME**. `demands.controller.ts:21`: `@Get(':id') async findOne(@Param('id') id: string)`.
- Protegido por `JwtAuthGuard`: **NÃO CONFORME**. O controller tem apenas `@ApiBearerAuth()` (linha 7), que é metadado do Swagger/OpenAPI e **não** impõe autenticação. Não há `@UseGuards(JwtAuthGuard)` nem na classe nem no método `findOne`. A expectativa de 401 sem token vem do e2e, mas a proteção não está visível no código do controller.
- Retorna 200 com dados completos: **CONFORME** (delega ao service/repository com include de project e repository).
- Retorna 404 inexistente: **CONFORME** (service lança `NotFoundException`).
- Retorna 401 sem token: **não verificável no código do controller** (guard ausente; depende de eventual guard global não mostrado neste diff).

Evidência: `apps/api/src/modules/demands/demands.controller.ts:7,21-24`.

---

## 2. Backend: DemandsService.findDemandById(id)

**Status: CONFORME**

- Existe `findDemandById(id)` delegando ao `demandsRepository.findDemandById(id)`.
- Lança `NotFoundException('Demanda não encontrada.')` quando não encontrado.

Evidência: `apps/api/src/modules/demands/demands.service.ts` (diff: import de `NotFoundException` adicionado; método nas linhas 37-44 do diff).

---

## 3. Backend: DemandsRepository.findDemandById(id)

**Status: CONFORME**

- Implementa `prisma.demand.findUnique({ where: { id }, include: { project: { include: { repository: true } } } })` exatamente conforme especificado.

Evidência: `apps/api/src/modules/demands/demands.repository.ts` (diff).

---

## 4. Backend: e2e GET /demands/:id

**Status: CONFORME**

- Testa sucesso 200 com dados completos (incluindo project.repository).
- Testa 401 sem token.
- Testa 404 quando demanda inexistente.

Evidência: `apps/api/test/demands.e2e-spec.ts` (diff: suíte `GET /demands/:id` com 3 testes).

---

## 5. Frontend: App.tsx rotas

**Status: NÃO CONFORME (parcial)**

- Tem `BrowserRouter`, `Routes`, `Route` com `/projects` e `/demands/:id`: **CONFORME**.
- Rota `/login`: **NÃO CONFORME**. Não existe `Route path="/login"`. Em vez disso, usa `path="*"` (wildcard) que renderiza `<Login />` quando não há token (`App.tsx:19-20`). O plan.md especifica rotas `/login`, `/projects`, `/demands/:id`.

Evidência: `apps/web/src/App.tsx:16-28`.

---

## 6. Frontend: Sidebar.tsx navegação e destaque ativo

**Status: CONFORME**

- Substituiu `href="#"` por `to` + `useNavigate`/`handleItemClick`.
- Destaca item ativo conforme rota via `useLocation` + função `isActive` + `matchPath` (suporta rotas com parâmetro como `/demands/:id` via `startsWith`).

Evidência: `apps/web/src/features/layout/Sidebar.tsx:106-126, 233-236`.

---

## 7. Frontend: ProjectsSelect.tsx botões e modais

**Status: CONFORME**

- "+ Novo Projeto" → `onClick={() => setOpenProjectModal(true)}`.
- "+ Nova Demanda" → `onClick={() => setOpenDemandModal(true)}`.
- "Abrir Demanda →" → `onOpen={() => navigate(`/demands/${demand.id}`)}` (no `DemandCard`).

Evidência: `apps/web/src/features/projects/ProjectsSelect.tsx` (diff: linhas ~710-725 e ~790-792).

---

## 8. Frontend: DemandDetail.tsx

**Status: CONFORME**

- Lê `:id` via `useParams<{ id: string }>()`.
- Busca demanda via `apiService.getDemandById(id)` (GET /demands/:id).
- "Voltar ao Workspace" navega para `/projects` via `onClick={() => navigate('/projects')}` (substituiu `href="#"`).

Evidência: `apps/web/src/features/demands/DemandDetail.tsx` (diff).

---

## 9. Frontend: apiService.ts getDemandById

**Status: CONFORME**

- Método `getDemandById(id)` chama `this.request(`/demands/${id}`)` e retorna `Promise` com tipo detalhado da demanda.

Evidência: `apps/web/src/features/auth/apiService.ts` (diff: método adicionado ao final).

---

## 10. Testes TDD

**Status: CONFORME**

- Existe `DemandDetail.test.tsx` (novo) com testes de componente.
- Existem adições em `ProjectsSelect.test.tsx` (navegação e modais).
- Ambos seguem a abordagem "teste primeiro" descrita no plan.md da tarefa 18.

Evidência: `apps/web/src/features/demands/DemandDetail.test.tsx` (novo), `apps/web/src/features/projects/ProjectsSelect.test.tsx` (modificado, novo describe "navegação e modais").

---

## 11. Escopo dos arquivos tocados

**Status: NÃO CONFORME (parcial)**

Arquivos dentro do escopo da tarefa 18 (conforme plan.md):
- `apps/api/src/modules/demands/demands.controller.ts` ✓
- `apps/api/src/modules/demands/demands.service.ts` ✓
- `apps/api/src/modules/demands/demands.repository.ts` ✓
- `apps/api/test/demands.e2e-spec.ts` ✓
- `apps/web/src/App.tsx` ✓
- `apps/web/src/features/layout/Sidebar.tsx` ✓
- `apps/web/src/features/projects/ProjectsSelect.tsx` ✓
- `apps/web/src/features/demands/DemandDetail.tsx` ✓
- `apps/web/src/features/auth/apiService.ts` ✓
- `apps/web/src/features/demands/DemandDetail.test.tsx` ✓
- `apps/web/src/features/projects/ProjectsSelect.test.tsx` ✓

Arquivos **fora do escopo** da tarefa 18 encontrados no diff:
- `.env.example` → `apps/api/.env.example` (rename) — não consta nos arquivos previstos da tarefa 18; parece ser de tarefa anterior (ex: 16).
- `apps/web/src/setupTests.ts` (modificado: mocks de localStorage e history) — infra de suporte aos testes, não listado nos arquivos previstos, mas justificável para viabilizar os testes de roteamento.
- `specs/005-criar-demanda/plan.md` (modificado: adição da tarefa 18 ao plano) — documentação do plano, aceitável.

Evidência: diff completo.

---

## 12. Fora de escopo respeitado

**Status: CONFORME**

Não há evidência no diff de:
- Geração de Plano de Tarefas (US04 / issue #6).
- Tela separada `/demandas` (listagem detalhada de demandas).
- Salvamento de rascunho da demanda.
- Tasks/tentativas da demanda (entidade `Task` não existe).

---

## Veredito

**NÃO APROVADO** — há apontamentos de não conformidade que precisam de correção antes da aprovação:

1. **`GET /demands/:id` não tem `@UseGuards(JwtAuthGuard)`** no `DemandsController`. Apenas `@ApiBearerAuth()` (Swagger, não é guard). A rota não está explicitamente protegida contra acesso não autenticado.
2. **App.tsx não tem rota explícita `/login`**; usa `path="*"` como fallback quando não há token, divergindo do plan.md que especifica a rota `/login`.
3. **Arquivos fora do escopo** foram alterados: rename de `.env.example` para `apps/api/.env.example` (não previsto na tarefa 18) e modificação em `setupTests.ts` (não listado nos arquivos previstos).

---

Evidências retiradas do diff `git diff b5674112534e19f27d737471551915baf9b3a137` e leitura direta de `apps/api/src/modules/demands/demands.controller.ts`, `apps/web/src/App.tsx`, `apps/web/src/features/layout/Sidebar.tsx`.