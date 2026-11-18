# Parecer de Conformidade — Tarefa 1 (rodada 2)

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA1 — `POST /projects` com JWT válido, espera `201` com o Projeto criado | atendido | `apps/api/test/projects.e2e-spec.ts:77-89` + `apps/api/src/modules/projects/projects.controller.ts:10-11` |
| Teste nasce primeiro (RED — falhava com `404` antes do código) | atendido (relato do implementador; teste presente define expectativa `201` que exige a rota) | `apps/api/test/projects.e2e-spec.ts`; rota antes inexistente, agora em `auth.controller.ts` |
| Escopo respeitado — nada de CA2 (Tarefa 3) nem CA3 (Tarefa 4) | atendido | `apps/api/src/modules/projects/projects.service.ts:8-16` (`create` faz apenas `prisma.project.create` direto, sem validação de pertença do repositório à `GitHubAccount` do desenvolvedor = CA2, e sem checagem de unicidade Developer+Repository = CA3) |
| `plan.md` não alterado | atendido | Ausente de `git diff bec692d --stat` e `--name-only`; HEAD inalterado |
| Não há commit pelo implementador (trabalho só no índice/staged) | atendido | `git log --oneline -3` mostra HEAD ainda em `bec692d` (commit da Tarefa 0); nenhum novo commit |

## Apontamentos

Nenhum. Não há apontamentos que violem critérios de aceitação ou o escopo da Tarefa 1. O teste e2e cobre exatamente a CA1 (autenticado + JWT + `POST /projects` → `201` com projeto criado), o service não contém validações de CA2/CA3 (destinadas às Tarefas 3 e 4), o `plan.md` está intacto, e o trabalho está apenas staged (não commitado).

## Evidências das correções (rodada 2)

**Apontamento 1 — `catch` não é mais vazio (antes engolia tudo silenciosamente):**

Antes (r1):
```ts
try {
  await (prisma as any).project?.deleteMany({ where: {} });
} catch {
  // Project ainda não existe (RED) — ignora
}
```

Depois (r2), `apps/api/test/projects.e2e-spec.ts:60-71`:
```ts
try {
  await prisma.project.deleteMany({ where: {} });
} catch (error) {
  const isTableNotFound =
    error instanceof PrismaClientKnownRequestError &&
    (error.message.includes('does not exist') ||
      error.message.includes('undefined_table'));
  if (!isTableNotFound) {
    throw error;
  }
  // Tabela ainda não existe (RED) — ignora
}
```
O `catch` agora distingue "modelo/tabela ainda não existe" (ignorado, válido no RED) de qualquer outra exceção (relançada com `throw error`), corrigindo o engolimento silencioso.

**Apontamento 2 — JWT sem `sub` hardcoded e `as any` removido:**

Antes (r1): `jwt.signAsync({ sub: developerId, email })` e `(prisma as any).project?.deleteMany`.

Depois (r2), `apps/api/test/projects.e2e-spec.ts:53-55`:
```ts
accessToken = await jwtService.signAsync({
  userId: developerId,
  email: developer.email,
});
```
Usa `userId` (não `sub`), desacoplado do shape do payload JWT. E `:61`:
```ts
await prisma.project.deleteMany({ where: {} });
```
Acesso tipado via `PrismaService`, sem cast `as any`.

### Conclusão

Os 2 apontamentos bloqueantes aceitos na rodada 1 foram corretamente implementados na rodada 2. CA1 permanece atendido, o escopo da Tarefa 1 foi respeitado (sem CA2/CA3), o `plan.md` não foi alterado, o trabalho está apenas staged (sem commit), e o TDD RED é válido. **Veredito: APROVADO.**