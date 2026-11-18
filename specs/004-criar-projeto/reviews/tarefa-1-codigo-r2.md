# Parecer de Código — Tarefa 1 (rodada 2)

**Veredito:** APROVADO

## Confirmação dos apontamentos da rodada 1 (verificados como corrigidos)

| # | Apontamento (rodada 1) | Status no diff |
|---|------------------------|----------------|
| 1 | `catch` vazio engolia qualquer erro na limpeza (`projects.e2e-spec.ts:59-63`) | **CORRIGIDO** — O `catch` agora distingue erro de "tabela não existe" (`does not exist` / `undefined_table`) de qualquer outra exceção e re-lança (`throw error`). Não há mais engolimento silencioso. `apps/api/test/projects.e2e-spec.ts:60-71`. |
| 2 | JWT com `sub` hardcoded + `(prisma as any).project?.deleteMany` acoplado | **CORRIGIDO** — Token assinado com `userId: developerId` (shape compatível com `JwtStrategy.validate`, que aceita `payload.userId` como fallback de `payload.sub`); cast `as any` removido — usa `prisma.project.deleteMany` tipado. `apps/api/test/projects.e2e-spec.ts:53-56, 61`. |

## Apontamentos (bloqueiam)

Nenhum. Não há novo bloqueante neste diff.

## Sugestões (não bloqueiam)

- **PrismaService lê `process.env.DATABASE_URL` diretamente** — `apps/api/src/prisma/prisma.service.ts:6-9`. O ID17 da `architecture.md` prevê `ConfigModule` + validação Joi. Usar `process.env` direto bypassa a validação centralizada e altera infraestrutura da Tarefa 0 fora do escopo da Tarefa 1. Sugestão: injetar `ConfigService` e usar `configService.get('DATABASE_URL')`.
- **Sem restrição de unicidade no banco** — `prisma/schema.prisma:43-53` e migration `20261117133033_create_project/migration.sql`. RN01/CA3 exigem no máximo 1 Projeto por `Developer` + `Repository`, mas não há `@unique([developerId, repositoryId])` no schema nem índice único na migration. Sugestão: adicionar `@unique([developerId, repositoryId])` ao model `Project` e o índice correspondente na migration.
- **`updatedAt` sem DEFAULT na migration** — `migration.sql:29` (`"updatedAt" TIMESTAMP(3) NOT NULL` sem `DEFAULT`). Funciona porque o PrismaClient preenche no insert, mas inserts em SQL bruto falhariam. Aceitável em dev inicial.
- **`Controller` usa `@Req()` com tipo inline** — `apps/api/src/modules/projects/projects.controller.ts:14`. A `architecture.md` prevê um decorator `@CurrentUser` em `common/decorators/`. Usar `@Req()` com `{ user: { userId: string } }` inline foge do padrão estabelecido. Sugestão: criar/usar `@CurrentUser()` quando estiver disponível.

## Observações fora do escopo deste diff

- **Runtime do e2e não pôde ser validado neste ambiente:** `node_modules` não está instalado (`@prisma/client` ausente), então `npm run test:e2e` falha ao importar `PrismaClientKnownRequestError` antes de executar. Não é defeito de código — o `import` está no caminho padrão do Prisma. Validar com `npm install` + `npm run test:e2e` antes do merge.
- **Unicidade `developerId`+`repositoryId` não está no banco** — `apps/api/prisma/schema.prisma:43-53`. RN01/CA3 (no máximo 1 Projeto por Desenvolvedor + Repositório) só será imposta na Tarefa 4 (`ProjectsService`), com risco de race condition até lá. Candidata a `@unique([developerId, repositoryId])` + índice na migration.
- **`Repository.githubAccountId` sem `@relation` com `GitHubAccount`** e **migração destrutiva em `Developer`/`Repository`** — pré-existentes da Tarefa 0, já listados na rodada 1 como candidatas a Issue de manutenção; não introduzidos pela Tarefa 1.

---

### Resumo do que está certo (não é apontamento)
- Camadas respeitadas (ID6/ID8): `Controller → Service → Repository → PrismaService`; nenhum controller acessa Prisma diretamente. ✓
- DTO com `class-validator` (`@IsString`, `@IsUUID`) e `@ApiProperty` (ID7, ID14). ✓
- Rota `POST /projects` protegida por `JwtAuthGuard` (ID9). ✓
- `ProjectsModule` importado no `AppModule`; `PrismaModule` importado no `ProjectsModule`. ✓
- Nenhum segredo/literal de ambiente escrito no código de produção (variáveis do teste são bootstrap de teste, não segredo em fonte). ✓
- Erros do serviço/repositório propagam (não engolidos); `AllExceptionsFilter` trata exceções globalmente (ID10). ✓