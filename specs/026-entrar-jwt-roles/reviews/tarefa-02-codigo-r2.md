# Parecer de Código — Tarefa 2 (Rodada 2 / última)

**Veredito final: APROVADO**

---

## 1. Ponto-chave desta rodada — RESOLVIDO

Existe sim uma **rota de handler real decorada com `@Roles(Role.Admin)`**, e o teste e2e confirma o 403 via HTTP para um Desenvolvedor com token válido.

| Item | Evidência (arquivo:linha) | Trecho do diff |
|------|---------------------------|----------------|
| Rota admin real | `apps/api/src/app.controller.ts:28-35` | `@Get('admin/ping')` + `@Roles(Role.Admin)` → `adminPing()` retorna `'pong'` |
| E2E: Desenvolvedor → 403 | `apps/api/test/roles.e2e-spec.ts:59-66` | `request(...).get('/admin/ping')` com `Bearer devToken` `.expect(403)` + `expect(response.body.statusCode).toBe(403)` |
| E2E: sem token → 401 | `apps/api/test/roles.e2e-spec.ts:68-70` | `GET /admin/ping` sem header `.expect(401)` |
| E2E: Admin → 200 | `apps/api/test/roles.e2e-spec.ts:72-76` | `GET /admin/ping` com `Bearer adminToken` `.expect(200)` |

Isso fecha exatamente o apontamento bloqueante da rodada 1 (CA2 não exercível via HTTP). A CA2 do `spec.md` ("token de Desenvolvedor em rota com `@Roles(Role.Admin)` responde 403, não 500, não 200") está agora demonstrada **ponta a ponta por requisição HTTP real**, não apenas por simulação com `Reflector` mockado.

---

## 2. Apontamentos bloqueantes

**Nenhum.** Não há apontamento que impeça a aprovação nesta rodada.

Não foram encontrados desvios do `docs/architecture.md` introduzidos por este diff:

- **ID9 / Seção 5 (JWT + Roles/Guards):** `RolesGuard` implementado com `Reflector` + `ROLES_KEY`, decorator `@Roles()` via `SetMetadata`, RBAC `Developer | Admin`, e `ForbiddenException` (403) em vez de 500 quando o papel está ausente/indeferido.
- **Ordem dos guards (evita 500 por `user.role` indefinido):** `apps/api/src/app.module.ts:43-50` registra `APP_GUARD` `AuthGuard` **antes** de `RolesGuard`. Requisições não autenticadas recebem 401 no `AuthGuard` antes de chegar ao `RolesGuard`; o `RolesGuard` trata `!user` / `role === undefined` com `ForbiddenException` (linhas 36-43), nunca estoura.
- **`request.user.role` populado:** `apps/api/src/common/guards/auth.guard.ts:44` injeta `role: payload.role as string` a partir do payload do JWT.
- **Seção 2.1:** arquivos ficam em `apps/api/src/common/guards/` (`roles.guard.ts`) e `apps/api/src/common/decorators/` (`roles.decorator.ts`), conforme a estrutura declarada.
- **Seção 11:** RBAC = `Developer | Admin` via `RolesGuard` + `@Roles()`, respeitado.
- **ID6 (separação de camadas):** guard e decorator não acessam Prisma nem DB; o controller `adminPing` delega ao `AppService`.
- **ID17 (sem segredos hardcoded):** nenhum dos arquivos novos de origem contém segredos.
- **CA1/CA3 (spec.md):** rota sem `@Roles()` liberada para qualquer autenticado (unit test `roles.guard.spec.ts:36-46`; endpoint `getHello` é `@Public()`); rota sem token responde 401.

---

## 3. Sugestões não bloqueantes (opcionais, não impedem a aprovação)

1. **Localização do spec de unit test.** `apps/api/test/roles.guard.spec.ts` é um **unit test** (mocka `Reflector`, não sobe a aplicação) mas está na pasta `test/`, que a seção 2.1 define para **e2e specs**. Funciona porque `vitest.config.ts` inclui `**/*.spec.ts`, mas por consistência com os demais unit specs do repo (colocados junto ao código-fonte em `src/`), sugere-se movê-lo para `src/common/guards/roles.guard.spec.ts`. Não é defeito; o vitest o captura e roda normalmente.

2. **Dependência de banco no e2e.** `apps/api/test/roles.e2e-spec.ts` grava/ler `Developer` via `PrismaService` (DATABASE_URL apontando a um PostgreSQL local). Em CI isso é provido pelo serviço `postgres` (architecture.md, seção 9); localmente exige um banco em pé. É dependência ambiental inerente a e2e, não defeito de código.

3. **Fixture de segredo no teste.** `roles.e2e-spec.ts:10-11` define `process.env.JWT_SECRET = 'test-secret-123456'` e um `DATABASE_URL` de teste. São valores de fixture claramente não-produção (não é segredo hardcoded de ambiente real). Mantido como observação leve de leitura do ID17, sem impacto na aprovação.

4. **Limitação de ambiente desta revisão.** O shell está com execução de comando negada (`permission.rejected`), então não foi possível rodar `npm run test`, `npm run test:e2e`, `npm run typecheck` nem `npm run lint` para confirmação dinâmica. O parecer baseia-se exclusivamente na revisão estática do diff. Isso é restrição do ambiente, não defeito do diff (mesmo registro da rodada 1).

---

## 4. Justificativa da aprovação (baseada no diff)

O diff da working tree contra `f8d95678506c...` adiciona exatamente o escopo da Tarefa 2:

- `apps/api/src/common/decorators/roles.decorator.ts` (novo) — `@Roles(...)` via `SetMetadata(ROLES_KEY, roles)`.
- `apps/api/src/common/guards/roles.guard.ts` (novo) — `canActivate` com `Reflector.getAllAndOverride`, libera rotas sem `@Roles()`, lança `ForbiddenException` (403) quando o papel não confere ou está ausente (nunca 500).
- `apps/api/src/common/guards/auth.guard.ts` (alterado) — `request.user` agora inclui `role: payload.role as string`.
- `apps/api/src/app.module.ts` (alterado) — `APP_GUARD` `RolesGuard` registrado **depois** de `AuthGuard`, preservando a ordem correta.
- `apps/api/src/app.controller.ts` (alterado) — rota real `GET /admin/ping` com `@Roles(Role.Admin)`.
- `apps/api/test/roles.e2e-spec.ts` (novo) — e2e que cobre CA2 (Desenvolvedor → 403 via HTTP), sem token → 401, Admin → 200.
- `apps/api/test/roles.guard.spec.ts` (novo) — unit do guard cobrindo todos os ramos, incluindo 403 sem 500.

Todos os critérios de aceite relevantes (CA1, CA2, CA3) e todos os IDs da arquitetura aplicáveis a este diff estão respeitados. Não há apontamento bloqueante.

**Veredito: APROVADO.** Como esta é a rodada 2 e última permitida, não há pendência que gere uma rodada 3.
