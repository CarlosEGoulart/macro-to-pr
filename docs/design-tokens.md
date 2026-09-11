# 🎨 Tokens de Design

**Projeto:** Macro2PR
**Versão:** 1.0.0
**Última atualização:** 2026-09-11

> 🤖 **Este documento existe para a IA parar de inventar um botão diferente a cada
> tela.** Não é um design system — é o mínimo que dá à prototipagem assistida algo a
> que obedecer.
>
> ✍️ **Não preencha na mão:** rode `/utf-design` (depois do `/utf-flows`).

---

## Paleta

Nome semântico, nunca `azul-2` — a cor muda, o papel dela não.

| Token | Light | Dark | Onde se usa |
| --- | --- | --- | --- |
| `primaria` | `#6366F1` | `#818CF8` | botões principais, links de ação, indicadores de progresso |
| `superficie-card` | `#FFFFFF` | `#111827` | fundo de card |
| `superficie-sidebar` | `#F9FAFB` | `#030712` | sidebar e fundo de página |
| `texto` | `#111827` | `#F9FAFB` | texto padrão (títulos, corpo) |
| `texto-suave` | `#6B7280` | `#9CA3AF` | legendas, apoio, texto secundário |
| `perigo` | `#DC2626` | `#F87171` | erro, exclusão, rejeição |
| `sucesso` | `#16A34A` | `#4ADE80` | confirmação, aprovação, conclusão |
| `desabilitado` | `#C7D2FE` | `#374151` | fundo de controle inativo |

## Escala de espaçamento

Uma progressão só, usada em tudo. Base 4px.

| Token | Valor |
| --- | --- |
| `xs` | `4px` |
| `sm` | `8px` |
| `md` | `12px` |
| `lg` | `16px` |
| `xl` | `24px` |
| `2xl` | `32px` |
| `3xl` | `48px` |

## Tipografia

| Token | Família · tamanho · peso | Papel |
| --- | --- | --- |
| `display` | Inter · 32px · 700 | títulos de página |
| `heading` | Inter · 24px · 600 | seções |
| `subheading` | Inter · 18px · 600 | subseções, cards |
| `body` | Inter · 16px · 400 | texto corrido |
| `caption` | Inter · 14px · 400 | labels, texto secundário |
| `small` | Inter · 12px · 400 | notas, badges |

## Estados de botão

| Estado | Light | Dark |
| --- | --- | --- |
| normal | fundo `#6366F1`, texto `#FFFFFF`, sem borda | fundo `#818CF8`, texto `#030712`, sem borda |
| hover | fundo `#4F46E5` | fundo `#A5B4FC` |
| foco (teclado) | borda `2px solid #818CF8`, outline none | borda `2px solid #6366F1`, outline none |
| desabilitado | fundo `#C7D2FE`, texto `#9CA3AF`, sem interação | fundo `#374151`, texto `#6B7280`, sem interação |
| carregando | fundo `#6366F1` opacidade 70%, spinner branco | fundo `#818CF8` opacidade 70%, spinner preto |

## Protótipo

**Link:** pendência — protótipo não existe ainda.

**Telas** (5 essenciais):
1. **Dashboard** — visão geral de projetos e demandas
2. **Detalhe da Demanda** — status, plano, tarefas e ações
3. **Revisão de Código** — diff, aprovar/rejeitar, comentários
4. **Compra de Créditos** — seleção de pacote, pagamento
5. **Configurações de Projeto** — gerenciamento, membros, integrações
