# Parecer de Código — Tarefa 2

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum. O diff da Tarefa 2 não viola nenhuma regra do `docs/architecture.md`.

## Sugestões (não bloqueiam)

- **Service tipa a entrada com tipo inline em vez do DTO** — `apps/api/src/modules/projects/projects.service.ts:9`
  O parâmetro de `create` é tipado como `{ name: string; repositoryId: string }` em vez de `CreateProjectDto`. O serviço não declara explicitamente o contrato de entrada já validado pelo `ValidationPipe`; se o DTO adquirir campos, o serviço não espelha o contrato. Prejuízo: perda de clareza de contrato e acoplamento implícito entre controller e service. Sugestão: tipar o parâmetro como `CreateProjectDto`.

- **Tipo inline do usuário autenticado duplica padrão do repo** — `apps/api/src/modules/projects/projects.controller.ts:14`
  O controller declara inline `@Req() req: { user: { userId: string } }`, enquanto `notion.controller.ts:16-18` já padronizou `interface AuthenticatedRequest extends Request { user: { userId: string } }`. O tipo inline não herda `Request` (perde tipagem de `req`/`res`) e duplica a definição. Prejuízo: inconsistência com o padrão estabelecido no repositório e menor type-safety. Sugestão: extrair uma interface compartilhada (ex. `AuthenticatedRequest`) ou seguir o padrão do `notion.controller.ts`.

- **Teardown do e2e deixa limpezas fora do guarda de "tabela não existe"** — `apps/api/test/projects.e2e-spec.ts:59-75`
  O `afterAll` envolve `prisma.project.deleteMany` em try/catch que ignora "tabela não existe" (estado RED), mas `prisma.repository.deleteMany` e `prisma.developer.deleteMany` ficam fora desse guarda e `app.close()` só roda no fim. Prejuízo concreto: em estado intermediário de migração, o teardown pode lançar e pular `app.close()`, deixando conexão aberta. Sugestão: envolver todas as limpezas no mesmo tratamento e fechar a app em `finally`.

## Observações fora do escopo deste diff

- `prisma.service.ts` lê `process.env.DATABASE_URL` diretamente (construtor, linha 9) em vez de injetar `ConfigService`, divergindo de **ID17** (secrets via ConfigModule/ConfigService). É infraestrutura da Tarefa 0; candidata a Issue de manutenção, não bloqueia Tarefa 2.
- `schema.prisma` ainda não modela `GitHubAccount` nem as relations `Developer↔GitHubAccount` / `Repository↔GitHubAccount`, então **RN08** (repositório da conta vinculada, CA2) não é enforçada no banco — entrega prevista na Tarefa 3.
- Não há `@unique` em `Project(developerId, repositoryId)`; **RN01** (no máximo 1 Projeto por Desenvolvedor+Repositório, CA3) ainda não é enforçada — entrega prevista na Tarefa 4.

---

### Fundamentação do veredito

Revisei todos os arquivos da Tarefa 2 contra os 6 itens de qualidade do `revisor-codigo.md` e o `architecture.md`:

1. **Violação de camada (ID6/ID8):** Ausente. `ProjectsController` não acessa Prisma; `PrismaService` é global (`@Global()`) e o `ProjectsRepository` injeta `PrismaService` pelo construtor, seguindo a camada Repository. ✓
2. **Segredo/chave/URL de ambiente escrito no código:** Ausente. O `e2e-spec.ts` define `JWT_SECRET`/`DATABASE_URL` como fixtures de teste, não segredos reais. ✓
3. **Erro que engole falha silenciosamente:** Ausente. Nenhum `try/catch` vazio no código de produção; erros disparam para o filtro global (`AllExceptionsFilter`, ID10). ✓
4. **Abstração para um caso só:** Ausente. `ProjectsRepository` segue o padrão declarado em ID8 (repositórios encapsulam queries Prisma); não é indireção sem ganho — CA2 e CA3 adicionarão queries nele. ✓
5. **Duplicação de regra:** Ausente. Nenhuma regra duplicada no repositório. ✓
6. **Teste acoplado a detalhe de implementação:** Ausente. O e2e usa o contrato público declarado (envelope `{ data }` do `TransformInterceptor`, ID10) e a convenção de JWT do repo (`req.user.userId`, igual ao `notion.controller.ts`); não quebra em refatoração. ✓

O controller é consistente com a convenção já estabelecida pelo `notion.controller.ts`, o DTO respeita ID7 (`class-validator` + `ValidationPipe` global), o guard `JwtAuthGuard` está aplicado (ID9) e o status `201` é o default de `@Post()` do NestJS, conforme esperado pelo teste. Como não há apontamento bloqueante, o veredito é APROVADO.