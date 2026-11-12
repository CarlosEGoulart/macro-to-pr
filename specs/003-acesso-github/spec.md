---
issue: 3
status: aprovada   # rascunho | aprovada
---

# US01 — Acessar o Macro2PR com conta GitHub

## O problema

Desenvolvedores não conseguem utilizar o Macro2PR sem primeiro provar a identidade e disponibilizar os Repositórios aos quais têm acesso. Sem essa vinculação, não há como criar Projetos nem executar qualquer demanda.

## A história

**Como** Desenvolvedor, **quero** acessar o Macro2PR autorizando minha conta GitHub, **para que** eu possa utilizar na plataforma os Repositórios aos quais tenho acesso.

<!-- O mesmo texto da story no `docs/prd.md`. Se divergir, o PRD é quem manda. -->

## Critérios de aceite

- [ ] **CA1 — Dado** que ainda não vinculei uma conta GitHub ao Macro2PR, **quando** autorizo o acesso com uma conta válida, **então** passo a acessar a plataforma e os Repositórios aos quais essa conta possui acesso ficam disponíveis para criação de Projeto.
- [ ] **CA2 — Dado** que nego ou interrompo a autorização da conta GitHub, **quando** retorno ao Macro2PR, **então** a vinculação não é concluída, não obtenho acesso autenticado e nenhum Repositório dessa conta é disponibilizado.
- [ ] **CA3 — Dado** que determinado Repositório não está acessível pela conta GitHub autorizada, **quando** consulto os Repositórios disponíveis para criação de Projeto, **então** esse Repositório não é disponibilizado para seleção.

## Fora de escopo

- Compra de créditos de execução (US11–US13).
- Criação de Projeto associado a Repositório (US02).
- Criação de Demanda (US03).
- Geração de Plano de Tarefas (US04).
- Qualquer ação que exija um Desenvolvedor já autenticado e vinculado.

## Abandono no meio

O Desenvolvedor pode fechar a aba ou perder a conexão durante o fluxo de autorização OAuth no GitHub. Nesse caso, a vinculação não é concluída: ao retornar ao Macro2PR, ele não está autenticado e nenhum Repositório é disponibilizado. A sessão expirada ou a revogação do token por parte do GitHub invalida a vinculação vigente e exige nova autorização antes de qualquer acesso aos Repositórios.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| Um provedor OAuth do GitHub está configurado e acessível pelo Macro2PR. | — |

## Depende de

Nenhuma.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
