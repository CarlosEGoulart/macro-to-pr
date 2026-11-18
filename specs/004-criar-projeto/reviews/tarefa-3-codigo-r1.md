# Parecer de Código — Tarefa 3

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum. O diff respeita a arquitetura acordada:
- Violação de camada (ID6/ID8): Ausente. O `OAuthDeniedGuard` não acessa Prisma, não grava `Developer`/`GitHubAccount`/`RefreshToken`, não manipula segredos, e não engole erros. O controller continua sem tocar Prisma diretamente (ID6/ID8).
- Segredo/literal de ambiente escrito no código: Ausente. O `AuthService` já usava `ConfigService` (D15); o novo `GitHubOAuthStateStore` não introduz segredos.
- Teste acoplado a detalhe de implementação: O teste e2e (`test/auth-oauth-callback.e2e-spec.ts:423`) prova diretamente CA2: status `403`, corpo sem `accessToken`, zero registros em `gitHubAccount`/`developer`/`refreshToken`, e `nock.isDone()` falso (prova que nenhuma chamada ao GitHub foi feita). Não testa o mock; testa a ausência de efeito colateral.

## Sugestões (não bloqueiam)

- **Abstração criada para um caso só:** Não é indireção sem ganho. A criação do guard é a decisão técnica documentada para a Tarefa 3 (interceptar antes do `401` genérico do `AuthGuard` padrão e produzir um `403` discernível, conforme CA2). É coesa com a camada de autenticação e reutilizável para qualquer `error` do OAuth.
- **Duplicação de regra:** Não há duplicação de regra existente no repo.
- **Teste acoplado a detalhe de implementação / não prova o que diz:** O teste e2e (`test/auth-oauth-callback.e2e-spec.ts:423`) prova diretamente CA2: status `403`, corpo sem `accessToken`, zero registros em `gitHubAccount`/`developer`/`refreshToken`, e `nock.isDone()` falso (prova que nenhuma chamada ao GitHub foi feita). Não testa o mock; testa a ausência de efeito colateral.

## Observações fora do escopo deste diff

Nenhuma candidata a Issue de manutenção decorrente deste diff. O `auth.service.ts` (previsto no plano) não precisou ser alterado porque o guard interrompe o fluxo antes do controller chegar ao serviço — comportamento correto para CA2.

---

## Verificação dos apontamentos aceitos na rodada 1

Não havia apontamentos na rodada 1 para esta tarefa (primeira implementação da CA2). Nenhum ponto foi reaberto.

O veredito final é APROVADO.