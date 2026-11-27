---
issue: 5
status: aprovada   # rascunho | aprovada
---

# US03 — Criar Demanda

## O problema

O Desenvolvedor já consegue criar um Projeto associado a um Repositório (US02, entregue), mas não tem como registrar uma Demanda de desenvolvimento dentro desse Projeto. Sem uma Demanda, não há objetivo de alto nível para decompor em Tarefas, não há Plano de Tarefas para aprovar e não há execução para revisar. A plataforma fica sem o ponto de partida do fluxo principal.

## A história

**Como** Desenvolvedor, **eu quero** criar uma Demanda em alto nível dentro de um Projeto meu, **para que** eu possa registrar o objetivo de desenvolvimento que desejo realizar.

<!-- O mesmo texto da story no `docs/prd.md`. Se divergir, o PRD é quem manda. -->

## Critérios de aceite

- [ ] **CA1 — Dado** que possuo um Projeto associado a um Repositório, **quando** informo os dados obrigatórios de uma Demanda (título, descrição, tipo, prioridade), **então** a Demanda é criada, associada ao Projeto, retorna o objeto completo (incluindo o `id` gerado) e passa a estar disponível para os próximos passos do fluxo (gerar Plano de Tarefas).
- [ ] **CA2 — Dado** que deixo um dos dados obrigatórios da Demanda vazio, **quando** tento criá-la, **então** a criação é impedida (HTTP 400) e sou informado sobre qual campo precisa ser preenchido.
- [ ] **CA3 — Dado** que tento criar uma Demanda em um Projeto que não me pertence, **quando** realizo a ação, **então** a criação é impedida (HTTP 403) e sou informado de que não tenho permissão.
- [ ] **CA4 — Dado** que estou na tela de criar Demanda, **quando** abro o seletor de Projeto, **então** a lista de Projetos do desenvolvedor autenticado é exibida (via `GET /projects`) para eu escolher onde associar a Demanda.

## Fora de escopo

- Salvamento de rascunho da Demanda ao fechar a aba (deixa para issue futura).
- Geração automática de Plano de Tarefas ao criar a Demanda (é a US04, issue #6).
- Listagem detalhada de Demandas existentes (será tratada em issue posterior).

## Abandono no meio

O Desenvolvedor pode fechar a aba ou perder a conexão durante o preenchimento do formulário de criação de Demanda. Como não há salvamento de rascunho nesta história, os dados preenchidos são descartados. Ao retornar, ele reinicia o preenchimento do formulário. Se a sessão expirar no meio do uso, o front intercepta o 401, limpa o token e redireciona para o login (reutilizando a lógica existente em `apiService`).

## Assume que

| Premissa | Issue que fecha |
|----------|-----------------|
| O Desenvolvedor já está autenticado com JWT (token válido em `localStorage`). | Issue #3 (US01 — Acessar o Macro2PR com conta GitHub) |
| O Desenvolvedor já criou ao menos um Projeto associado a um Repositório. | Issue #4 (US02 — Criar Projeto) |

## Depende de

Issue #4 (US02 — Criar Projeto) — o Desenvolvedor precisa ter um Projeto existente para associar a Demanda.

Issue #3 (US01 — Acessar o Macro2PR com conta GitHub) — o Desenvolvedor precisa estar autenticado para que a criação de Demanda seja atribuída a ele.

## Decisões de design (UI/UX)

A interface segue o `docs/design-tokens.md` e o protótipo do Figma (tela 1 — Início/Acesso GitHub, tela 2 — Workspace). A paleta segue o modo **claro** do design tokens, não o dark mode:

| Token | Valor (claro) | Uso |
|---|---|---|
| `superficie-card` | `#FFFFFF` | fundo do card principal de login |
| `texto` | `#111827` | títulos e corpo principal |
| `texto-suave` | `#6B7280` | legendas, texto secundário |
| `primaria` | `#6164F1` | botão "Autorizar com GitHub" |
| `superficie-sidebar` | `#F9FAFB` | fundo da aplicação |

### Telas do protótipo Figma (seguidas nesta tarefa)

| Tela | Nome | Descrição |
|---|---|---|
| Tela 1 | Início / Acesso GitHub | Cabeçalho "Macro2PR", "Acesso ao Macro2PR", texto descritivo, card branco com "Transforme demandas em trabalho estruturado e revisável", botão "Autorizar com GitHub" roxo, texto de rodapé |
| Tela 2 | Workspace | "Depois da autorização": 3 cards numerados — 1. Escolha um Repositório, 2. Crie um Projeto, 3. Organize Demandas |

### Botões

| Estado | Cor de fundo | Cor do texto |
|---|---|---|
| normal | `#6164F1` (primária) | `#030712` |
| hover | `#4F46E5` | `#030712` |

### Fontes

| Token | Família · tamanho · peso |
|---|---|
| `display` | Inter · 32px · 700 |
| `heading` | Inter · 24px · 600 |
| `body` | Inter · 16px · 400 |
| `caption` | Inter · 14px · 400 |

## Dúvidas em aberto

| # | Dúvida | Quem responde |
|---|--------|---------------|
