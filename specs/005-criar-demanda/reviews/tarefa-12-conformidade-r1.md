# Parecer de Conformidade — Tarefa 12

**Veredito:** APONTAMENTOS

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — Demanda criada com dados válidos, retorna objeto completo com `id` | não atendido (parcial) | `apps/web/src/features/auth/apiService.ts:89-101`; `apps/web/src/features/demands/CreateDemandModal.tsx:110-127`; `apps/web/src/features/demands/CreateDemand.test.tsx:71-106` |
| CA2 — Campo obrigatório vazio impede criação, informa qual campo | atendido | `apps/web/src/features/demands/CreateDemandModal.tsx:108-116`; `apps/web/src/features/demands/CreateDemand.test.tsx:43-69` |
| CA4 — Seletor de Projeto via `GET /projects` ao criar Demanda | não atendido | `apps/web/src/features/demands/CreateDemandModal.tsx` (todo o arquivo) |

## Apontamentos

### 1. CA4 não implementado — não há seletor de Projeto na tela de criar Demanda
**Critério violado:** spec.md, linha 23 — *"quando abro o seletor de Projeto, então a lista de Projetos do desenvolvedor autenticado é exibida (via `GET /projects`) para eu escolher onde associar a Demanda."*

**Evidência:** `CreateDemandModal.tsx` recebe `projectId` como prop já definido (linha 35: `interface CreateDemandModalProps { projectId: string; ... }`) e não renderiza nenhum `<select>`, `<input>` ou componente de seleção de projeto. Não há chamada `GET /projects` em nenhum ponto do fluxo de criação de Demanda. O modal apenas usa o `projectId` passado pelo pai (`ProjectsSelect.tsx` linha 843: `projectId={selectedId ?? ''}`). Não existe teste para CA4 em `CreateDemand.test.tsx` — o `describe` só cobre "CA1 e CA2" (linha 32).

### 2. CA1 — `apiService.createDemand` retorna `Response` bruto, não o objeto com `id`
**Critério violado:** spec.md, linha 20 — *"retorna o objeto completo (incluindo o `id` gerado)"*

**Evidência:** `apiService.ts` linhas 89-101 — `createDemand` retorna `this.request('/demandas', ...)` que é `Promise<Response>`. Nunca chama `response.json()` para extrair o corpo com o `id`. O componente `CreateDemandModal.tsx` linhas 110-127 ignora o retorno da promessa (`.then(() => { setSubmitting(false); onClose(); })`) — não captura nem exibe o objeto com `id` gerado.

### 3. CA1 — O teste não verifica que o token de autorização é enviado
**Critério violado:** spec.md, linha 20 — contexto de autenticação (JWT em `localStorage`, spec linha 39) e o próprio nome do teste no `CreateDemand.test.tsx` linha 71 diz *"chama createDemand com os dados e o token"*.

**Evidência:** `CreateDemand.test.tsx` linhas 33-36 mockam completamente `apiService.createDemand` com `mockResolvedValue(CREATED_DEMAND)`. Como a função é mockada, o `request()` real (que adiciona o cabeçalho `Authorization: Bearer <token>` em `apiService.ts:17-22`) nunca é executado. Nenhuma asserção verifica se o cabeçalho `Authorization` está presente. O teste testa o mock, não o comportamento real de envio do token.

### 4. CA1 — O teste não verifica que o objeto retornado com `id` é utilizado
**Critério violado:** spec.md, linha 20 — *"retorna o objeto completo (incluindo o `id` gerado) e passa a estar disponível para os próximos passos do fluxo (gerar Plano de Tarefas)."*

**Evidência:** `CreateDemand.test.tsx` linhas 89-105 — após clicar em submit, o teste apenas verifica que `createDemandSpy` foi chamado uma vez com os dados corretos (linhas 90-100) e que não há erro exibido (linhas 103-105). Nunca verifica se o `id` (`'dem-1'` do mock) é capturado, exibido ou disponibilizado para o próximo passo.

### 5. Tela `/demandas` (detalhe) não implementada
**Critério violado:** plan.md (texto literal da Tarefa 12, despacho do usuário) — *"Tela de criar Demanda via modal na `/projects` + tela `/demandas` (detalhe) + componentes reutilizáveis (header/sidebar)"*

**Evidência:** O glob de `apps/web/src/features/demands/**/*` retorna apenas três arquivos: `CreateProjectModal.tsx`, `CreateDemand.test.tsx`, `CreateDemandModal.tsx`. Não existe qualquer arquivo para uma tela de detalhe de Demanda (`/demandas`). O diff não contém criação de rota, página ou componente de detalhe de demanda.

---

### Resumo

- **CA2:** atendido (validação client-side de campos obrigatórios com mensagem específica e bloqueio da chamada à API).
- **CA1:** parcialmente atendido — a chamada à API é feita com os dados corretos, mas não há retorno do objeto com `id`, nem verificação do token de autenticação.
- **CA4:** não atendido — ausente completamente (sem seletor de projeto, sem `GET /projects`, sem teste).
- **Escopo da tarefa:** falta a tela `/demandas` (detalhe), prevista no texto literal da Tarefa 12.