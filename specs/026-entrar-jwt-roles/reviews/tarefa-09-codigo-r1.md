# Parecer de Código — Tarefa 9

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

Não há violação de camada declarada no `docs/architecture.md`, nenhum segredo/URL de ambiente no código de produção, nenhum tratamento de erro que engula falha, nenhuma abstração para um caso só e nenhuma duplicação de regra. O que está no diff e nos arquivos novos do working tree (`features/auth/`) respeita a régua.

## Evidências da aprovação (baseadas no diff e nos arquivos novos do working tree)

- **Camada de serviço única (`apiService`) intacta — CA5/CA6:** `apps/web/src/features/auth/apiService.ts:10-15` — `request()` é o único ponto de entrada de chamadas à API; lê o token de `localStorage` a cada chamada e anexa `Authorization: Bearer <token>` (CA5); ao receber `401`, limpa o token e redireciona para `/login` em um só lugar (CA6).
- **`App.tsx` não acessa `fetch` diretamente (ID6):** `apps/web/src/App.tsx` consome `apiService.request('/api/admin/ping')` dentro de `AdminPing`; não há chamada direta a `fetch` no componente.
- **RBAC no `Menu` (Developer vs Admin):** `apps/web/src/features/auth/Menu.tsx:30-31` — itens de Admin só renderizam quando `role === 'Admin'`; Desenvolvedor não os vê. Coberto por testes em `Menu.test.tsx` (ambos os papéis + itens comuns).
- **Estrutura `src/features/` (seção 2.2):** `apps/web/src/features/auth/` existe com `apiService.ts`, `Login.tsx`, `Menu.tsx` (mais seus respectivos `.test.ts/.test.tsx`), conforme previsto na Tarefa 9.
- **Testes (seção 7):** `vitest.config.ts` usa `environment: 'jsdom'`, `setupFiles: ['./src/setupTests.ts']` com `@testing-library/jest-dom`; os testes usam Vitest + React Testing Library (`render`, `screen`) e `jest-dom` matchers. Scripts `test`, `test:watch`, `test:cov` presentes em `package.json`.
- **Arquivos fora dos previstos:** somente `package.json` (adição de `react-router-dom`, justificada pelo React Router) e `package-lock.json`, além dos previstos `App.tsx`, `main.tsx` e `features/auth/`. `setupTests.ts` é exigido pela seção 7; `smoke.test.ts` é teste de apoio inofensivo. Nenhum arquivo de `apps/api`, `specs/` ou `docs/` foi tocado.
- **Nenhum segredo/URL de ambiente no código de produção:** `apiService.ts` não hardcoda URL (recebe `input`); a URL `localhost:3000` aparece apenas no teste (`apiService.test.ts`), sem ser segredo.

## Sugestões (não bloqueiam)

1. **Ciclo de importação entre módulos:** `apps/web/src/main.tsx` importa `App` e exporta `useAuth`; `apps/web/src/App.tsx` importa `useAuth` de `./main.tsx`. Embora funcione em Vite/ESM (o símbolo é usado só em runtime dentro de componentes), é um ciclo de dependência de módulos. Sugestão: extrair `AuthContext`/`useAuth` para um módulo separado (ex.: `src/features/auth/authContext.ts` ou futuro `src/app/providers/AuthProvider.tsx`) para quebrar o ciclo. Não é bloqueante.

2. **Estrutura `src/app/providers/` e `src/app/router/` (seção 2.2):** o `AuthProvider` está embutido em `main.tsx` e as rotas em `App.tsx`, enquanto a architecture declara `src/app/providers/` (AuthProvider, ThemeProvider) e `src/app/router/` (React Router v6 + lazy loading por feature). Como a Tarefa 9 prevê apenas `App.tsx`, `main.tsx` e `features/auth/`, não bloqueia esta entrega; sugere-se migrar quando essas pastas forem criadas.

3. **Versão do React Router:** `apps/web/src/package.json:18` instala `react-router-dom@^7.18.6`, enquanto a architecture (seção 1, stack) declara "React Router v6". Divergência de versão da stack declarada, sem impacto funcional nesta tarefa. Sugestão: alinhar à v6 declarada ou atualizar a `architecture.md`.

## Observações fora do escopo deste diff

- Não foi possível executar `npm run test`, `npm run typecheck` e `npm run lint` (o ambiente rejeitou o shell); o parecer se baseia em leitura estática do diff e dos arquivos novos do working tree (`features/auth/`), que são parte essencial da Tarefa 9 (App.tsx e main.tsx importam deles).
- `.gitignore` ainda não existe (architecture seção 8 menciona que será criado na Entrega 2) — fora do escopo da Tarefa 9, não é ponto desta revisão.

---

**Justificativa resumida:** a Tarefa 9 conecta `apiService` (única camada de serviço, CA5/CA6), `Login` e `Menu` com RBAC respeitado ao `App.tsx`/`main.tsx`, sem `fetch` direto no componente, com estrutura `features/auth/` e testes Vitest + RTL + jsdom + jest-dom, alterando apenas os arquivos previstos mais `package.json`/`package-lock.json` (react-router-dom justificado). Não há apontamentos bloqueantes.
