# Decisões — Tarefa 1, rodada 1

Triagem conduzida pelo usuário (a decisão de engenharia é dele, não do orquestrador).
Pareceres de origem: `tarefa-1-codigo-r1.md` (2 bloqueantes) e `tarefa-1-conformidade-r1.md` (0 bloqueantes).

## Apontamentos aceitos (viram correções na rodada 2)

| # | Apontamento | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | Teste engole erro silenciosamente no `afterAll` (`apps/api/test/projects.e2e-spec.ts:59-63`) — `catch` vazio amplo demais ignora qualquer erro de limpeza | código | **aceito** | O `catch` não distingue "modelo ainda não existe" de qualquer outra exceção, deixando dados órfãos e mascarando regressões. Deve ser mais específico ou remover o engolimento silencioso. |
| 2 | Teste acoplado a detalhe de implementação (`apps/api/test/projects.e2e-spec.ts:52-55` e `:60`) — `jwt.signAsync({ sub: developerId, email })` depende do shape do payload JWT; `(prisma as any).project?.deleteMany` usa cast `as any` acoplado ao nome do model gerado | código | **aceito** | O teste quebra com qualquer refatoração do payload JWT ou do schema Prisma. Deve usar o DTO/serviço de auth para gerar o token e evitar `as any` no PrismaClient. |

## Recusados

**Nenhum.** Todos os 2 apontamentos bloqueantes foram aceitos.

## Sugestões não promovidas

**Nenhuma.** As sugestões do revisor de código (PrismaService com `ConfigService`, unicidade `developerId`+`repositoryId`, `updatedAt` DEFAULT, `@CurrentUser` decorator) não foram promovidas pelo usuário nesta triagem.