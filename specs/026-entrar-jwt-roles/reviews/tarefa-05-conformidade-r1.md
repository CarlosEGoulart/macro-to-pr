# Parecer de Conformidade — Tarefa 5

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA6 — `apiService.request` detecta `response.status === 401`, executa `localStorage.removeItem('token')` e redireciona `window.location.href = '/login'`, tudo na camada de serviço (um lugar só) | atendido | `apps/web/src/features/auth/apiService.ts` (diff: `if (response.status === 401) { localStorage.removeItem('token'); window.location.href = '/login'; }`) |
| Tratamento de 401 não espalhado por componentes — ocorre só na camada de serviço | atendido | `apps/web/src/features/auth/apiService.ts`; `Login.tsx` é apenas destino da navegação, não trata 401 |
| Menu esconde botões de Admin para Desenvolvedor (RBAC frontend) | atendido | `apps/web/src/features/auth/Menu.tsx` (itens de Admin renderizados sob guarda `role === 'Admin'`) |
| Não criado fluxo novo de cadastro/login por senha (fora de escopo) | atendido | `apps/web/src/features/auth/Login.tsx` é mero destino do redirecionamento com link OAuth GitHub (`/auth/github`); não há campo `passwordHash` nem formulário de senha |
| Backend não alterado | atendido | O diff toca somente `apps/web/src/features/auth/`; nada em `apps/api/` |

## Execução dos testes

Comando liberado rodado: `cd /workspaces/macro-to-pr/apps/web && npm run test` (vitest run, conforme `docs/architecture.md` seção 7).

Resultado: **4 test files passed, 9 tests passed** (incluindo `apiService.test.ts` com o novo bloco CA6, `Menu.test.tsx` e `Login.test.tsx`).

## Apontamentos

Nenhum. Não há apontamentos bloqueantes nem não-bloqueantes.

## Justificativa

O diff do working tree (contra `5ead457495be1abd330b64002cfaa361d0132fdf`) implementa exatamente o que a spec pede na CA6: a detecção de `status === 401`, a limpeza do token em `localStorage` e o redirecionamento para `/login` estão concentrados em um único ponto — a camada de serviço `apiService` —, sem repetição em componentes. O RBAC do menu (`Menu.tsx`) oculta os itens de Admin quando o papel é `Developer`. A tela `Login.tsx` se limita a ser o destino do redirecionamento após expiração/revogação, aponta para o OAuth GitHub e não introduz cadastro/login por senha, respeitando o "Fora de escopo" do spec.md (linhas 28–30). Nenhum arquivo do backend (`apps/api/`) foi modificado. Todos os testes relevantes passam.

Portanto, a Tarefa 5 está **APROVADA** em conformidade com o `spec.md` e o `plan.md`.
