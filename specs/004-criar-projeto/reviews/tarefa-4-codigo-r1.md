# Parecer de Código — Tarefa 4

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum. O diff respeita a arquitetura (`docs/architecture.md`):

- **ID6/ID8 (camadas):** `Controller → Service → Repository → PrismaService`; nenhum controller acessa Prisma diretamente.
- **ID10 (erros):** exceções lançadas com `BadRequestException` / `ConflictException`; capturadas pelo `AllExceptionsFilter` global; nada engolido silenciosamente.
- **ID17 (segredos):** nenhuma chave/URL/segredo escrito no código.
- **Duplicação de regra:** não há outra validação de "repositório pertence à Conta GitHub vinculada" no repo.
- **Testes:** não usam mocks; rodam contra banco real via Prisma; cada teste prova o que afirma (status 400 com `'não pertence'` para CA2; status 409 com `'Já existe'` para CA3).

## Sugestões (não bloqueiam)

1. **Sem constraint de unicidade no banco para RN01** — `apps/api/prisma/schema.prisma:43-53`
   O modelo `Project` não tem `@@unique([developerId, repositoryId])`. A validação de CA3 existe só no `projects.service.ts:40-48` (nível de aplicação). Sob requisições concorrentes, duas requisições podem passar no `findProjectByDeveloperAndRepository` (ambas retornam `null`) e ambas criar o Projeto, violando RN01 ("no máximo 1 Projeto por Repositório da conta"). O banco seria a última linha de defesa e não está ativo.
   *Prejuízo concreto:* duplicidade de Projeto para o mesmo Desenvolvedor + Repositório sob carga concorrente, que a validação de aplicação sozinha não impede.

2. **Service recebe tipo inline em vez do DTO** — `apps/api/src/modules/projects/projects.service.ts:13`
   O parâmetro de `create` é tipado como `{ name: string; repositoryId: string }` em vez de `CreateProjectDto`. O serviço não declara explicitamente o contrato de entrada já validado pelo `ValidationPipe`; se o DTO adquirir campos, o serviço não espelha o contrato. Prejuízo: perda de clareza de contrato e acoplamento implícito entre controller e service.

## Observações fora do escopo deste diff

- O diff inclui a validação de **CA2** (repositório deve pertencer à Conta GitHub vinculada), que é escopo da **Tarefa 3**, não da Tarefa 4. Tanto CA2 quanto CA3 estão entrelaçadas em `projects.service.ts`; não prejudica a qualidade, mas o `diff` abrange mais do que a tarefa em revisão.
- Estão staged dois arquivos de parecer da **Tarefa 3** (`specs/004-criar-projeto/reviews/tarefa-3-codigo-r1.md` e `tarefa-3-conformidade-r1.md`) que referenciam código (`OAuthDeniedGuard`, `GitHubOAuthStateStore`, `auth.controller.ts`, etc.) **inexistente neste diff**. São artefatos de outra sessão/tarefa capturados pelo `git add -A`. Não afetam o código da Tarefa 4, mas não pertencem a este diff. Candidata a Issue de manutenção: revisar o diretório `specs/004-criar-projeto/reviews/`.

---

### Resumo do que está certo (não é apontamento)

- Camadas respeitadas (ID6/ID8): `Controller → Service → Repository → PrismaService`; nenhum controller toca Prisma. ✅
- DTO com `class-validator` (`@IsString`, `@IsUUID`) e `@ApiProperty` (ID7, ID14). ✓
- Rota `POST /projects` protegida por `JwtAuthGuard` (ID9). ✓
- `ProjectsModule` importado no `AppModule`; `PrismaModule` importado no `ProjectsModule`. ✓
- Nenhum segredo/literal de ambiente escrito no código de produção (variáveis do teste são bootstrap de teste, não segredo em fonte). ✓
- Erros do serviço/repositório propagam (não engolidos); `AllExceptionsFilter` trata exceções globalmente (ID10). ✓