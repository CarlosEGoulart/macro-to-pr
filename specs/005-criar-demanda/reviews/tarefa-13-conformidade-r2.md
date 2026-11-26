# Parecer de Conformidade — Tarefa 13 (rodada 2)

**Veredito: APROVADO**

---

## 1. Veredito geral

Todas as exigências da Tarefa 13 estão implementadas e cobertas por testes que passam. Não há não-conformidade. O apontamento pendente da rodada 1 (NC-01) foi devidamente resolvido na rodada 2. Não houve regressão nos critérios de aceite ligados (CA2, CA3) e não houve alteração fora do escopo da tarefa.

Comando de diff usado: `git diff 031e39d980bf922587dec9153c32c347d7ed400a` (working tree vs SHA base).
Comando de testes: `cd apps/web && npx vitest run` → **5 arquivos, 39 testes, todos passando** (sem falhas).

---

## 2. Critérios verificados

| Critério / Cenário | Situação | Onde |
|---|---|---|
| CA2 — dados obrigatórios vazios → criação impedida (HTTP 400) e informe qual campo | atendido | `CreateDemandModal.tsx:294-313` (validação de campo com mensagem específica); `apiService.ts:133-142` (400 lança `ApiError` com mensagem do corpo); `CreateDemandModal.tsx:71-72` (case 400 → "Campo inválido. Verifique os dados preenchidos."). Teste: `CreateDemand.test.tsx:361` |
| CA3 — Projeto que não pertence ao desenvolvedor → 403 e informe sem permissão | atendido | `CreateDemandModal.tsx:73-74` (case 403 → "Sem permissão para criar uma Demanda neste Projeto."). Teste: `CreateDemand.test.tsx:398` |
| /login — resposta 401 (credenciais inválidos) exibe "e-mail ou senha inválidos" | atendido | `Login.tsx:440-444` (`error === 'invalid_credentials'` → `setLoginError('e-mail ou senha inválidos')` + `return`). Teste: `Login.test.tsx:164` |
| /login — erro de rede exibe mensagem de conexão | atendido | `Login.tsx:460-462` (catch do `authGitHub` → `setLoginError('Erro de conexão com o servidor…')`). Teste: `Login.test.tsx:149` |
| /projects — GET /projects sem token → 401 limpa token e redireciona para /login | atendido | `apiService.ts:43-47` (`request()` trata 401 globalmente: `removeItem('token')` + `window.location.href = '/login'`). Teste: `ProjectsSelect.test.tsx:120` |
| /projects — erro de rede exibe mensagem de conexão | atendido | `ProjectsSelect.tsx:464-467` (`isNetworkError` → "Erro de conexão com o servidor…"). Teste: `ProjectsSelect.test.tsx:131` |
| /demandas — resposta 403 → exibe "sem permissão" | atendido | `CreateDemandModal.tsx:73-74`. Teste: `CreateDemand.test.tsx:398` |
| /demandas — resposta 400 → exibe campo inválido | atendido | `CreateDemandModal.tsx:71-72`. Teste: `CreateDemand.test.tsx:361` |
| /demandas — resposta 401 → limpa token e redireciona para /login | atendido | `apiService.ts:43-47` + `CreateDemandModal.tsx:75-78` (status 401 exibe mensagem do corpo). Teste: `CreateDemand.test.tsx:435` |
| /demandas — erro de rede → exibe mensagem de conexão | atendido | `apiService.ts:126-131` (rede → `ApiError` status `null`) + `CreateDemandModal.tsx:81-83` (sem resposta → "Erro de conexão…"). Teste: `CreateDemand.test.tsx:475` |

---

## 3. Escopo (arquivos alterados vs previstos da Tarefa 13)

Arquivos previstos no `plan.md` vs alterados no diff:

| Previsto no plan.md | Status no diff | Observação |
|---|---|---|
| `apps/web/src/features/auth/apiService.ts` | ✅ alterado | Acrescentou `ApiError` e tratamento de rede/400/403/401 em `createDemand` |
| `apps/web/src/features/auth/Login.tsx` | ✅ alterado | `useEffect` lê `?error=invalid_credentials`; `handleAuthorizeClick` trata rede |
| `apps/web/src/features/projects/ProjectsSelect.tsx` | ✅ alterado | Catch distingue rede (mensagem de conexão) de HTTP; 401 tratado globalmente por `request()` |
| `apps/web/src/features/demands/CreateDemand.tsx` | ✅ (como `CreateDemandModal.tsx`) | O plano cita `CreateDemand.tsx`, mas o componente real da tarefa é `CreateDemandModal.tsx` (existe na pasta, não há `CreateDemand.tsx`). Mesma responsabilidade, nome diferente no plano — não é alteração fora de escopo |

Arquivos de teste também alterados (necessários ao "Teste primeiro" da tarefa, dentro do escopo):
- `apps/web/src/features/auth/Login.test.tsx`
- `apps/web/src/features/demands/CreateDemand.test.tsx`
- `apps/web/src/features/projects/ProjectsSelect.test.tsx`

**Não há arquivos alterados fora da Tarefa 13.** Escopo respeitado. (A única mudança incidental não-relacionada a erro, dentro de `CreateDemandModal.tsx:114-117`, é uma reescrita de estilo inline equivalente — sem impacto de comportamento e dentro do arquivo da tarefa.)

---

## 4. Não-conformidades

Nenhuma. Não há critério de aceite não atendido, não há teste que não prove o que diz prover, não há comportamento não pedido pela spec, não há divergência de glossário de `docs/architecture.md`, e não há abandono de caso (401/403/400/rede) sem tratamento nas três rotas.

---

## 5. Linha específica sobre o NC-01

**NC-01: RESOLVIDO.** O apontamento da rodada 1 (`/login` — resposta 401 deve exibir "e-mail ou senha inválidos"; não implementado e não testado) foi corrigido na rodada 2:
- Implementação: `Login.tsx:440-444` define `setLoginError('e-mail ou senha inválidos')` quando `error === 'invalid_credentials'` e retorna (sem redirecionar, sem fluxo de e-mail/senha).
- Teste: `Login.test.tsx:164` simula o callback `?error=invalid_credentials` e afirma que `data-testid="login-error"` aparece com o texto exato `'e-mail ou senha inválidos'`. O teste passa (suite `Login — tela de acesso com design tokens` → 39 testes globais verdes).
