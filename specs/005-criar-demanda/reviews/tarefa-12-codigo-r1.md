# Parecer de Revisão de Código — Tarefa 12 (Issue #5 / US03 — Criar Demanda)

**Repositório:** `/workspaces/macro-to-pr` (branch `5-criar-demanda`)
**Diff avaliado:** working tree vs `eaa9862607a665bca5ea2e47362c043c9b12a5fd` (sem `..HEAD`)
**Critérios de aceite ligados:** CA1, CA2, CA4
**Referência:** `docs/architecture.md` e `specs/005-criar-demanda/spec.md`
**Modo:** somente leitura — aponta não-conformidades, nunca corrige

---

## Veredito geral

**NÃO APROVADO** — há 1 não-conformidade bloqueante (NC-01) que viola diretamente CA1 e CA2. Abaixo seguem as verificações obrigatórias, a não-conformidade com evidência, e sugestões não-bloqueantes.

---

## 1. Verificações obrigatórias (conforme arquitetura)

| Verificação | Status | Evidência |
|---|---|---|
| Teste primeiro `CreateDemand.test.tsx` existe e roda | ✅ | `vitest run` → 5 arquivos / 27 testes passam; `vitest run CreateDemand` → 2/2 passam (CA1 e CA2) |
| `apiService` usa `request()` como único ponto de entrada, sem `fetch` solto nas funções novas | ✅ | `createDemand` e `createProject` usam `this.request('/demandas', ...)` e `this.request('/projects', ...)` |
| `Header` e `Sidebar` reutilizáveis e exportados | ✅ | `export function Header({ actions })` em `layout/Header.tsx`; `export function Sidebar({ sections })` + `export const defaultSidebarSections` em `layout/Sidebar.tsx` |
| `ProjectsSelect` mantém `data-testid` existentes | ✅ | `data-testid="projects-select-header"` (agora em `Header.tsx`) e `data-testid="projects-select-sidebar"` (agora em `Sidebar.tsx`) mantidos; `projects-select-root` e `projects-select-main` também preservados |
| Colocation por feature | ✅ | Arquivos em `features/demands/`, `features/layout/`, `features/projects/`, `features/auth/` |
| Estilos inline (`style`) + design tokens modo claro | ✅ | Tokens `primaria #6164F1`, `superficie-card #FFFFFF`, `texto #111827`, `texto-suave #6B7280`, `superficie-sidebar #F9FAFB` usados com `style` |

### Evidência — `apiService` sem `fetch` solto nas funções novas
Diff de `apps/web/src/features/auth/apiService.ts`:
```ts
async createDemand(data: {...}): Promise<Response> {
  return this.request('/demandas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
},
async createProject(data: { name: string; repositoryId: string }): Promise<Response> {
  return this.request('/projects', { ... });
},
```
As funções adicionadas pela tarefa 12 reutilizam `request()` (token Bearer via `localStorage` + `API_BASE_URL`). Não há `fetch` solto novo.  
*(Observação: existe um `fetch` solto pré-existente em `handleGitHubCallback`, mas não foi alterado nesta tarefa e foge ao escopo da revisão.)*

### Evidência — `data-testid` mantidos
- `Header.tsx`: `<header data-testid="projects-select-header" style={headerStyle}>`
- `Sidebar.tsx`: `<aside data-testid="projects-select-sidebar" style={sidebarStyle}>`

---

## 2. Não-conformidades

### NC-01 (bloqueante) — `CreateDemandModal.handleSubmit` trata resposta de erro (400/403/500) como sucesso

**Descrição:** Após chamar `apiService.createDemand(form)`, o `.then` executa `setSubmitting(false)` e `onClose()` (fecha o modal) **sem verificar `response.ok` nem o status HTTP**. Como `apiService.request()` só redireciona para login em `401` (e não lança exceção para `400`/`403`/`500`), uma resposta de erro — por exemplo HTTP `400` de campo obrigatório ausente (CA2) ou HTTP `403` de projeto não pertencente (CA3) — seria tratada pelo frontend como criação bem-sucedida, fechando o modal indevidamente.

