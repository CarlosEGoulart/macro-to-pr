# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA4 — Swagger exibe botão Authorize (Bearer) na rota protegida | atendido | `apps/api/src/main.ts` (`.addBearerAuth()` no `DocumentBuilder`); `apps/api/src/swagger-bearer.spec.ts` (esquema Bearer http/bearer/JWT + security requirement em rotas protegidas) |
| Controller protegido `adminPing()` decorado com `@ApiBearerAuth()` | atendido | `apps/api/src/app.controller.ts` (`@Get('admin/ping')` + `@Roles(Role.Admin)` → `@ApiBearerAuth()`) |
| `ProjectsController` protegido (sem `@Public()`) decorado com `@ApiBearerAuth()` | atendido | `apps/api/src/modules/projects/projects.controller.ts:6-7` |
| `NotionController` protegido (sem `@Public()`) decorado com `@ApiBearerAuth()` | atendido | `apps/api/src/modules/notion/notion.controller.ts:19-20` |
| Rota `@Public()` (`getHello()`) NÃO recebeu `@ApiBearerAuth()` | atendido | `apps/api/src/swagger-bearer.spec.ts:53` (espera `metadata` undefined) |
| `JwtAuthGuard` (Tarefa 1) e `RolesGuard` (Tarefa 2) não alterados | atendido | não aparecem no diff; intocados |
| Arquivos fora do escopo não alterados | atendido | diff restrito a `main.ts`, `app.controller.ts`, `projects.controller.ts`, `notion.controller.ts` + spec novo `swagger-bearer.spec.ts` |
| `swagger.json` não commitado (fonte de verdade = endpoint vivo) | atendido | não consta do diff |
| Teste primeiro para CA4 | atendido | `apps/api/src/swagger-bearer.spec.ts` (6 testes, incluído na suíte) |

## Apontamentos

Nenhum apontamento. Não há bloqueante.

## Justificativa (baseada no diff)

O diff do working tree contra `1d2b2ccd7a7ce8fc2d6c5022d2b23a2f450ef0e9` implementa exatamente o escopo da Tarefa 3 (CA4):

1. **`apps/api/src/main.ts`**: o `DocumentBuilder` agora encerra com `.addBearerAuth()` e o config foi extraído para `swaggerConfig`, passado ao `SwaggerModule.createDocument(app, swaggerConfig)`. Isso faz o Swagger UI renderizar o botão **Authorize** (Bearer) na página `/docs`.
2. **Controllers protegidos**: `app.controller.ts` (`adminPing`, rota `@Roles(Role.Admin)`), `projects.controller.ts` e `notion.controller.ts` receberam `@ApiBearerAuth()` no nível de classe/método.
3. **Rota pública preservada**: `getHello()` (`@Public()`) não recebeu `@ApiBearerAuth()` — confirmado pelo teste que aguarda `metadata` undefined.
4. **Guards das Tarefas 1 e 2 intocados**: `JwtAuthGuard` e `RolesGuard` não aparecem no diff.
5. **`swagger.json` não commitado**: ausente do diff; a fonte de verdade continua sendo o endpoint vivo (`/docs`).
6. **Teste primeiro**: `swagger-bearer.spec.ts` prova o esquema Bearer (type `http`, scheme `bearer`, bearerFormat `JWT`), a presença do `security` requirement em rotas protegidas (`/admin/ping`, `/projects`) e sua ausência na rota pública.

Execução dinâmica: `npm run test` (vitest run) → **16 testes passaram em 5 arquivos**, incluindo os 6 do novo `swagger-bearer.spec.ts`. `typecheck` e `lint` não puderam rodar por restrição de permissão de shell no ambiente (restrição operacional, não defeito do diff).

Não há ponto fora do escopo da Tarefa 3 que comprometa a conformidade com o `spec.md`. **Veredito: APROVADO.**
