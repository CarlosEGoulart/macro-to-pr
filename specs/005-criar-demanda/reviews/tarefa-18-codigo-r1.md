# Parecer de Revisão de Código — Tarefa 18 (r1)

Issue: #5 (005-criar-demanda)
SHA base: b5674112534e19f27d737471551915baf9b3a137
Referência: docs/architecture.md

## Veredito: APROVADO

Não há não-conformidade bloqueante contra docs/architecture.md. Todos os 13 pontos estão CONFORME.

---

## Detalhamento por ponto

### Backend

**1. Separação estrita de camadas (ID8) — CONFORME**
- Controller (`apps/api/src/modules/demands/demands.controller.ts`): o novo `findOne(@Param('id') id)` delega para `this.demandsService.findDemandById(id)`. Não importa nem usa Prisma.
- Service (`apps/api/src/modules/demands/demands.service.ts`): `findDemandById` delega para `this.demandsRepository.findDemandById(id)`. Não acessa Prisma.
- Repository (`apps/api/src/modules/demands/demands.repository.ts`): é a única camada que chama `this.prisma.demand.findUnique(...)`.
- Evidência (diff): a query Prisma está só no Repository; Controller e Service só encaminham para a camada inferior.

**2. Repository encapsula Prisma (findUnique com include) — CONFORME**
- `demands.repository.ts` (hunk adicionado):
  ```
  async findDemandById(id: string) {
    return this.prisma.demand.findUnique({
      where: { id },
      include: { project: { include: { repository: true } } },
    });
  }
  ```
- Service e Controller não usam `findUnique` nem `include`. CONFORME.

**3. JwtAuthGuard protege GET /demands/:id — CONFORME**
- `JwtAuthGuard` registrado como guard global em `apps/api/src/app.module.ts` (`{ provide: APP_GUARD, useClass: JwtAuthGuard }`), portanto protege todas as rotas, incluindo a nova `GET /demands/:id`.
- Evidência comportamental: o e2e `GET /demands/:id sem token -> 401` (`apps/api/test/demands.e2e-spec.ts`).
- CONFORME.

**4. NotFoundException quando demanda não existe — CONFORME**
- `demands.service.ts` (hunk adicionado):
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
- `App.tsx`: `BrowserRouter`, `Routes`, `Route`, `Navigate` (rotas `/`, `/projects`, `/demands/:id`).
- `DemandDetail.tsx`: `useParams<{ id }>()` e `useNavigate()`.
- `Sidebar.tsx`: `useLocation()` e `useNavigate()`.
- `ProjectsSelect.tsx`: `useNavigate()`.
- Nota: não usa o componente `Link` (usa `<a onClick>`), o que não é obrigatório pela architecture.
- CONFORME.

**8. Estilos inline (style) para jsdom — CONFORME**
- `DemandDetail.tsx`, `Sidebar.tsx` e `ProjectsSelect.tsx` usam `style={...}` em todos os elementos, conforme o padrão existente dos componentes.
- CONFORME.

**9. Design tokens do modo claro — CONFORME**
- `Sidebar.tsx` destaca o item ativo com `background-color: rgba(97, 100, 241, 0.1)` e `color: rgb(97, 100, 241)` (primaria = #6164F1), confirmado pelos testes `toHaveStyle`.
- `DemandDetail.tsx` mantém o objeto `tokens` com cores do modo claro.
- CONFORME.

**10. Testes de componente com vitest + RTL + jsdom — CONFORME**
- `DemandDetail.test.tsx` e `ProjectsSelect.test.tsx` usam vitest + `@testing-library/react`.
- `setupTests.ts` configura jsdom: `jest-dom`, mock de `localStorage` e mock de `window.history` (pushState/replaceState) para evitar erros de navegação do react-router-dom.
- CONFORME (seção 7 da architecture).

**11. apiService segue o padrão (request() com Bearer) — CONFORME**
- `apiService.getDemandById` (`apiService.ts:174-195`) chama `this.request('/demands/${id}')`.
- `apiService.request` (`apiService.ts:32-37`) lê `localStorage.getItem('token')` e define `headers.set('Authorization', 'Bearer <token>')`.
- Tratamento de erro: `response.ok` false -> `ApiError` com mensagem/status; falha de rede -> `ApiError(..., null)`.
- CONFORME.

**12. Nenhum segredo hardcoded — CONFORME**
- Não há chaves/tokens/secrets reais hardcoded no diff. O valor `'token-teste'` aparece apenas como mock de teste.
- CONFORME (ID17).

**13. Colocation por feature — CONFORME**
- `DemandDetail` -> `apps/web/src/features/demands/`
- `ProjectsSelect` -> `apps/web/src/features/projects/`
- `Sidebar` -> `apps/web/src/features/layout/`
- `apiService` -> `apps/web/src/features/auth/`
- CONFORME (seção 2.2 da architecture).

---

## Sugestões não-bloqueantes (não afetam o veredito)

1. **Sidebar: `<a href>` sem `preventDefault` pode causar recarga completa da página.** Em `Sidebar.tsx`, os itens renderizam `<a href={item.to} onClick={() => handleItemClick(item.to)}>`. O handler chama `navigate(to)` mas não chama `event.preventDefault()`, então num navegador real o clique dispara navegação client-side E segue o `href` (recarga). Sugestão: usar `<Link to>` do react-router-dom, ou adicionar `event.preventDefault()` no clique, ou remover o `href`. (Relacionado ao ponto 7.)

2. **DemandDetail engole erros de carregamento silenciosamente.** O `catch {}` do `useEffect` não registra nem expõe o erro; a demanda fica `null` e a UI mostra "Não foi possível carregar a demanda." sem detalhe. O próprio código reconhece que está fora de escopo. Sugestão: ao menos logar o erro para depuração.

3. **Considerar `Link` em vez de `<a onClick>` para navegação.** O ponto 7 lista `Link` como API do RRv6; o código usa `<a>` com `useNavigate`. Funciona, mas `Link` é a forma idiomática e evita o problema do item 1.

---

## Conclusão

Nenhum apontamento bloqueante. O código da tarefa 18 respeita a separação de camadas (ID8), a encapsulação do Prisma no Repository, a proteção JWT global, o tratamento de erro com NotFoundException, o contrato de retorno tipado, o padrão de testes e2e (vitest+supertest), o React Router v6, estilos inline/jsdom, tokens do modo claro, testes de componente (vitest+RTL+jsdom), o padrão `apiService.request()` com Bearer, ausência de segredos hardcoded e colocation por feature.

**Veredito: APROVADO** (com as sugestões acima).