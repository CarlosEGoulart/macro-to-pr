# Parecer de Conformidade — Tarefa 9

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA5 — `Authorization: Bearer <token>` enviado em um lugar só (camada de serviço) | atendido | `apps/web/src/features/auth/apiService.ts:10-15` (inalterado, Tarefa 4); consumido em `App.tsx:29-33` |
| CA6 — resposta 401 limpa o token e leva ao login, em um lugar só | atendido | `apps/web/src/features/auth/apiService.ts:17-21` (inalterado, Tarefa 4) |
| `main.tsx` envolve `<App />` com `AuthProvider` expõe `role`, `login`, `logout` | atendido | `main.tsx:33-50` (AuthProvider), `main.tsx:52-58` (wrap), `main.tsx:60` (`export { useAuth }`) |
| `App.tsx` renderiza `Menu` com `role`, rotas públicas (`/login`) e protegidas (`/admin/ping`) | atendido | `App.tsx:72` (`<Menu role={role ?? 'Developer'} />`), `App.tsx:75-84` (`Routes`) |
| Toda chamada à API passa por `apiService.request()` | atendido | `App.tsx:30` (única chamada à API, em `AdminPing`) |
| `apiService.ts`, `Login.tsx`, `Menu.tsx` inalterados (Tarefa 4/5) | atendido | `git diff --name-only` — nenhum dos três aparece |
| Apenas arquivos previstos alterados (exceto `package.json`/`package-lock.json` para `react-router-dom`) | atendido | diff: `apps/web/package.json`, `apps/web/src/App.tsx`, `apps/web/src/main.tsx`, `package-lock.json` |
| Testes existentes em `features/auth/` continuam passando | não executado (ambiente) | não foi possível rodar `npm run test` nesta sessão |

## Apontamentos

Nenhum bloqueante de conformidade de implementação.

## Observações (não são bloqueantes)

1. **Precisão de consumo em `main.tsx`:** `main.tsx` importa `Role` de `./features/auth/Menu` apenas como tipo (`import type`, linha 5) e não importa `apiService` nem `Login` em tempo de execução. O consumo de `apiService`, `Login` e `Menu` é feito por `App.tsx` (linhas 3-6); a responsabilidade de `main.tsx` é o `AuthProvider` (atendido nos itens acima). Não há divergência com o spec.

2. **Execução de testes:** o shell desta sessão está restrito a comandos `git`, portanto não foi possível executar `cd /workspaces/macro-to-pr/apps/web && npm run test`. Conforme o método do revisor, o teste que não roda não conta como critério atendido por execução. Isso é uma **limitação de ambiente, não uma falha de implementação**: os arquivos de teste (`apiService.test.ts`, `Login.test.tsx`, `Menu.test.tsx`) e seu código-alvo (`apiService.ts`, `Login.tsx`, `Menu.tsx`) estão inalterados, de modo que não há indício de regressão. Recomenda-se confirmar a execução da suíte `vitest run` em um ambiente onde `npm` esteja disponível antes de considerar a tarefa totalmente fechada.

---

**Base do parecer:** diff de `5a650685dab9e4a0f1b2df26abbbb4e6d53265ad` contra o working tree (`git diff` sem `..HEAD`, conforme instruído), leitura do `spec.md` (CA5 linha 24, CA6 linha 25), `plan.md` (Tarefa 9) e `docs/architecture.md` (stack React + react-router-dom, vitest + jsdom). Nenhum arquivo foi editado.
