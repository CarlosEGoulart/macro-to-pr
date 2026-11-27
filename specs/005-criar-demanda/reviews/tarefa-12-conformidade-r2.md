# Parecer de Conformidade — Tarefa 12 (rodada 2)

**Repositório:** `/workspaces/macro-to-pr` (branch `5-criar-demanda`, Issue #5)
**Diff avaliado:** working tree vs `eaa9862607a665bca5ea2e47362c043c9b12a5fd` (sem `..HEAD`)
**Critérios de aceite ligados:** CA1, CA2, CA4
**Modo:** somente leitura — aponta não-conformidades, nunca corrige

---

## Veredito geral

**APROVADO**

Todos os 6 apontamentos da rodada 1 foram corrigidos integralmente. Não resta não-conformidade relativa aos critérios de aceitação (CA1, CA2, CA4) nem ao NC-01.

---

## 1. Verificações obrigatórias — status de cada apontamento da rodada 1

| # | Apontamento (rodada 1) | Status | Evidência no diff |
|---|------------------------|--------|-------------------|
| 1 | CA4: modal de criar Demanda tem `<select>` de projetos carregado via GET /projects? Teste para CA4 existe? | ✅ CORRIGIDO | `CreateDemandModal.tsx` (useEffect chama `apiService.request('/projects')` + `<select data-testid="create-demand-select-project">`). `CreateDemand.test.tsx`: bloco `describe('CreateDemandModal — CA4')` com testes do select carregado via `GET /projects` e verificação do header Authorization. |
| 2 | CA1: `apiService.createDemand` retorna objeto parseado com id (não `Promise<Response>`)? | ✅ CORRIGIDO | `apiService.ts`: `createDemand` retorna `Promise<{ id: string; ... }>`, faz `if (!response.ok) throw ...` e depois `return response.json()`. |
| 3 | CA1: Teste verifica cabeçalho `Authorization: Bearer <token>`? | ✅ CORRIGIDO | `CreateDemand.test.tsx`: teste "envia cabeçalho Authorization: Bearer <token> ao chamar createDemand" intercepta `fetch`, captura o header e asserenta `toBe('Bearer token-teste')`. |
| 4 | CA1: Teste verifica que o objeto com id é capturado/utilizado? | ✅ CORRIGIDO | `CreateDemand.test.tsx`: após submit, espera `screen.getByTestId('create-demand-created-id')` e `screen.getByText('Demanda criada com ID: dem-1')`. |
| 5 | Tela `/demandas` (detalhe) foi criada? | ✅ CORRIGIDO | Novo arquivo `apps/web/src/features/demands/DemandDetail.tsx` (225 linhas), implementação completa reutilizando `Header` e `Sidebar`, exibindo título, descrição, tipo, prioridade, status, projeto, tarefas e data de criação. |
| 6 | NC-01: `handleSubmit` checa `response.ok` antes de `onClose()`? Não fecha modal em erro HTTP? | ✅ CORRIGIDO | `CreateDemandModal.tsx`: `try/catch` com `apiService.createDemand(form)` (lança erro quando `!response.ok`). `onClose()` só é chamado após sucesso (`setCreatedDemandId(demand.id); onClose();`). Em erro, define `setError()` e NÃO chama `onClose()`. Teste "NC-01: não fecha o modal quando createDemand retorna erro HTTP (ex: 400)" verifica que o modal não fecha e o erro é exibido. |

---

## 2. Detalhe das correções evidenciadas

### 2.1. CA4 — Seletor de Projeto via `GET /projects` (`CreateDemandModal.tsx`)

```tsx
useEffect(() => {
  let cancelled = false;
  async function loadProjects() {
    setProjectsLoading(true);
    try {
      const response = await apiService.request('/projects');
      if (!response.ok) {
        throw new Error(`Falha ao carregar projetos: ${response.status}`);
      }
      const { data } = (await response.json()) as { data: Project[] };
      // ...
      setProjects(data);
      // ...
    } catch {
      // ...
    } finally {
      setProjectsLoading(false);
    }
  }
  loadProjects();
  return () => { cancelled = true; };
}, [form.projectId]);
```

Renderiza:
```tsx
<select data-testid="create-demand-select-project" ...>
  <option value="">Escolha um Projeto</option>
  {projects.map((project) => (
    <option key={project.id} value={project.id}>{project.name}</option>
  ))}
</select>
```

### 2.2. CA1 — `apiService.createDemand` retorna objeto com `id` (`apiService.ts`)

```ts
async createDemand(data: {...}): Promise<{ id: string; title: string; ... }> {
  const response = await this.request('/demandas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Falha ao criar Demanda: ${response.status}`);
  }
  return response.json();
},
```

### 2.3. CA1 — Teste verifica objeto com id capturado (`CreateDemand.test.tsx`)

```tsx
await waitFor(() => {
  expect(screen.getByTestId('create-demand-created-id')).toBeInTheDocument();
  expect(screen.getByText('Demanda criada com ID: dem-1')).toBeInTheDocument();
});
```

### 2.4. NC-01 — `handleSubmit` não fecha modal em erro (`CreateDemandModal.tsx`)

```ts
try {
  const demand = await apiService.createDemand(form);
  setSubmitting(false);
  setCreatedDemandId(demand.id);
  onClose();   // ← só após sucesso
} catch (err) {
  setSubmitting(false);
  const message = err instanceof Error ? err.message : 'Não foi possível criar a Demanda.';
  setError(message);   // ← não chama onClose()
}
```

---

## 3. Conclusão

A Tarefa 12 está integralmente conforme aos critérios de aceite CA1, CA2 e CA4, e o defeito NC-01 foi eliminado. Nenhuma não-conformidade restante foi encontrada no escopo da revisão.

**APROVADO.**