# Parecer de Código — Tarefa 3

**Veredito: APROVADO**

---

## Apontamentos (bloqueiam)

**Nenhum.** Não há apontamento que impeça a aprovação.

Todos os requisitos da Tarefa 3 (Swagger Bearer Auth, CA4) foram implementados dentro do escopo do diff e respeitam o `docs/architecture.md`.

---

## Sugestões (não bloqueiam)

1. **Guard de ambiente na entrada da aplicação** — `apps/api/src/main.ts:25-27` condiciona `await bootstrap()` a `process.env.VITEST !== 'true'`. É um padrão de teste razoável (evita subir servidor durante vitest), mas altera o comportamento do entry point com base em variável de ambiente. Não é defeito de arquitetura; apenas registre como observação de leitura.

2. **`NotionController.callback` com `@ApiBearerAuth()` de classe** — `apps/api/src/modules/notion/notion.controller.ts:19` aplica `@ApiBearerAuth()` em nível de classe, o que se estende ao método `callback` (linha 41). Esse endpoint é invocado pelos servidores do Notion (OAuth callback), não por um usuário autenticado com JWT. Documentá-lo como exigindo Bearer auth no Swagger é levemente enganoso. Não é violação do `architecture.md`, apenas um ajuste de documentação que o time pode considerar.

---

## Observações fora do escopo deste diff

As duas itens abaixo **não foram introduzidas por este diff** (já existiam antes), portanto não são apontamentos da Tarefa 3, mas são candidatas a Issue de manutenção relacionadas ao ID14:

- **Caminho do Swagger UI:** `architecture.md` ID14 exige `GET /api/docs`, mas o código registra `SwaggerModule.setup('docs', ...)` (`main.ts:18`). O path está sem o prefixo `/api`. Diferença pré-existente, não tocada por este diff.
- **Endpoint `/api/docs-json`:** ID14 exige `GET /api/docs-json` (OpenAPI 3.1 JSON). Não existe no código. Diferença pré-existente, não tocada por este diff.

---

## Justificativa da aprovação (baseada no diff)

O diff da working tree contra `1d2b2ccd7a7ce8fc2d6c5022d2b23a2f450ef0e9` adiciona exatamente o escopo da Tarefa 3:

| Requisito | Onde (diff) | Status |
|---|---|---|
| `.addBearerAuth()` no `DocumentBuilder` | `apps/api/src/main.ts:5-9` | Implementado; security scheme `http` / `bearer` / `bearerFormat: JWT` (confirmado pelo teste) |
| `@ApiBearerAuth()` em controller protegido (método) | `apps/api/src/app.controller.ts:31` (`adminPing`) | Implementado |
| `@ApiBearerAuth()` em controller protegido (classe) | `apps/api/src/modules/projects/projects.controller.ts:6`; `apps/api/src/modules/notion/notion.controller.ts:19` | Implementado |
| Rota `@Public()` SEM `@ApiBearerAuth()` | `apps/api/src/app.controller.ts:22` (`getHello`) | Respeitado (confirmado pelo teste via `Reflector`) |
| ID6 — separação de camadas | Decorators são metadados Swagger; nenhum acessa Prisma/DB | Respeitado |
| ID17 — nenhum segredo hardcoded | Nenhum segredo no diff | Respeitado |
| Testes da CA4 | `apps/api/src/swagger-bearer.spec.ts` (novo) | 16/16 testes passando (`npm run test`) |

O teste `swagger-bearer.spec.ts` valida: (1) security scheme Bearer/http/JWT presente no documento OpenAPI; (2) rota pública (`getHello`) sem segurança; (3) rotas protegidas (`adminPing`, `ProjectsController`, `NotionController`) com `{ bearer: [] }`; (4) security requirements aparecendo nos paths `/admin/ping` e `/projects`.

**Veredito: APROVADO.** Sem apontamentos bloqueantes. Como revisor de código (somente leitura), não sugiro correções de código; apenas evidencio o que está conforme e deixo as sugestões/observações acima para ciência do time.
