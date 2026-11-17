---
issue: 4
status: aprovada   # rascunho | aprovada
---

# US02 — Criar Projeto

## O problema

Desenvolvedores conseguem acessar o Macro2PR com conta GitHub (US01), mas não têm como organizar seu trabalho em Projetos. Sem um Projeto, não há como associar um Repositório autorizado a um contexto de desenvolvimento, nem criar Demandas ou gerar Planos de Tarefas. O desenvolvedor fica sem um lugar para agrupar seu trabalho.

## A história

**Como** Desenvolvedor, **quero** criar um Projeto associando um Repositório ao qual tenho acesso, **para que** eu possa organizar e executar demandas de desenvolvimento relacionadas a esse código.

<!-- O mesmo texto da story no `docs/prd.md`. Se divergir, o PRD é quem manda. -->

## Critérios de aceite

- [ ] **CA1 — Dado** que estou autenticado e tenho acesso a um Repositório válido, **quando** confirmo a criação do Projeto associado a ele, **então** o Projeto é criado e passa a aparecer entre meus Projetos.
- [ ] **CA2 — Dado** que não tenho acesso ao Repositório escolhido ou ele não está disponível, **quando** tento criar o Projeto, **então** o Projeto não é criado e sou informado do impedimento.
- [ ] **CA3 — Dado** que já existe um Projeto meu associado a este Repositório, **quando** tento criar outro Projeto para o mesmo Repositório, **então** o Projeto não é criado e sou informado da restrição.

**Regras relacionadas:** RN01, RN08

## Fora de escopo

- Associação de mais de um Projeto ao mesmo Repositório para o mesmo Desenvolvedor (já impedida pela RN01, mas a validação de negócio e a mensagem de erro são tratadas aqui como CA3).
- Criação de Demanda dentro do Projeto (US03).
- Geração de Plano de Tarefas (US04).
- Qualquer ação que exija um Projeto já existente (US05–US10).

## Abandono no meio

O Desenvolvedor pode fechar a aba ou perder a conexão durante o preenchimento do formulário de criação de Projeto. Nesse caso, nenhum Projeto é criado. Se a conexão cair após o envio do formulário mas antes da confirmação no banco, a transação é desfeita e nenhum Projeto fica órfão.

## Assume que

| Premissa | Issue que fecha |
| --- | --- |
| O Desenvolvedor já possui uma Conta GitHub vinculada (US01 concluída). | Issue #3 |
| Pelo menos um Repositório está disponível na Conta GitHub vinculada (sincronizado via US01/Tarefa 4 da Issue #3). | Issue #3 |

## Depende de

Issue #3 (US01 — Acessar o Macro2PR com conta GitHub) — o Desenvolvedor precisa estar autenticado e ter Repositórios sincronizados.

## Dúvidas em aberto

| # | Dúvida | Quem responde |
| --- | --- | --- |
