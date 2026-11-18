# Parecer de Conformidade — Tarefa 4

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA3 — já existe Projeto meu para este Repositório → não cria e informa impedimento | atendido | `apps/api/src/modules/projects/projects.service.ts:39-48`; `apps/api/src/modules/projects/projects.repository.ts:30-38` |
| Erro discernível (não 500 genérico): 409 Conflict com mensagem | atendido | `auth.service.ts:44-47`; `apps/api/test/auth-oauth-callback.e2e-spec.ts:134-137` |
| Nenhuma gravação no banco na negação | atendido | `auth.service.ts:50` — `create` só é chamado após todas as validações |
| Escopo respeitado (somente CA3; CA1 e CA2 de outras tarefas) | atendido | diff toca apenas `projects.service.ts`, `projects.repository.ts` e `auth-oauth-callback.e2e-spec.ts` |
| Termos do glossário (`Developer`, `GitHubAccount`, `Repository`, `Project`) consistentes com `architecture.md` | atendido | `projects.service.ts`; `projects.repository.ts`; consistentes com `docs/architecture.md:137,143,147` |
| TDD — RED válido (teste falharia sem o `ConflictException`) | atendido | `apps/api/test/projects.e2e-spec.ts:118-138` — sem o `ConflictException`, o 2º teste POST retorna 201, não 409 |

## Apontamentos

Nenhum. O comportamento exigido pelo CA3 está implementado e isolado por conta, o escopo da tarefa não foi inflado, os termos do glossário são respeitados e todos os testes e2e passam.