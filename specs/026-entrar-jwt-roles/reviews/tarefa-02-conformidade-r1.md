# Parecer de Conformidade — Tarefa 2

**Veredito:** APONTAMENTOS

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| `RolesGuard` existe e lança 403 para Desenvolvedor em rota `@Roles(Role.Admin)` | atendido | `apps/api/src/common/guards/roles.guard.ts:45-48`; `test/roles.guard.spec.ts:48-51` |
| Rotas sem `@Roles()` liberadas para qualquer autenticado | atendido | `apps/api/src/common/guards/roles.guard.ts:34-36`; `test/roles.guard.spec.ts:36-46` |
| Ordem `APP_GUARD`: `AuthGuard` antes de `RolesGuard` | atendido | `apps/api/src/app.module.ts:43-50` |
| Decorator `@Roles()` usando `SetMetadata` com `ROLES_KEY` | atendido | `apps/api/src/common/decorators/roles.decorator.ts:10` |
| `request.user.role` populado (sem 500 por `undefined.role`) | atendido | `apps/api/src/common/guards/auth.guard.ts:44` (diff `+ role`) |
| `JwtAuthGuard` da Tarefa 1 não alterado | atendido | não aparece no diff |
| Nenhum arquivo fora do escopo alterado | atendido | diff toca apenas `app.module.ts`, `auth.guard.ts` (necessário ao CA2), e os 3 arquivos novos da tarefa |

## Apontamentos

1. **Não existe rota de handler real decorada com `@Roles(Role.Admin)`** — `nenhum arquivo de rota/controller`
   - Critério violado: CA2 exige que "a API responde 403" quando um Desenvolvedor chama uma rota de Admin. O plano lista como arquivo previsto "rota admin existente com `@Roles(Role.Admin)`".
   - Evidência: grep por `@Roles(` em `apps/api/src` retorna apenas ocorrências em comentários/docstrings (`roles.decorator.ts:10`, `roles.guard.ts:17-18`), nunca em um `@Controller`/`@Get`/`@Post` real. Não há rota administrativa exposta no working tree que use o decorator.
   - Consequência: a CA2 é coberta apenas por teste unitário do `RolesGuard` (`test/roles.guard.spec.ts:48-51`), não end-to-end por uma rota real da API. O guard funciona corretamente (lança `ForbiddenException` → 403, nunca 500), mas não há como comprovar que a API responde 403 em uma rota efetiva.

## Justificativa

Todos os testes passam (10/10, 4 arquivos). O `RolesGuard` implementado respeita a ordem `AuthGuard` → `RolesGuard`, trata a ausência de `role` lançando 403 (não 500), libera rotas sem `@Roles()`, e o `AuthGuard` já injeta `request.user.role` a partir do payload do JWT. A única lacuna é a ausência de uma rota real decorada com `@Roles(Role.Admin)` para exercer a CA2 ponta a ponta.
