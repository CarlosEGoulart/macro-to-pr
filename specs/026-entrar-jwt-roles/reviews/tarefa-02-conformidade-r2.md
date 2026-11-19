# Parecer de Conformidade — Tarefa 2

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec / plan.md) | Situação | Onde |
| --- | --- | --- |
| CA2 — `RolesGuard` lança 403 para Desenvolvedor em rota `@Roles(Role.Admin)` (não 500, não 200) | atendido | `apps/api/src/common/guards/roles.guard.ts:45-48`; `test/roles.e2e-spec.ts` (e2e, passou) |
| Rotas sem `@Roles()` liberadas para qualquer autenticado | atendido | `apps/api/src/common/guards/roles.guard.ts:34-36`; `test/roles.guard.spec.ts:36-46` |
| Ordem `APP_GUARD`: `AuthGuard` antes de `RolesGuard` | atendido | `apps/api/src/app.module.ts:43-50` |
| Decorator `@Roles()` usando `SetMetadata` com `ROLES_KEY` | atendido | `apps/api/src/common/decorators/roles.decorator.ts:10` |
| `request.user.role` populado a partir do payload do JWT (sem 500 por `undefined.role`) | atendido | `apps/api/src/common/guards/auth.guard.ts:44` |
| `JwtAuthGuard` da Tarefa 1 não alterado | atendido | não aparece no diff; `modules/auth/jwt-auth.guard.ts` intocado (apenas registrado como *provider* na linha 42, não como `APP_GUARD`) |
| Nenhum arquivo fora do escopo alterado | atendido | diff restrito a `app.controller.ts` (rota admin — escopo da tarefa), `app.module.ts` (APP_GUARD — escopo), `auth.guard.ts` (injeção de `role`, exigido pela CA2) + 3 arquivos novos da tarefa (2 guards/decorator + 2 specs) |
| **Ponto chave:** rota real de handler decorada com `@Roles(Role.Admin)` + e2e confirma Desenvolvedor → 403 | atendido | `apps/api/src/app.controller.ts` (`GET /admin/ping`, `@Roles(Role.Admin)`); `test/roles.e2e-spec.ts` (Desenvolvedor com token válido → 403, passou em `npm run test:e2e`) |

## Apontamentos

Nenhum apontamento.

## Justificativa

Todos os critérios de aceite vinculados à Tarefa 2 estão atendidos. O `RolesGuard` existe, lança `ForbiddenException` (403) — nunca 500 — quando o papel do usuário não confere com o exigido, trata a ausência de `role` com 403, e libera rotas sem `@Roles()`. A ordem dos guards global (`AuthGuard` → `RolesGuard`) em `app.module.ts` impede que requisições não autenticadas atinjam o `RolesGuard` (elas recebem 401 primeiro). O `AuthGuard` injeta `request.user.role` a partir do payload JWT, eliminando o risco de `undefined.role` → 500 que a CA2 proíbe. O `JwtAuthGuard` da Tarefa 1 não foi tocado.

O bloqueante da rodada 1 (ausência de uma rota real decorada com `@Roles(Role.Admin)`, deixando a CA2 apenas em teste unitário com `Reflector` mockado) está resolvido: existe agora o handler `GET /admin/ping` em `app.controller.ts`, decorado com `@Roles(Role.Admin)`, e o teste e2e `roles.e2e-spec.ts` confirma via HTTP que um Desenvolvedor com token válido recebe **403** (não 500, não 200), enquanto o Admin recebe 200 e a ausência de token recebe 401.

Ambos os comandos exigidos estão verdes: `npm run test` (10/10) e `npm run test:e2e` (9/9). Como não há apontamentos, o veredito é **APROVADO**. Não há rodada 3.
