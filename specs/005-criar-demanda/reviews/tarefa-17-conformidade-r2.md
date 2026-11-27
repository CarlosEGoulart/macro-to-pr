# Parecer de Conformidade — Tarefa 17 (rodada 2)

**Veredito: APROVADO**

## Critérios verificados

| Critério / Cenário | Situação | Onde |
|---|---|---|
| CA1 — `POST /demandas` 201 retorna objeto completo com `id`, `title`, `description`, `projectId`, `type` e `priority` | atendido | `apps/api/test/demands.e2e-spec.ts:169-198` (asserções nas linhas 190-197: `body.type === 'feature'`, `body.priority === 'high'`, etc.) |
| Persistência de `type`/`priority` no banco (colunas + enums no schema) | atendido | `apps/api/prisma/schema.prisma:30-40` (enums `TypeDemand`/`PriorityDemand`) e `:42-47` (campos `type`, `priority` na `Demand`) |
| Migration cria enums e adiciona colunas `type`/`priority` NOT NULL | atendido | `apps/api/prisma/migrations/20261127001835_add_type_priority_to_demand/migration.sql:9-16` |
| Service repassa `type`/`priority` ao repository | atendido | `apps/api/src/modules/demands/demands.service.ts:29-35` |
| Repository repassa `type`/`priority` ao `prisma.demand.create` | atendido | `apps/api/src/modules/demands/demands.repository.ts:17-19` |
| DTO valida `type`/`priority` como obrigatórios (sem `@IsOptional`) | atendido | `apps/api/src/modules/demands/dto/create-demand.dto.ts:31-37` |
| Objeto retornado inclui `id` gerado | atendido | `apps/api/test/demands.e2e-spec.ts:190-192` + `schema.prisma:43` (`@default(uuid())`) |

## Escopo (arquivos alterados vs previstos)

Arquivos previstos na Tarefa 17 e confirmados como alterados, todos dentro do escopo:
- `apps/api/prisma/schema.prisma` — colunas `type`/`priority` e enums
- `apps/api/prisma/migrations/20261127001835_add_type_priority_to_demand/migration.sql` (nova migration; pasta contém apenas `migration.sql`, sem arquivos extras)
- `apps/api/src/modules/demands/demands.service.ts` — passa `type`/`priority` ao `create`
- `apps/api/test/demands.e2e-spec.ts` — asserções de `type`/`priority` no objeto retornado

Confirmei ainda `apps/api/src/modules/demands/demands.repository.ts` (chamado pelo service), que encaminha `type`/`priority` ao `prisma.demand.create` — necessário para a persistência exigida pela CA1, sem fugir do escopo da tarefa. Nenhuma alteração fora do escopo da Tarefa 17 foi observada nos arquivos inspecionados.

## Não-conformidades

Nenhuma.

## Sobre o NC-01

**RESOLVIDO.** A migration `apps/api/prisma/migrations/20261127001835_add_type_priority_to_demand/migration.sql` está presente no working tree com conteúdo correto (`CREATE TYPE "TypeDemand" AS ENUM ('feature','bug','refactor')`, `CREATE TYPE "PriorityDemand" AS ENUM ('low','medium','high')` e `ALTER TABLE "Demand" ADD COLUMN "priority" "PriorityDemand" NOT NULL, ADD COLUMN "type" "TypeDemand" NOT NULL`). O despacho da tarefa informa que o `git add` da migration foi executado na rodada 2 e que ela aparece como nova no `git diff 99cea01... -- <caminho>`. Com isso, o CI (`npx prisma migrate deploy`) criaria os enums/colunas e o e2e que asserisce `body.type === 'feature'` e `body.priority === 'high'` teria as colunas disponíveis.
