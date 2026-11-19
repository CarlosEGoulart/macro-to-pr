---
issue: 26
status: aprovada   # rascunho | aprovada
---

# US26 — Entrar no sistema com JWT e controle de papéis (adaptado OAuth)

## O problema

O backend já emite JWT via callback OAuth (US01, Issue #3), mas não há Guard de autenticação global: rotas nascem abertas por padrão e só são protegidas quando o desenvolvedor lembra de adicionar `@UseGuards(JwtAuthGuard)` à mão. Não existe controle de papéis (`RolesGuard`), então não há 403 para quem não tem o papel exigido. O Swagger não exibe o botão Authorize (Bearer). O frontend não existe de fato — `apps/web/` é só o template Vite padrão, sem tela de login, sem camada de serviço que anexe o token, sem tratamento de 401. Em resumo: o JWT existe, mas não protege nada de verdade.

## A história

**Como** Desenvolvedor ou Admin, **quero** que o sistema proteja as rotas com JWT global, controle de papéis com 403 e o front envie o token em toda chamada, **para que** o acesso autenticado e a autorização sejam válidos em toda a plataforma.

<!-- O mesmo texto da story no `docs/prd.md`. Se divergir, o PRD é quem manda. -->

## Critérios de aceite

- [ ] **CA1 — Dado** que chamo uma rota protegida sem token, **quando** faço a requisição, **então** a API responde **401**.
- [ ] **CA2 — Dado** que sou Desenvolvedor e chamo uma rota de Admin, **quando** uso meu token, **então** a API responde **403** (não 500, não 200).
- [ ] **CA3 — Dado** que o Guard de autenticação está global, **quando** uma rota não está marcada como pública, **então** ela fecha automaticamente.
- [ ] **CA4 — Dado** que acesso o Swagger, **quando** vejo uma rota protegida, **então** ela exibe o botão **Authorize** (Bearer).
- [ ] **CA5 — Dado** que estou logado, **quando** o front faz qualquer chamada à API, **então** o cabeçalho `Authorization: Bearer <token>` é enviado **em um lugar só** (camada de serviço).
- [ ] **CA6 — Dado** que o token expira no meio do uso, **quando** a API responde 401, **então** o front limpa o token e me leva de volta ao login, em um lugar só.
- [ ] **CA7 — Dado** que chamo uma rota protegida com token adulterado, **quando** faço a requisição, **então** a API responde **401** (assinatura conferida de verdade).

## Fora de escopo

- Cadastro e login por e-mail + senha (o acesso é só OAuth GitHub, US01).
- Campo `passwordHash` no banco.

## Abandono no meio

O Desenvolvedor pode fechar a aba ou perder a conexão durante o fluxo de autorização OAuth no GitHub. Nesse caso, a vinculação não é concluída: ao retornar ao Macro2PR, ele não está autenticado e nenhum Repositório é disponibilizado. Se o token JWT expirar no meio do uso, a API responde 401 e o front deve levá-lo de volta ao login, sem exibir tela vazia ou silenciosa. A revogação do token por parte do GitHub invalida a vinculação vigente e exige nova autorização antes de qualquer acesso aos Repositórios.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| O provedor OAuth do GitHub está configurado e acessível pelo Macro2PR. | Issue #3 |
| O JWT já é emitido com sucesso no callback OAuth (access + refresh). | Issue #3 |

## Depende de

Issue #3 (US01 — Acessar o Macro2PR com conta GitHub) — o Desenvolvedor precisa estar autenticado via OAuth para que o Guard de autenticação e o Guard de papéis tenham um token válido para verificar.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
|---|--------|---------------|
|   |   |   |
