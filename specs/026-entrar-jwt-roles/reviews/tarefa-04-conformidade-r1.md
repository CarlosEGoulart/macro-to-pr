# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA5 — `Authorization: Bearer <token>` em toda chamada à API, em um lugar só (camada de serviço) | atendido | `apps/web/src/features/auth/apiService.ts:1-18` |
| Token lido de `localStorage` (não hardcoded) | atendido | `apps/web/src/features/auth/apiService.ts:7` (`localStorage.getItem('token')`) |
| Camada de serviço única em `apps/web/src/features/auth/` | atendido | `apps/web/src/features/auth/apiService.ts` |
| Header adicionado em um lugar só (não espalhado por componentes) | atendido | único ponto de entrada `apiService.request()` |
| Sem arquivo de login/tela (Tarefa 5) | atendido | não consta no diff |
| Sem alteração de backend | atendido | diff toca apenas `apps/web/` |
| Sem cadastro por senha (fora de escopo) | atendido | não consta no diff |
| Sem tratamento de 401 (Tarefa 5, CA6) | atendido | não consta no diff |

## Apontamentos

Nenhum. A seção fica vazia.

## Justificativa

O diff de trabalho (working tree vs `050a6d970553364c040417e2dfd0c75b14f691e2`) introduz exatamente dois arquivos, ambos em `apps/web/src/features/auth/`:

1. **`apiService.ts`** (novo) — camada de serviço única com um único ponto de entrada (`request`). Lê o token de `localStorage.getItem('token')` a cada chamada e, quando há token, define o cabeçalho `Authorization: Bearer <token>`; quando não há token, não adiciona cabeçalho de autenticação. Nada de login, tela, backend, cadastro por senha ou tratamento de 401 aparece no diff.

2. **`apiService.test.ts`** (novo) — 4 testes de unidade que exercitam diretamente a CA5:
   - envia `Authorization: Bearer <token>` lido do localStorage em toda chamada (2 chamadas, ambos com o header);
   - usa o token vigente no localStorage no momento de cada chamada (troca de token entre chamadas);
   - não envia `Authorization` quando não há token no localStorage.

Execução dos testes: `cd /workspaces/macro-to-pr/apps/web && npm run test` → **2 arquivos, 4 testes passando** (vitest run, duração 2.51s).

Não há divergência de termos do glossário de `docs/architecture.md` e não há comportamento implementado que a spec não pedisse. CA5 está integralmente atendido.
