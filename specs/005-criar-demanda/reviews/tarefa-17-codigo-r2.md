# Pareser de Código — Tarefa 17 (rodada 2)

**Veredito: APROVADO**

## NC-01 (apontamento da rodada 1): RESOLVIDO

A migration `apps/api/prisma/migrations/20261127001835_add_type_priority_to_demand/migration.sql` está **rastreada no git** — aparece como novo arquivo (`A` no `git status`, `.../migration.sql | 16 +++++` no `git diff 99cea0... --stat`), portanto viaja na branch e será executada por `npx prisma migrate deploy` no CI (seção 9 do `architecture.md`).

Conteúdo da migration (`migration.sql:9-16`):
- `CREATE TYPE "TypeDemand" AS ENUM ('feature', 'bug', 'refactor');`
- `CREATE TYPE "PriorityDemand" AS ENUM ('low', 'medium', 'high');`
- `ALTER TABLE "Demand" ADD COLUMN "type" "TypeDemand" NOT NULL, ADD COLUMN "priority" "PriorityDemand" NOT NULL;`

Correto: enuns + colunas `NOT NULL`, exatamente como exigido para fechar a CA1 ("objeto completo").

---

## Verificações obrigatórias

| Verificação | Status | Evidência |
|---|---|---|
| **ID6 — Separação estrita de camadas** (Controller → Service → Repository; nenhum Controller acessa Prisma diretamente) | CONFORME | `demands.controller.ts:18` apenas delega `this.demandsService.create(...)`; `demands.service.ts` usa `DemandsRepository` + `ProjectsRepository`; `demands.repository.ts:17-18` encapsula `this.prisma.demand.create(...)`. |
| **ID8 — CRUD relacional com Prisma ORM via repositórios** | CONFORME | `DemandsRepository` injeta `PrismaService` e executa a query Prisma; o Service não toca Prisma. |
| **Seção 7 — Stack de teste** (Vitest + supertest + `@nestjs/testing`) | CONFORME | `demands.e2e-spec.ts` usa `Test.createTestingModule`, `supertest`, `INestApplication`; comando prescrito `npx vitest run --config vitest.config.e2e.ts test/demands.e2e-spec.ts`. |
| **Seção 9 — Migration rastreada no git** (viaja na branch para `prisma migrate deploy`) | CONFORME | Aparece como novo arquivo em `git diff 99cea0... --stat`; não está mais `??` untracked. |
| **Migration com enuns + `ALTER TABLE ... NOT NULL`** | CONFORME | Enuns `TypeDemand`/`PriorityDemand` + colunas `type`/`priority NOT NULL` (veja NC-01 acima). |
| **schema.prisma com colunas `type` e `priority`** | CONFORME | `schema.prisma:30-40` define os enuns; `schema.prisma:46-47` adiciona `type TypeDemand` e `priority PriorityDemand` ao model `Demand`. |
| **Service passa `type`/`priority` ao `prisma.demand.create`** | CONFORME | `demands.service.ts:32-33` repassa `type: createDemandDto.type, priority: createDemandDto.priority` ao repository. |
| **E2E asser `id`, `title`, `description`, `projectId`, `type`, `priority` no objeto retornado (CA1)** | CONFORME | `demands.e2e-spec.ts:190-197` asser todos os seis campos, incluindo `body.type === 'feature'` e `body.priority === 'high'`. |
| **DTO valida `type`/`priority` de entrada (obrigatórios)** | CONFORME | `create-demand.dto.ts:31-37` usa `@IsEnum(TypeDemand)` e `@IsEnum(PriorityDemand)`, sem `@IsOptional`. |

---

## Sugestões (não-bloqueantes, não afetam o veredito)

1. Os arquivos em `apps/api/src/generated/prisma/*` são cliente Prisma gerado. Commitá-los é aceitável, mas exige `prisma generate` após cada migration para manter sincronia com o schema. Não é bloqueante para esta tarefa.
2. O serviço faz checagem redundante `project.developerId !== developerId` após `findProjectByIdAndDeveloper` já filtrar pelo desenvolvedor (pré-existente, não introduzido pela tarefa 17). Não é ponto de revisão desta rodada.

---

## Observações fora do escopo (pré-existentes, não tocadas pelo diff)

- Ausência de `.gitignore` (seção 8 do `architecture.md`) — será criado na Entrega 2.
- Expiração JWT não aplicada no `JwtModule.registerAsync` (seção 11 do `architecture.md`, decisão registrada).
- Divergência lint (oxlint vs ESLint declarada na seção 7).

---

### Resumo para a defesa

A tarefa 17 foi implementada integralmente: schema, migration (rastreada), service, repository, DTO e e2e estão coerentes e cobrem a CA1 por completo ("objeto completo" agora inclui `type` e `priority`). Não há não-conformidade bloqueante contra `docs/architecture.md`. **APROVADO.**
