# Parecer de Código — Tarefa 5

**Veredito:** APROVADO

## Justificativa (baseada no diff)

- **Estrutura (seção 2.2 de `architecture.md`):** todos os arquivos ficam em `apps/web/src/features/auth/` — `Login.tsx`, `Menu.tsx`, `apiService.ts` e seus testes — conforme previsto no plan.md ("camada de serviço (mesma da Tarefa 4)", `features/auth/` ou layout do menu) e na régua de pastas de feature do frontend.
- **Testes (seção 7):** Vitest + React Testing Library, ambiente `jsdom`, `@testing-library/jest-dom` carregado via `src/setupTests.ts`. O comando liberado `npm run test` passa: **4 arquivos, 9 testes, todos verdes**. As consultas são semânticas (`getByRole`, `getByText`), não estão acopladas a detalhes de implementação.
- **ID6 / CA6 — separação estrita de camadas:** o tratamento de 401 está exclusivamente na camada de serviço (`apiService.request`, `apps/web/src/features/auth/apiService.ts:17-21`): remove o token do `localStorage` e redireciona para `/login`. Não está espalhado por componentes, respeitando o "em um lugar só" do CA6.
- **RBAC no frontend:** `Menu.tsx` renderiza itens de Admin apenas quando `role === 'Admin'` (`apps/web/src/features/auth/Menu.tsx:33-39`); o Desenvolvedor não vê "Painel Admin" nem "Gerenciar Usuários", coberto por `Menu.test.tsx`.
- **Segredos:** nenhum segredo, chave ou URL de ambiente hardcoded no diff.
- **Não engole falha silenciosamente:** o 401 é tratado explicitamente (limpa token + redireciona), não é silenciado.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

- `apiService` mistura cliente HTTP com efeito colateral de navegação (`window.location.href = '/login'`). É justificado pelo CA6 ("em um lugar só"), mas acopla a camada de serviço ao browser. Se quiser evitar esse acoplamento sem espalhar o 401 por componentes, avalie delegar a navegação via evento/callback — a opção atual é coerente com o requisito de ponto único, então mantida como está.
- O `architecture.md` (seção 2.2) declara `shared/api/` como local do API client; o `apiService` vive em `features/auth/` (herdado da Tarefa 4). Não é uma violação introduzida por este diff, mas pode entrar num issue de manutenção/alinhamento futuro.

## Observações fora do escopo deste diff

- `npm run typecheck` e `npm run lint` não puderam ser executados neste ambiente (permissão negada ao shell); a qualidade foi aferida pelo comando de teste liberado (`npm run test`), que passa.

Conforme o `revisor-codigo.md`, sou somente leitura: apontei e evidenciei, não editei nem sugerei correções de código. Não há apontamentos bloqueantes, portanto o veredito é **APROVADO**.
