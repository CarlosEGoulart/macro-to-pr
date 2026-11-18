# Parecer de Código — Tarefa 1

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

### 1. Teste engole erro silenciosamente no `afterAll` — `apps/api/test/projects.e2e-spec.ts:59-63`
   ```ts
   try {
     await (prisma as any).project?.deleteMany({ where: {} });
   } catch {
     // Project ainda não existe (RED) — ignora
   }
   ```
   Regra violada: *Tratamento de erro que engole falha silenciosamente* (revisor-código.md / itens de reprovação).
   Prejuízo concreto: Qualquer erro real de limpeza — falha de conexão com o banco, modelo `Project` indisponível por motivo diferente de "ainda não existe", ou mesmo erro de permissão — é capturado e ignorado. O teste passa enquanto deixa dados órfãos no banco, tornando a suíte não determinística entre rodadas e mascarando regressões de limpeza. O comentário justifica o `RED`, mas o `catch` vazio é amplo demais: não distingue "modelo ainda não existe" de qualquer outra exceção.

### 2. Teste acoplado a detalhe de implementação do auth e do PrismaClient — `apps/api/test/projects.e2e-spec.ts:52-55` e `:60`
   - Linha 52-55: `jwtService.signAsync({ sub: developerId, email })` — o teste assina o JWT com `sub`, dependendo de que `JwtStrategy.validate` mapeie `payload.sub` para `userId` (linha 26 de `jwt.strategy.ts`). Se o shape do payload JWT mudar, o teste quebra sem alteração na regra de negócio.
   - Linha 60: `(prisma as any).project?.deleteMany` — cast `as any` para acessar `project` no PrismaClient, acoplado ao nome do model gerado pelo Prisma. Qualquer regeneração do cliente com nome diferente quebra o teste.
   Regra violada: *Teste acoplado a detalhe de implementação, que quebra em qualquer refatoração* (revisor-código.md).
   Prejuízo concreto: Refatorações legítimas no auth (ex.: mudar `sub` para `userId` no payload) ou no esquema Prisma quebram o teste e2e, gerando falsos negativos e inibindo refatoração.

---

## Sugestões (não bloqueiam)

- **PrismaService lê `process.env.DATABASE_URL` diretamente no construtor** — `apps/api/src/prisma/prisma.service.ts:6-9`. O ID17 da `architecture.md` prevê `ConfigModule` + validação Joi para variáveis de ambiente. Usar `process.env` direto bypassa a validação centralizada e altera infraestrutura da Tarefa 0 fora do escopo da Tarefa 1. Sugestão: injetar `ConfigService` e usar `configService.get('DATABASE_URL')`.
- **Sem restrição de unicidade no banco** — `prisma/schema.prisma:43-53` e migration `20261117133033_create_project/migration.sql`. RN01/CA3 exigem no máximo 1 Projeto por `Developer` + `Repository`, mas não há `@unique([developerId, repositoryId])` no schema nem índice único na migration. Sem isso, o banco aceita duplicatas; a regra só pode ser checada no `ProjectsService` (Tarefa 4), com risco de race condition. Sugestão: adicionar `@unique([developerId, repositoryId])` ao model `Project` e o índice correspondente na migration.
- **`updatedAt` sem DEFAULT na migration** — `migration.sql:29` (`"updatedAt" TIMESTAMP(3) NOT NULL,` sem `DEFAULT`). Funciona porque o PrismaClient preenche no insert, mas inserts em SQL bruto falhariam. Aceitável, mas vale notar.
- **`Controller` usa `@Req()` com tipo inline** — `apps/api/src/modules/projects/projects.controller.ts:14`. A `architecture.md` prevê um decorator `@CurrentUser` em `common/decorators/`. Usar `@Req()` com `{ user: { userId: string } }` inline foge do padrão estabelecido. Sugestão: criar/usar `@CurrentUser()` quando estiver disponível.

---

## Observações fora do escopo deste diff

- **`Repository.githubAccountId` sem `@relation` com `GitHubAccount`** — `schema.prisma:31-41`. A arquitetura (item 13 do glossário e item 13 das relações) prevê `GitHubAccount 1 — N Repository` via FK `Repository.githubAccountId → GitHubAccount.id`, mas o schema não define a relação nem a migration cria a FK. É pré-existente (Tarefa 0), não introduzido pela Tarefa 1 — candidata a Issue de manutenção.
- **Migration destrutiva em `Developer` e `Repository`** — `migration.sql:11-20` altera o tipo de `id` (DROP COLUMN + ADD COLUMN) nas tabelas existentes. O próprio aviso da migration diz que falha se houver dados. Aceitável em dev inicial, arriscado em ambiente com dados — candidata a Issue de revisão de estratégia de migração.

---

### Resumo do que está certo (não é apontamento)
- Camadas respeitadas: `Controller → Service → Repository → PrismaService`; nenhum controller acessa Prisma diretamente (ID6/ID8). ✓
- DTO com `class-validator` (`@IsString`, `@IsUUID`) e `@ApiProperty` (ID7, ID14). ✓
- `JwtAuthGuard` na rota `POST /projects` (ID9). ✓
- `ProjectsModule` importado no `AppModule` e `PrismaModule` importado no `ProjectsModule`. ✓
- Nenhum segredo hardcoded no código de produção. ✓
- Erros do serviço propagam (não engolidos); o `AllExceptionsFilter` global trata exceções (ID10). ✓