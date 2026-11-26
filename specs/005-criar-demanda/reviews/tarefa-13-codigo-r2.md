# Parecer de Código — Tarefa 13 (rodada 2)

**Veredito: APROVADO** — sem não-conformidade bloqueante.

O diff da Tarefa 13 implementa o tratamento de erros (400 / 401 / 403 / rede) de forma consistente em `/login`, `/projects` e `/demandas`, respeitando as regras de `docs/architecture.md` (único ponto de entrada `request()`, distinção de erros, `data-testid`, estilos inline com tokens locais e colocation por feature). A resolução do NC-01 (Login) também respeita a arquitetura.

---

## Verificações obrigatórias

| Verificação | Status | Evidência (diff) |
|---|---|---|
| `request()` único ponto de entrada, sem `fetch` solto novo nos arquivos alterados | **CONFORME** | `apiService.ts`: `createDemand` chama `this.request('/demandas', ...)` (diff l.119-145); `request()` (l.32-49) é o único ponto com `fetch`. `Login.tsx` usa `apiService.authGitHub()` (sem fetch). `CreateDemandModal.tsx` usa `apiService.createDemand`. `ProjectsSelect.tsx` usa `apiService.request('/projects')` (l.450). Nenhum `fetch` solto novo adicionado nos arquivos-fonte alterados. (`fetch` em `handleGitHubCallback` l.68 é pré-existente, intocado pelo diff.) |
| Erros distinguem 400 / 401 / 403 / rede | **CONFORME** | `apiService.ts`: lança `ApiError(message, response.status)` para HTTP (400/401/403) e `ApiError(..., null)` para rede (catch em `createDemand`); `request()` trata 401 globalmente — remove token e redireciona `/login` (l.43-47, CA6). `CreateDemandModal.tsx`: `mensagemDeErroParaUsuario` faz `switch` — `400` → 'Campo inválido...', `403` → 'Sem permissão...', default (401/outros) → corpo da resposta, não-`ApiError` (rede) → 'Erro de conexão...'. `ProjectsSelect.tsx`: rede detectada via `TypeError`/`failed to fetch` → conexão; 401 por `request()`. `Login.tsx`: `?error=invalid_credentials` → 'e-mail ou senha inválidos'; rede em `authGitHub` → conexão. |
| `data-testid` preservados | **CONFORME** | `Login.tsx`: `data-testid="login-error"` (novo span de erro). `CreateDemandModal.tsx`: `data-testid="create-demand-error"` (mantido). `ProjectsSelect.tsx`: `data-testid="projects-select-error"` (mantido). Os testes afirmam sobre esses testids. |
| Estilos inline (`style={...}` com `CSSProperties`), tokens locais | **CONFORME** | `Login.tsx` span de erro usa `style={{ fontFamily: tokens.font, fontWeight: '400', fontSize: 12, color: tokens.perigo, marginTop: tokens.sm, lineHeight: '1.4' }}`; token `perigo: '#DC2626'` adicionado (diff l.22). Demais componentes mantêm estilo inline com `CSSProperties` e `tokens` locais. |
| Colocation por feature | **CONFORME** | Todos os arquivos-fonte alterados ficam em `apps/web/src/features/{auth,projects,demands}/`: `apiService.ts`, `Login.tsx`; `ProjectsSelect.tsx`; `CreateDemandModal.tsx`. |

---

## Linha específica sobre o NC-01 (resolução em Login.tsx + Login.test.tsx)

**RESPEITA A ARQUITETURA.**

- `Login.tsx`: o `useEffect` que lê `?token=` agora também lê `?error=`; quando `error === 'invalid_credentials'`, define `setLoginError('e-mail ou senha inválidos')` e retorna (não prossegue para fluxo de e-mail/senha, que não existe nesta tela).
- Estilo inline com tokens locais (`tokens.perigo`, `tokens.font`, `tokens.sm`); `data-testid="login-error"` preservado/usado; colocation em `features/auth/`; não introduz `fetch` solto (usa `apiService.authGitHub()`); não engole o erro silenciosamente — exibe a mensagem.
- `Login.test.tsx`: novo teste com `?error=invalid_credentials` afirmando que `data-testid="login-error"` aparece com o texto exato `'e-mail ou senha inválidos'`, além do teste de erro de rede exibindo mensagem de conexão.
- O NC-01 do relatório de conformidade (`/login` 401 deve exibir "e-mail ou senha inválidos") está resolvido e não há não-conformidade bloqueante nesta resolução.

---

## Sugestões (não-bloqueantes, não afetam o veredito)

1. **Mensagem genérica após 401 em `ProjectsSelect.tsx`**: `request()` já limpa token e redireciona para `/login` em 401, mas o `catch` seguinte ainda define `error = 'Falha ao carregar projetos: 401'` antes da navegação. Funcionalmente inofensivo (o redirect ocorre), mas a mensagem é genérica; poderia-se pular o `setError` após 401 ou exibir mensagem de sessão expirada. Não bloqueante.
2. **String de conexão duplicada**: o texto 'Erro de conexão com o servidor. Verifique sua internet e tente novamente.' aparece em `apiService.ts`, `CreateDemandModal.tsx`, `Login.tsx` e `ProjectsSelect.tsx`. Poderia ser centralizada em uma constante/token compartilhada. Não bloqueante.
3. **Nome do arquivo no plan.md**: o plano prevê `CreateDemand.tsx`, mas o componente entregue (e testado em `CreateDemand.test.tsx`) é `CreateDemandModal.tsx`. Apenas divergência de nome; a colocation e a responsabilidade estão corretas.

---

## Observações fora do escopo (pré-existentes, não tocadas pelo diff)

- `apiService.handleGitHubCallback` usa `fetch` direto (l.68-70) — código pré-existente, não alterado nesta tarefa.
- `request()` retorna a resposta 401 após redirecionar (não lança), de modo que chamadores (`developerProfile`, `ProjectsSelect`) também reagem ao 401 — padrão pré-existente (CA6), não introduzido por este diff.
- A API client fica em `features/auth/apiService.ts` (colocation por feature) em vez de `shared/api/` — padrão pré-existente, não regressão deste diff.
- Execução de testes (`npx vitest run`) não pôde ser rodada neste ambiente por restrição de shell; a avaliação baseia-se na leitura completa do diff, que evidencia conformidade com a arquitetura.

---

**Conclusão:** sem não-conformidade bloqueante. **APROVADO.**
