# Parecer de Código — Tarefa 2

**Veredito:** PENDENTE COM APONTAMENTOS

Todos os comandos prescritos que pude executar passaram (os 4 arquivos de teste, 10 testes, incluindo os 5 do novo `roles.guard.spec.ts`). `typecheck` e `lint` foram bloqueados por restrição de ambiente do shell (não é defeito do diff), então registro como observação.

Tenho todos os elementos. Aqui está o parecer.

---

## Apontamentos (bloqueiam)

### 1. Nenhuma rota está decorada com `@Roles(Role.Admin)` — CA2 não é exercível via HTTP
**Evidência:** `grep @Roles` sobre `apps/api/` retorna apenas:
- `apps/api/src/common/decorators/roles.decorator.ts:10` — definição/docstring do decorador;
- `apps/api/src/common/guards/roles.guard.ts:17-18` — docstring/comentário;
- `apps/api/test/roles.guard.spec.ts` — simulação com `Reflector` mockado.

Nenhum controller (`projects.controller.ts`, `notion.controller.ts`) nem qualquer outro endpoint usa `@Roles(...)`. Não existe pasta `apps/api/src/modules/admin/` nem rota admin. O `diff` não toca nenhuma rota para adicionar o decorador.

**Regra violada:** `docs/architecture.md` Seção 11 (`RBAC = Developer | Admin via RolesGuard + @Roles()`), ID9 (linha ~391: `RolesGuard + @Roles(...) decorator + Reflector para RBAC`) e critério de aceite **CA2** do `spec.md` (`token de Desenvolvedor em rota com @Roles(Role.Admin) responde 403`).

**Prejuízo concreto:** o mecanismo do guard está correto e coberto por unit test, mas o **403 só é demonstrado por simulação** (mock do `Reflector`), nunca por uma requisição HTTP real contra um endpoint. Como a tarefa prevê explicitamente "rota admin existente com `@Roles(Role.Admin)`", a ausência deixa o requisito de aceitação sem demonstração end-to-end.

---

## Sugestões (não bloqueiam)

### 2. Localização inconsistente do spec de unit test
Todas as specs existentes são colocadas junto ao código-fonte em `src/` (`src/app.controller.spec.ts`, `src/all-exceptions/all-exceptions.filter.spec.ts`, `src/transform/transform.interceptor.spec.ts`). A arquitetura (seção 2.1) define `test/` como pasta de **e2e specs**, e `vitest.config.e2e.ts` pega apenas `**/*.e2e-spec.ts`. O novo `test/roles.guard.spec.ts` é um **unit test** (sem sufixo `.e2e-`) numa pasta convenção de e2e. Embora `vitest.config.ts` (`include: ['**/*.spec.ts']`) o capture e ele rode, sugere-se movê-lo para colocalização, ex.: `src/common/guards/roles.guard.spec.ts`, mantendo a convenção do repo.

### 3. Clareza sobre o ramo `!user` no `RolesGuard` (defesa em profundidade)
`apps/api/src/common/guards/roles.guard.ts:36` lança `ForbiddenException` (403) também quando `!user`. Como `AuthGuard` é global e roda **antes** (ordem de `APP_GUARD` correta em `app.module.ts`), requisições não autenticadas já recebem `401` antes de chegar ao `RolesGuard`; esse ramo não é alcançado na prática. Não é defeito, apenas pode-se documentar que `!user` não ocorre com a ordem atual de guards, evitando leitura equivocada de que falta-autenticado → 403.

---

## Observações fora do escopo deste diff
- Não foi possível executar `npm run typecheck` nem `npm run lint` (restrição de ambiente no shell); apenas `npm run test` rodou (4 arquivos, 10 testes, todos passando). Isso não é defeito do diff, mas impede confirmar tipo/lint dos novos arquivos por este parecer. Verificar no CI/local.

---

## Justificativa do que está correto (não bloqueia)

O mecanismo em si respeita a arquitetura:
- **ID9 / Seção 2.1 / Seção 11:** `RolesGuard` (`canActivate`, `Reflector`, `ForbiddenException` → 403), decorator `@Roles()` via `SetMetadata`, e ambos em `apps/api/src/common/guards/` e `apps/api/src/common/decorators/`.
- **Ordem dos guards:** `app.module.ts` registra `APP_GUARD` `AuthGuard` **antes** de `RolesGuard`, evitando 500 por `user.role` indefinido; `AuthGuard` já populava `request.user` e agora também preenche `role: payload.role as string` (`auth.guard.ts:44`).
- **Sem 500 por role ausente:** `RolesGuard` trata `role === undefined`/`!user` com `ForbiddenException` (403), nunca deixa estourar.
- **ID6:** guard/decorator ficam em `common/`, não acessam Prisma nem quebram separação de camadas.
- **ID17:** nenhum segredo hardcoded nos novos arquivos.
- **Testes:** `roles.guard.spec.ts` cobre CA2 (Desenvolvedor em rota Admin → 403), rota sem `@Roles` liberada, Admin liberado e token sem role → 403 sem 500; vitest passa (10/10).

O apontamento acima é o único item que impede o veredito de APROVADO: cabe à triagem do usuário decidir se promove o apontamento (e então a tarefa precisa de uma rota real com `@Roles(Role.Admin)`) ou se aceita o mecanismo isolado e agenda a rota para outra tarefa.
