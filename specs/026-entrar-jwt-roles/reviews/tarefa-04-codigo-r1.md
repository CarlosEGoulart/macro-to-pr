# 📋 Parecer de Revisão de Código — Tarefa 4 (US26 / CA5)

**Revisor:** `revisor-codigo` (somente leitura — aponta, não corrige)
**Base de comparação:** working tree vs commit `050a6d970553364c040417e2dfd0c75b14f691e2`
**Régua:** `docs/architecture.md` (seções 2.2, 7, ID6) + `specs/026-entrar-jwt-roles/spec.md` (CA5)
**Arquivos no diff:** 2 arquivos novos, 0 modificados, 0 removidos

---

## 1. Veredito final

**APROVADO**

Contra o `docs/architecture.md`, a camada de serviço da Tarefa 4 está corretamente implementada, localizada, testada e isenta de segredos hardcoded. Não há apontamento bloqueante que viole a arquitetura declarada.

Há uma sugestão não bloqueante (ver seção 4) relacionada à *injeção* da camada no aplicativo, prevista no `plan.md` mas ausente do diff.

---

## 2. Evidências de conformidade (architecture.md)

### 2.1 Seção 2.2 — estrutura `apps/web/` ✅

O `plan.md` (Tarefa 4) prevê a camada de serviço única em `apps/web/src/features/auth/`. O diff confirma:

- `apps/web/src/features/auth/apiService.ts` (novo) — camada de serviço única, dentro de `features/auth/`, conforme a colocation de `src/features/` declarada na seção 2.2 (`features/` → `auth/`, `projects/`, …).

Padrão respeitado: **sim**.

### 2.2 Seção 7 — Testes Web (Vitest + jsdom + RTL/jest-dom) ✅

`apps/web/vitest.config.ts`:
```
environment: 'jsdom'
setupFiles: ['./src/setupTests.ts']
```
`apps/web/src/setupTests.ts`:
```
import '@testing-library/jest-dom';
```
→ corresponde à stack declarada na seção 7 (Vitest + jsdom + `@testing-library/jest-dom`).

Resultado da execução:
```
Test Files  2 passed (2)
Tests  4 passed (4)
```
Os 4 testes da camada de serviço passam. A suíte usa Vitest com jsdom (não há necessidade de React Testing Library aqui porque `apiService.request` é uma função pura de `fetch`, não um componente React — o uso de RTL não é obrigatório para testes de camada de serviço).

Padrão respeitado: **sim**.

### 2.3 ID6 — separação estrita de camadas ✅

`apiService.ts` usa `fetch` nativo do navegador e `localStorage`. Não acessa Prisma, não importa nada do backend (`apps/api`), não quebra separação de camadas (é frontend).

Padrão respeitado: **sim**.

### 2.4 CA5 / Nenhum segredo hardcoded ✅

- Token lido de `localStorage.getItem('token')` a **cada** chamada (não está em variável fixa, não está no código).
- Cabeçalho `Authorization: Bearer <token>` definido em um único ponto (`apiService.request`), atendendo CA5 ("em um lugar só").
- Quando não há token, nenhum cabeçalho de auth é adicionado (teste cobre esse caso).

Padrão respeitado: **sim**.

---

## 3. Apontamentos bloqueantes

**Nenhum.** Não há violação do `docs/architecture.md` nem do `spec.md` no que tange à Tarefa 4 (CA5).

---

## 4. Sugestões não bloqueantes (opcional)

### 4.1 Camada de serviço não está injetada/ligada ao aplicativo

O `plan.md` (Tarefa 4) lista como arquivos previstos: `apps/web/src/features/auth/` (camada de serviço única) **e** `apps/web/src/main.tsx` ou layout (injeção da camada).

Evidência do diff: apenas `apiService.ts` e `apiService.test.ts` foram criados. `apps/web/src/main.tsx` está **inalterado** (linhas 1–10, sem import/uso de `apiService`), e nenhum layout foi modificado.

Consequência: o teste comprova CA5 em isolamento, mas nenhuma chamada real da aplicação passa atualmente por `apiService.request`. A camada existe e está correta, mas não está conectada ao ponto de entrada da aplicação.

**Sugestão (não bloqueante para este parecer):** importar/wirar `apiService` (ou um wrapper que o exponha via TanStack Query / fetch interceptor) em `main.tsx`, `App.tsx`, `app/providers/` ou `app/layout/`, de modo que todas as chamadas da aplicação sejam forçadas a passar pela camada única e CA5 seja efetiva em runtime, não só coberto por teste unitário.

Não há padrão do `architecture.md` que seja violado por isso; trata-se de completude do fluxo previsto no `plan.md`.

---

## 5. Resumo para o autor

| Critério | Status | Evidência |
|---|---|---|
| Camada em `features/auth/` | ✅ | `apps/web/src/features/auth/apiService.ts` |
| Token de `localStorage`, sem segredo hardcoded | ✅ | `localStorage.getItem('token')` em `apiService.request` |
| `Authorization: Bearer <token>` em ponto único | ✅ | `headers.set('Authorization', ...)` (CA5) |
| Separação de camadas (fetch, sem Prisma) | ✅ | `apiService.ts` usa apenas `fetch` |
| Testes Vitest + jsdom + jest-dom | ✅ | `vitest.config.ts` (`environment: 'jsdom'`, `setupTests.ts`); 4/4 passando |
| Injeção em `main.tsx`/layout | ⚠️ não feito | `main.tsx` inalterado (sugestão, não bloqueio) |

**Conclusão:** APROVADO. A entrega da Tarefa 4 cumpre CA5 e respeita a régua estrutural do `docs/architecture.md`. Recomenda-se apenas ligar a camada ao ponto de entrada da aplicação para que o token seja enviado em chamadas reais, não apenas coberto por teste.
