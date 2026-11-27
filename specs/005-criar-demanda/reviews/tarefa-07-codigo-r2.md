# Parecer de Código — Tarefa 7, Rodada 2

**Veredito: APROVADO**

Todos os 15 testes passam (3 arquivos de teste, vitest). O diff respeita a arquitetura declarada, não introduz `any`, não viola camadas, não espalha segredos e não engole erros. Não há apontamentos bloqueantes.

## Apontamentos (bloqueiam)

Nenhum.

## Sugestões (não bloqueiam)

1. **Lista de `<Step>` sem `key`** — `Login.tsx:376-391`. Os três componentes `Step` são renderizados dentro de um `<div>` sem `key` prop. O React emitirá aviso de lista sem chave; como a lista é estática e nunca reordenada, não quebra nada, mas boas práticas de React recomendam `key` (ex.: `key={number}`).

2. **Comentário impreciso em `App.tsx`** — `App.tsx:5-9`. O docblock diz "Landing page do Macro2PR", mas o componente na verdade apenas redireciona para `/login` e renderiza `<Login />`. Vale ajustar a descrição para evitar confusão futura.

3. **Uso repetido de `as CSSProperties`** — `Login.tsx` (vários componentes). É funcional e comum para estilos inline no React, mas deixa o componente verboso. Não é um defeito; apenas uma observação de estilo. Se a equipe quiser reduzir a repetição, poderia extrair um helper `styleOf(...)`, mas isso seria indireção para um caso só — o que a arquitetura desencoraja — então manter como está é aceitável.

## Observações fora do escopo deste diff (candidatas a Issue de manutenção)

- Não foi possível executar `npx tsc --noEmit` neste ambiente (ferramenta `shell` indisponível após a suíte de testes). A revisão estática dos arquivos alterados não revelou `any`, tipos incorretos óbvios nem declarações faltando: `tokens` é `as const`, props de `Section` e `Step` estão tipadas, `main.tsx:6` define `type Role = 'Developer' | 'Admin'` inline (sem importar do `Menu` deletado), e `App.tsx` usa apenas APIs de DOM padrão.
- `Menu.tsx` foi deletado e não resta nenhuma referência a ele no `src/` (confirmedo por `grep`: só aparece num comentário de `App.tsx:9`). Atende ao requisito de `main.tsx` não importar mais de `Menu`.
- Pequena divergência de token entre documentos (não de código): `spec.md:71` diz que o texto do botão normal é `#030712`, enquanto `docs/design-tokens.md:59` e o código (`Login.tsx:219`) usam `#FFFFFF`. O código segue o `design-tokens.md` (fonte de tokens); caberá ao revisor de conformidade julgar contra a spec.

## Evidências dos itens avaliados

| Item | Resultado | Evidência |
|------|-----------|-----------|
| 1. TypeScript sem `any`/erros | OK (estático) | `Login.tsx` importa `type ReactNode, type CSSProperties`; `tokens as const`; props tipadas; `Role` union inline em `main.tsx:6`. `tsc` não rodou por limitação do ambiente. |
| 2. Componentes bem estruturados, props tipadas | OK | `Section({children}: SectionProps)`, `Step({number, title, description}: {...})` etc. |
| 3. Design tokens consistentes | OK | `primaria #6164F1`, `primariaHover #4F46E5`, `superficieCard #FFFFFF`, `superficieSidebar #F9FAFB`, `texto #111827`, `textoSuave #6B7280`, `font Inter…` — todos batem com `docs/design-tokens.md` e `spec.md`; espaçamento base 4px (`xs`…`3xl`). |
| 4. Testes claros, incluindo tipografia e hover | OK | 8 testes em `Login.test.tsx`; teste de tipografia (linha 56) e teste de hover (linha 63) presentes e verificam o que se propõem via `toHaveStyle` + `fireEvent`. |
| 5. `App.tsx` minimalista (apenas redireciona) | OK | `App.tsx:11-22`: `useEffect` de redirecionamento + render condicional de `<Login />`; sem `BrowserRouter`, `Menu`, rotas ou módulo extra. |
| 6. `main.tsx` `Role` inline, sem import do `Menu` deletado | OK | `main.tsx:6` `type Role = 'Developer' | 'Admin'`; import de `Menu` removido; `grep` confirma zero referências restantes. |
| 7. Boas práticas React | OK com sugestão | `aria-label`, `type="button"`, `role="heading"`, `data-testid`, `boxSizing`, `cursor: pointer`; única ressalva é falta de `key` nos `Step`. |

Resultado dos testes: `Test Files 3 passed (3), Tests 15 passed (15)`.

Sem apontamentos bloqueantes. Código aprovado para a rodada de revisão de qualidade.
