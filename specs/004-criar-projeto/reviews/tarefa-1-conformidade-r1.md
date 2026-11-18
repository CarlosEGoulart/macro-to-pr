# Parecer de Conformidade — Tarefa 1

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — `POST /projects` com JWT válido, espera `201` com o Projeto criado | atendido | `apps/api/test/projects.e2e-spec.ts:40-66` (it "deve criar um projeto associado ao repositório do desenvolvedor autenticado (CA1)", `Bearer ${accessToken}`, `.expect(201)`) + rota protegida `apps/api/src/modules/projects/projects.controller.ts:12-18` (`@Post()`, `@UseGuards(JwtAuthGuard)`) |
| Teste nasce primeiro (RED — falhava com `404` antes do código) | atendido (per relato do implementador; teste presente define expectativa `201` que exige a rota) | `apps/api/test/projects.e2e-spec.ts`; rota antes inexistente, agora em `auth.controller.ts` |
| Escopo respeitado — nada de CA2 (Tarefa 3) nem CA3 (Tarefa 4) | atendido | `apps/api/src/modules/projects/projects.service.ts:1-17` (`create` faz apenas `prisma.project.create` direto, sem validação de pertença do repositório à `GitHubAccount` do desenvolvedor = CA2, e sem checagem de unicidade Developer+Repository = CA3) |
| `plan.md` não alterado | atendido | Ausente de `git diff bec692d --stat` e `--name-only`; HEAD inalterado |
| Não há commit pelo implementador (trabalho só no índice/staged) | atendido | `git log --oneline -3` mostra HEAD ainda em `bec692d` (commit da Tarefa 0); nenhum novo commit |

## Apontamentos

Nenhum. Não há apontamentos que violem critérios de aceitação ou o escopo da Tarefa 1. O teste e2e cobre exatamente a CA1 (autenticado + JWT + `POST /projects` → `201` com projeto criado), o service não contém validações de CA2/CA3 (destinadas às Tarefas 3 e 4), o `plan.md` está intacto, e o trabalho está apenas staged (não commitado).

> Nota não-bloqueante: `apps/api/src/prisma/prisma.service.ts` foi modificado (adicionado `PrismaPg` adapter) embora não conste na lista de arquivos previstos do `plan.md` para a Tarefa 1. Não implementa CA2 nem CA3, portanto não é violação de escopo de conformidade; caberia ao revisor de código avaliar a necessidade da mudança.