# Parecer de Revisão de Código — Tarefa 18 (r2)

Issue: #5 (005-criar-demanda)
SHA base: b5674112534e19f27d737471551915baf9b3a137
Referência: docs/architecture.md

## Veredito: APROVADO

Não há não-conformidade bloqueante contra docs/architecture.md. Todos os 15 pontos estão CONFORME.

---

## Detalhamento por ponto

### Backend

**1. Separação estrita de camadas (ID8) — CONFORME**
- Controller (`apps/api/src/modules/demands/demands.controller.ts`): o novo `findOne(@Param('id') id)` delega para `this.demandsService.findDemandById(id)`. Não importa nem usa Prisma.
- Service (`apps/api/src/modules/demands/demands.service.ts`): `findDemandById` delega para `this.demandsRepository.findDemandById(id)`. Não acessa Prisma.
- Repository (`apps/api/src/modules/demands/demands.repository.ts`): é a única camada que chama `this.prisma.demand.findUnique(...)`.
- Evidência (diff): a query Prisma está só no Repository; Controller e Service só encaminham para a camada inferior.

**2. Repository encapsula Prisma (findUnique com include) — CONFORME**
- `demands.repository.ts`:
  ```
  async findDemandById(id: string) {
    return this.prisma.demand.findUnique({
      where: { id },
      include: { project: { include: { repository: true } } },
    });
  }
  ```
- Service e Controller não usam `findUnique` nem `include`. CONFORME.

**3. JwtAuthGuard protege explicitamente GET /demands/:id — CONFORME**
- `DemandsController` agora tem `@UseGuards(JwtAuthGuard)` na classe, além do `@ApiBearerAuth()` do Swagger.
- CONFORME (correção do apontamento 1 da rodada 1).

**4. NotFoundException quando demanda não existe — CONFORME**
- `demands.service.ts`:
  ```
  if (!demand) {
    throw new NotFoundException('Demanda não encontrada.');
  }
  ```
- E2e asserta 404 para id inexistente. CONFORME.

**5. DTO/retorno tipado com campos esperados — CONFORME**
- O Repository retorna `findUnique` com `include: { project: { include: { repository: true } } }`, então a resposta traz `id, title, description, type, priority, projectId` (campos da entidade `Demand`) mais `project { id, name, repository { id, name } }`.
- E2e (`demands.e2e-spec.ts`) asserta `id, title, description, type, priority, status` e `project { id, name, repository { id, name } }` no corpo (via envelope `{ data }` do interceptor).
- CONFORME.

**6. Testes e2e com vitest + supertest — CONFORME**
- `apps/api/test/demands.e2e-spec.ts` usa `request(app.getHttpServer())` (supertest) com `describe`/`it`/`expect` do vitest, na suíte `GET /demands/:id` (sucesso 200, sem token 401, inexistente 404).
- CONFORME (seção 7 da architecture).

### Frontend

**7. React Router v6 usado corretamente — CONFORME**
- `App.tsx`: `BrowserRouter`, `Routes`, `Route` com `/login`, `/projects`, `/demands/:id`, `Navigate`, `*` fallback.
- `DemandDetail.tsx`: `useParams<{ id }>()` e `useNavigate()`.
- `Sidebar.tsx`: `useLocation()` e `useNavigate()`.
- `ProjectsSelect.tsx`: `useNavigate()`.
- Nenhum componente `Link` é usado (usa `<a onClick>` com navigate), o que não é obrigatório pela architecture. CONFORME.

**8. Estilos inline (style) para jsdom — CONFORME**
- `DemandDetail.tsx`, `Sidebar.tsx`, `ProjectsSelect.tsx`, `CreateProjectModal.tsx`: todos usam `style={...}` conforme padrão existente. CONFORME.

**9. Design tokens do modo claro — CONFORME**
- `Sidebar.tsx` destaca item ativo com `background-color: rgba(97, 100, 241, 0.1)` e `color: rgb(97, 100, 241)` (primaria = #6164F1), confirmado pelos testes `toHaveStyle`.
- `DemandDetail.tsx` mantém objeto `tokens` com cores do modo claro. CONFORME.

**10. Testes de componente com vitest + RTL + jsdom — CONFORME**
- `apps/web/vitest.config.ts`: `environment: 'jsdom'`, `setupFiles: ['./src/setupTests.ts']`, `setupTests.ts` importa `@testing-library/jest-dom`.
- `DemandDetail.test.tsx` e `ProjectsSelect.test.tsx`: vitest + `@testing-library/react`. CONFORME (seção 7 da architecture).

**11. apiService segue padrão (request() com Bearer) — CONFORME**
- `apiService.getDemandById` chama `this.request('/demands/${id}')`.
- `apiService.request` lê `localStorage.getItem('token')` e define `headers.set('Authorization', 'Bearer <token>')`.
- Tratamento de erro: `response.ok` false -> `ApiError`; falha de rede -> `ApiError`. CONFORME.

**12. Nenhum segredo hardcoded — CONFORME**
- Não há chaves/tokens/secrets reais hardcoded no diff. `'token-teste'` aparece apenas como mock de teste. CONFORME (ID17).

**13. Colocation por feature — CONFORME**
- `DemandDetail` -> `features/demands/`; `ProjectsSelect`/`CreateProjectModal` -> `features/projects/`; `Sidebar` -> `features/layout/`; `apiService` -> `features/auth/`. CONFORME (seção 2.2 da architecture).

**14. Event handlers React válidos (onClick como prop real, não dentro de style) — CONFORME**
- `CreateProjectModal.tsx`: `onClick={(e) => e.stopPropagation()}` movido de dentro de `style` para prop real no `<section>`. CONFORME.
- `ProjectsSelect.tsx`: botões "+ Novo Projeto", "+ Nova Demanda", "Abrir Demanda →" têm `onClick` como props reais. CONFORME.

**15. Event.stopPropagation() usado corretamente para evitar que cliques internos acionem handlers do overlay — CONFORME**
- `CreateProjectModal.tsx`: o card do modal recebe `onClick={(e: React.MouseEvent) => e.stopPropagation()}` (prop real, não dentro de style). Teste "modal não fecha ao clicar no campo de nome" valida isso. CONFORME.

---

## Sugestões não-bloqueantes (não afetam o veredito)

1. **Sidebar: `<a href>` sem `preventDefault` pode recarregar a página.** Os itens renderizam `<a href={item.to} onClick={() => handleItemClick(item.to)}>` sem `event.preventDefault()`. Em navegador real, o clique dispara navegação client-side E segue o `href`. Sugestão: adicionar `event.preventDefault()` ou usar `<Link to>` do react-router-dom (relacionado ao ponto 7).
2. **DemandDetail engole erros de carregamento silenciosamente.** O `catch {}` do `useEffect` não registra nem expõe o erro; fica `null` e a UI mostra "Não foi possível carregar a demanda." Sugestão: logar o erro para depuração.

---

## Conclusão

Nenhuma não-conformidade bloqueante contra `docs/architecture.md`. Os 15 pontos estão CONFORME com evidência no diff e nas configurações de teste.

**Veredito: APROVADO** (com as sugestões acima).