Isso viola:
- **CA1** — só deve considerar sucesso quando receber o objeto completo com `id` (o componente nem lê o corpo da resposta).
- **CA2** — uma criação impedida pelo backend (400) não pode ser aceita silenciosamente.

**Evidência (diff `apps/web/src/features/demands/CreateDemandModal.tsx`):**
```ts
apiService
  .createDemand(form)
  .then(() => {
    setSubmitting(false);
    onClose();   // ← executa mesmo quando response.ok === false
  })
  .catch(() => {
    setSubmitting(false);
    setError('Não foi possível criar a Demanda. Tente novamente.');
  });
```

Não há checagem de `response.ok`/`response.status` nem leitura do corpo (`await response.json()`) antes de `onClose()`. O `.catch` só captura exceções de rede, não erros HTTP de aplicação.

**Requer correção e nova revisão antes da aprovação.**

---

## 3. Sugestões (não bloqueantes)

| # | Sugestão | Por quê |
|---|----------|---------|
| Sug-01 | Em `CreateDemandModal.tsx`, `tokens.primariaRgba004` **não está definido** no objeto `tokens` desse arquivo (só existe em `Sidebar.tsx`). A expressão `tokens.primariaRgba004 ?? '#C7D2FE'` mascara o problema, mas é referência a token inexistente — risco de cópia indevida / bug latente se o `??` for removido. | Consistência de design tokens. |
| Sug-02 | `createDemand` / `createProject` retornam `Promise<Response>`, enquanto `developerProfile` já retorna dados parseados (`{ id, name, ... }`). Inconsistência na camada de serviço. | Padronizar a camada de API facilita o consumo nos componentes. |
| Sug-03 | `package.json` de `apps/web` **não declara o script `typecheck`** (`tsc --noEmit`) exigido pela `architecture.md` (seção 7). Não foi alterado pela tarefa 12 (pré-existente), mas o comando `npm run typecheck` não funciona como declarado. | Conformidade com o contrato de scripts da arquitetura. |
| Sug-04 | Não há teste dedicado para `CreateProjectModal` nem para a listagem de projetos via `GET /projects` (CA4), apesar de o `plan.md` da tarefa 12 mencioná-los. O escopo de arquivos lista apenas `CreateDemand.test.tsx`. | CA4 fica sem cobertura de teste direta. |
| Sug-05 | Em `ProjectsSelect.tsx`, `CreateProjectModal` é renderizado com `repositories={[]}`, então o seletor "Repositório" fica sem opções. | Limitação funcional da criação de Projeto. |

---

## 4. Observações sobre escopo

- O texto da tarefa menciona "tela `/demandas` (detalhe)", mas nenhum arquivo de tela/detalhe de demanda foi adicionado. O `plan.md` atualizado justifica que a criação ocorre via modal em `/projects` e que a seção de Demandas é sincronizada dentro de `/projects`. Não é não-conformidade contra o plano vigente, mas vale manter alinhado com o spec/plano se houver tela separada prevista.
- O `typecheck` não pôde ser executado neste ambiente (o shell rejeitou o comando `tsc` com `permission.rejected`); portanto, não há evidência de erro de tipos estáticos. Isso é uma limitação de ambiente, não do código.

---

## 5. Conclusão

A tarefa 12 está **substantivamente conforme** a arquitetura (feature folders, cliente único `request()` sem `fetch` novo, componentes reutilizáveis exportados, `data-testid` preservados, estilos inline, tokens modo claro, teste primeiro rodando).

Contudo, a **NC-01** impede a aprovação: o modal trata respostas de erro HTTP como sucesso, violando CA1 e CA2. Após a correção de `CreateDemandModal.handleSubmit` (checar `response.ok`/status e ler o corpo da resposta antes de `onClose()`), o trabalho deve ser re-enviado a esta mesma revisão.