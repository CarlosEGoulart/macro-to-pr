# Parecer de Código — Tarefa 0

**Veredito:** APONTAMENTOS

## Apontamentos (bloqueiam)

1. **Segredo de JWT escrito no código (fallback hardcoded)** — `apps/api/src/modules/auth/jwt.strategy.ts:12`
   Regra violada: **ID17** do `docs/architecture.md` — "Nenhum segredo no repo ... zero secrets no repo" e "`.env` nunca é versionado"; também do `revisor-codigo.md`: "Nenhum segredo, chave ou URL de ambiente escrita no código."
   Prejuízo concreto: quando `JWT_SECRET` não está definido no ambiente, o `JwtStrategy` usa silenciosamente `'dev-secret-change-me'` como chave de assinatura e validação de JWTs. Essa chave fica **commitada no repositório**, é previsível e não rotacionável; qualquer pessoa com acesso ao repo pode forjar tokens válidos e quebrar a autenticação de todas as rotas protegidas (incluindo a `POST /projects` da Issue #4). A falha não é evidente: a aplicação sobe, mas com um segredo fixo exposto.

## Sugestões (não bloqueiam)

- Remover o fallback `'dev-secret-change-me'`; exigir `JWT_SECRET` via `ConfigService` (falhar com erro claro se ausente, em vez de silenciar com um valor fixo).
- Criar `apps/api/.env.example` com `DATABASE_URL` e `JWT_SECRET` (valores de exemplo, sem segredos reais) e manter o `.env` local, não versionado. O `architecture.md` (seção 8) prevê `.gitignore` apenas na Entrega 2, então não commitar `.env` agora está correto — mas a variável `DATABASE_URL` não está definida em nenhum lugar do diff (o bloco `datasource db` do `schema.prisma` não tem `url`). O `PrismaService` não conseguirá conectar ao Postgres em nenhum ambiente até que a variável seja injetada, o que impede a própria finalidade da Tarefa 0 (infra que destra a Issue #4).
- `docker-compose.yml` (Postgres) está previsto no plano mas não foi criado; sem ele, o ambiente de desenvolvimento local não sobe o banco.

## Observações fora do escopo deste diff

- `apps/api/src/main.ts:21` usa `process.env.PORT` (pré-existente, não toca neste diff) — candidata a migração para `ConfigService` (ID17) em uma Issue de manutenção.
- Não existe `.gitignore` ainda (o `architecture.md` o coloca na Entrega 2); até lá, cuidado para não versionar `.env`.
- Nenhum teste de unidade/integração acompanha esta infra (o plano prevê ciclo RED→GREEN para a tarefa); os testes e2e vêm na Tarefa 5.

---

**Notas do que está correto neste diff (não é apontamento):**
- `JwtAuthGuard` **não** está aplicado globalmente (não usa `APP_GUARD`); foi adicionado apenas como provider, ficando disponível para `@UseGuards` por rota nas tarefas seguintes, conforme exigido.
- `jwt.strategy.ts` usa `ConfigService` em vez de `process.env` (ID17 respeitado na leitura da variável; o problema é só o fallback hardcoded).
- Nenhum controller acessa Prisma diretamente (ID6/ID8 respeitados; infra fica em `prisma/` e `modules/auth/`).
- Os modelos `Developer` e `Repository` no `schema.prisma` estão coerentes com o diagrama ER do `architecture.md` (relações 1–N e 1–1 com `GitHubAccount` como referência futura, já que aquela entidade vem da Issue #3).
- Não há duplicação de regra nem abstração de caso único: `PrismaService`/`PrismaModule` são infra genérica reutilizada por todos os módulos futuros.

Para desbloquear, basta remover o segredo hardcoded do `jwt.strategy.ts` e garantir que `JWT_SECRET` e `DATABASE_URL` venham exclusivamente do ambiente (via `.env` local não versionado + `.env.example`).