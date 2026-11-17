# Parecer de Conformidade — Tarefa 0

**Veredito:** APONTAMENTOS

## Critérios verificados

| Critério (da spec/plano) | Situação | Onde |
| --- | --- | --- |
| Arquivos previstos criados/alterados (plan.md:18) | parcialmente atendido | `git diff --name-status 3bc1dbd` |
| Modelos `Developer` e `Repository` em `prisma/schema.prisma` | atendido | `apps/api/prisma/schema.prisma:20-39` |
| `PrismaService` estende `PrismaClient` | atendido | `apps/api/src/prisma/prisma.service.ts:7` |
| `PrismaModule` com `@Global()` e exporta `PrismaService` | atendido | `apps/api/src/prisma/prisma.module.ts:4,7` |
| `JwtStrategy` estende `PassportStrategy(Strategy, 'jwt')` | atendido | `apps/api/src/modules/auth/jwt.strategy.ts:10` |
| `JwtAuthGuard` estende `AuthGuard('jwt')` | atendido | `apps/api/src/modules/auth/jwt-auth.guard.ts:7` |
| `app.module.ts` importa `PrismaModule` e registra `JwtStrategy`/`JwtAuthGuard` | atendido | `apps/api/src/app.module.ts:15-17,22,27-28` |
| Sem código fora do escopo (não implementou CA1/CA2/CA3) | atendido | diff (apenas infraestrutura) |
| Nenhum segredo (senha/JWT_SECRET literal) no código | **não atendido** | `apps/api/src/modules/auth/jwt.strategy.ts:14` |
| `apps/api/.env` (DATABASE_URL) criado | **não atendido** | ausente (glob `**/.env` = 0 resultados; não consta do diff) |
| `docker-compose.yml` com Postgres | preexistente, não alterado nesta tarefa | `docker-compose.yml:1-16` (não consta em --name-status) |

## Apontamentos

1. **Arquivo previsto `apps/api/.env` (DATABASE_URL) não foi criado** — `não existe no workspace`
   Critério violado: plan.md, linha 18 ("Arquivos previstos: ... `apps/api/.env` (DATABASE_URL)")
   Evidência: `git diff --name-status 3bc1dbd` não lista `.env`; glob `**/.env` retornou "No files found". O datasource do Prisma (`apps/api/prisma/schema.prisma:11-13`) não especifica URL, dependendo da variável de ambiente que não está definida.

2. **JWT_SECRET literal hardcoded no código** — `apps/api/src/modules/auth/jwt.strategy.ts:14`
   Critério violado: item 9 do checklist de conformidade ("Nenhum segredo (senha, JWT_SECRET literal) escrito no código")
   Evidência: `secretOrKey: configService.get<string>('JWT_SECRET') ?? 'dev-secret-change-me',` — o fallback `'dev-secret-change-me'` é um segredo JWT literal escrito no fonte, não apenas lido de variável de ambiente.

**Nota sobre build/lint:** não foi possível executar `npm run build` nem `npm run lint` nesta sessão de revisão (shell com permissão negada). O parecer baseia-se na análise estática do diff contra `3bc1dbd` e na leitura direta dos arquivos.