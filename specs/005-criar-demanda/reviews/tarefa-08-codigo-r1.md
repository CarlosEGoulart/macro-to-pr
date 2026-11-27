# Parecer de Revisão de Código — Tarefa 8 (Autorizar com GitHub)

## VEREDICTO: APONTAMENTOS

O código está bem estruturado, tipado, sem `any`, e o estado de carregamento é implementado corretamente no caminho de sucesso. Porém, há **dois apontamentos de qualidade bloqueantes** (violação direta dos design tokens e risco de estado de UI travado) que impedem a aprovação sem ressalvas.

---

## Apontamentos bloqueantes (com evidência)

### AP1 — Estado desabilitado do botão usa cor fora do design token
**Arquivo:** `apps/web/src/features/auth/Login.tsx:227`  
**Trecho:**
```tsx
backgroundColor: disabled ? '#9CA3AF' : tokens.primaria,
```
O `docs/design-tokens.md` (seção *Estados de botão → desabilitado*) define para modo claro: **fundo `#C7D2FE`** e **texto `#9CA3AF`**. O código inverte isso: coloca `#9CA3AF` (que é a cor do *texto* desabilitado) como fundo e mantém o texto `#FFFFFF` (branco), que não é a cor prescrita.

Isso fere o princípio do design tokens ("não inventar um botão diferente a cada tela") e consome um token sem usá-lo (`tokens.desabilitado` não é referenciado em lugar nenhum do arquivo).

### AP2 — Estado de carregamento pode ficar travado em caso de falha
**Arquivo:** `apps/web/src/features/auth/Login.tsx:427-432`  
**Trecho:**
```tsx
const handleAuthorizeClick = () => {
  setAuthorizing(true);
  apiService.authGitHub().then(() => {
    window.location.href = '/auth/github';
  });
};
```
Não há tratamento de erro (`.catch`) nem limpeza em `finally`. Se `authGitHub` rejeitar (rede indisponível, backend fora do ar), `authorizing` permanece `true` para sempre: o botão fica desabilitado e com texto "Autorizando..." indefinidamente, sem caminho de recuperação. Isso compromete a qualidade do estado de carregamento especificado na tarefa.

---

## Sugestões (não bloqueantes)

| # | Arquivo:linha | Observação |
|---|---------------|------------|
| S1 | `Login.tsx:21` | `border: '#6B7280'` é um token local que **não existe** em `docs/design-tokens.md`. Se for necessário, deve ser adicionado ao doc de tokens ou removido. |
| S2 | `apiService.ts:40-41` | `authGitHub` e `handleGitHubCallback` chamam `fetch` diretamente, ignorando o `request` que o próprio arquivo declara como "Único ponto de entrada para todas as chamadas à API do front". |
| S3 | `apiService.ts:49` | O `code` é injetado por template literal na URL (`...?code=${code}`) sem `encodeURIComponent` / `URLSearchParams`; códigos com caracteres especiais quebrariam a requisição. |
| S4 | `apiService.ts:6` | `GITHUB_CLIENT_ID` é exportado mas não é usado em nenhum dos dois arquivos da tarefa. |
| S5 | `Login.tsx` (múltiplas) | `role="button"` em `<button>` nativo e `role="heading"` em `<h1>/<h2>/<h3>` nativos são redundantes (esses elementos já possuem esses papéis implicitamente). |

---

## O que está adequado (pontos positivos)

1. **TypeScript:** nenhum `any`, props tipadas em todos os componentes (`AuthorizeButton`, `CardRight`, `Card`, `Step`), `tokens` declarado com `as const`, tipos de retorno em `apiService`. Sem erros de tipo aparentes na leitura estática.
2. **Estrutura React:** componentes pequenos, colocation dentro da feature, props bem tipadas, `type="button"` no botão (evita submissão de form acidental).
3. **Design tokens (modo claro):** `primaria` (`#6164F1`), `superficieCard` (`#FFFFFF`), `superficieSidebar` (`#F9FAFB`), `texto` (`#111827`), `texto-suave` (`#6B7280`), escala de espaçamento (`xs`…`3xl`), família `Inter` e pesos 400/600/700 estão sendo usados corretamente na maior parte dos elementos.
4. **Estado de carregamento (caminho de sucesso):** `useState(false)`, `setAuthorizing(true)` no clique, `disabled={authorizing}`, troca de texto para "Autorizando...", `opacity: 0.6`, `cursor: not-allowed` — implementado e coberto por teste.
5. **Testes:** claros, usam `vitest` + `@testing-library/react` (stack da arquitetura, seção 7), mockam `apiService.authGitHub` e `window.location.href`, verificam tanto a chamada ao fluxo OAuth quanto o botão desabilitado durante a ação.
6. **Acessibilidade:** `aria-label="Login"`, `data-testid` estáveis, `type="button"`.

---

## Nota sobre execução de comandos

Não foi possível rodar `npx tsc --noEmit` nem `npm run test` porque o shell está com permissão negada neste ambiente. O parecer se baseia, portanto, em **revisão estática** dos arquivos contra `docs/architecture.md` e `docs/design-tokens.md`. Recomendo que o implementador rode ambos localmente antes de submeter o PR.

---

**Próximo passo (fluxo UTF):** este parecer deve ser gravado em `specs/005-criar-demanda/reviews/tarefa-08-codigo-r1.md` e submetido à triagem do usuário, que decide quais apontamentos aceita ou recusa (recusa exige justificativa), registrando a decisão em `tarefa-08-decisoes-r1.md`. Eu não corrijo nada — apenas aponto, conforme a regra 7 do `utf-rules.md`.
