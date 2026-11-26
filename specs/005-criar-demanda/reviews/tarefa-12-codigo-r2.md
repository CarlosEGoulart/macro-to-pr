# Parecer de Código — Tarefa 12 (rodada 2)

**Repositório:** `/workspaces/macro-to-pr` (branch `5-criar-demanda`, Issue #5)
**Diff avaliado:** working tree vs `eaa9862607a665bca5ea2e47362c043c9b12a5fd` (sem `..HEAD`)
**Critérios de aceite ligados:** CA1, CA2, CA4
**Referência:** `docs/architecture.md` e `specs/005-criar-demanda/spec.md`
**Modo:** somente leitura — aponta não-conformidades, nunca corrige

---

## Veredito geral

**APROVADO**

A NC-01 foi corrigida e todo o restante do diff está conforme a arquitetura declarada em `docs/architecture.md`.

---

## 1. Verificação obrigatória — NC-01 (rodada 1)

**NC-01 foi corrigido.** O `handleSubmit` do `CreateDemandModal` agora checa `response.ok` (via `apiService.createDemand`) antes de `onClose()`, e **não fecha o modal em erro HTTP**.

Evidência — `apps/web/src/features/auth/apiService.ts` (diff):
```ts
async createDemand(data: {...}): Promise<{...}> {
  const response = await this.request('/demandas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Falha ao criar Demanda: ${response.status}`);  // ← lança em 400/403/500
  }
  return response.json();
},
```

Evidência — `apps/web/src/features/demands/CreateDemandModal.tsx` (diff):
```ts
try {
  // CA1: createDemand retorna o objeto completo com o `id` gerado
  const demand = await apiService.createDemand(form);
  setSubmitting(false);
  setCreatedDemandId(demand.id);
  onClose();   // ← só executa quando response.ok === true
} catch (err) {
  // NC-01: não fecha o modal em caso de erro HTTP (400, 403, 500, etc.)
  setSubmitting(false);
  const message = err instanceof Error ? err.message : 'Não foi possível criar a Demanda.';
  setError(message);  // ← exibe erro, mantém modal aberto
}
```

Há também teste dedicado cobrindo o cenário ("NC-01: não fecha o modal quando createDemand retorna erro HTTP (ex: 400)" em `CreateDemand.test.tsx`).

## 2. Verificações obrigatórias contra docs/architecture.md

| Verificação | Status | Evidência |
|---|---|---|
| Feature folders colocation | ✅ | Arquivos em `features/demands/`, `features/layout/`, `features/projects/`, `features/auth/` |
| Cliente de API único `request()`, sem `fetch` solto nos componentes | ✅ | `createDemand`/`createProject` usam `this.request()`; componentes usam `apiService.*`; nenhum `fetch` direto em `.tsx` novos |
| `Header` e `Sidebar` reutilizáveis, exportados, importados (não recriados inline) | ✅ | `ProjectsSelect.tsx` importa `{ Header }` e `{ Sidebar, defaultSidebarSections }` de `../layout/`; `DemandDetail.tsx` idem |
| `data-testid` preservados | ✅ | `projects-select-header` (em `Header.tsx`), `projects-select-sidebar` (em `Sidebar.tsx`), `projects-select-root`, `projects-select-main` mantidos |
| Estilos inline (`style`) | ✅ | Todos os componentes novos usam `style` |
| Design tokens modo claro (spec.md) | ✅ | `primaria #6164F1`, `superficieCard #FFFFFF`, `texto #111827`, `textoSuave #6B7280`, `superficieSidebar #F9FAFB` |
| Teste primeiro rodando (Vitest + RTL + user-event + jsdom) | ✅ | `CreateDemand.test.tsx` cobre CA1, CA2, CA4 e NC-01 |

## 3. Não-conformidades restantes

Nenhuma não-conformidade bloqueante foi identificada. A NC-01 (única apontada na rodada 1) está corrigida, e todas as demais regras da arquitetura são respeitadas no diff avaliado.

## 4. Sugestões (não bloqueantes)

| # | Sugestão | Por quê |
|---|----------|---------|
| Sug-01 | `apiService.createProject` retorna `Promise<Response>` (bruto), enquanto `createDemand` já retorna dados parseados (`response.json()`). | Inconsistência na camada de serviço; padronizar facilita o consumo nos componentes. |
| Sug-02 | `CreateDemandModal.tsx` referencia `tokens.primariaRgba004` no botão submit, mas esse token **não existe** no objeto `tokens` daquele arquivo (só existe em `Sidebar.tsx`). Está mascarado por `?? '#C7D2FE'`. | Risco de cópia indevida / bug latente se o `??` for removido. |
| Sug-03 | `CreateDemandModal` chama `apiService.request('/projects')` diretamente para carregar projetos, em vez de um método dedicado (ex.: `getProjects()`). | Funciona porque `request()` é o ponto único, mas é menos consistente com `createDemand`/`createProject`. |
| Sug-04 | `ProjectsSelect` renderiza `CreateProjectModal` com `repositories={[]}`, deixando o select "Repositório" sem opções. | Limitação funcional da criação de Projeto via modal. |
| Sug-05 | Não há teste dedicado para `CreateProjectModal` nem cobertura direta de CA4 (listagem de projetos via `GET /projects`) fora do teste do modal de demanda. | CA4 fica com cobertura indireta apenas. |
| Sug-06 | `package.json` de `apps/web` não declara o script `typecheck` (`tsc --noEmit`) exigido pela `architecture.md` (seção 7). | Pré-existente, não alterado pela tarefa 12, mas `npm run typecheck` não funciona como declarado. |

## 5. Observações fora do escopo deste diff

- `apps/web/src/assets/hero.png` aparece no diff como alterado (binário 13057 → 0 bytes), mas não faz parte dos arquivos de escopo da tarefa 12 e não foi avaliado.
- O `typecheck` não pôde ser executado neste ambiente (comando rejeitado), portanto não há evidência de erro de tipos estáticos — limitação de ambiente, não do código.

---

**Conclusão:** A tarefa 12 está **APROVADA**. A NC-01 foi corrigida (`handleSubmit` não fecha o modal em erro HTTP; `apiService.createDemand` lança em `!response.ok`), e todo o restante do diff está conforme a arquitetura declarada em `docs/architecture.md` (pastas de feature, cliente único `request()`, componentes reutilizáveis importados, `data-testid` preservados, estilos inline, tokens do modo claro). As sugestões acima são não-bloqueantes e não impedem a aprovação.