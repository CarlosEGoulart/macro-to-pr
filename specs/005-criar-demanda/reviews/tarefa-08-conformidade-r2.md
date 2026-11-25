# Parecer de Conformidade — Tarefa 8, Rodada 2

## VEREDICTO: APROVADO

> Observação de ambiente: o comando `npm run test` não pôde ser executado (shell rejeitado por permissão). A decisão de conformidade baseia-se na leitura integral do diff exato solicitado e dos três arquivos no estado pós-diff.

## Critérios verificados

| Critério (da spec/plan) | Situação | Onde |
| --- | --- | --- |
| AP1 (R1): cor do estado desabilitado usa design tokens (`tokens.desabilitado` / `tokens.textoSuave`) | atendido | `Login.tsx:228-229` |
| AP2 (R1): loading não trava em falha — usa `.catch` e `.finally` | atendido | `Login.tsx:430-436` |
| fill-rule/clipRule corrigidos para camelCase React | atendido | `Login.tsx:259` |
| `authGitHub` com tratamento de erro (`try/catch`) | atendido | `apiService.ts:40-47` |
| Apenas os 3 arquivos previstos tocados; nenhum fora da lista | atendido | diff exato (3 arquivos) |
| Teste: clique no botão dispara fluxo OAuth (`apiService.authGitHub` chamado) | atendido | `Login.test.tsx:102-110` |
| Teste: botão exibe estado de carregamento durante a ação (`disabled`) | atendido | `Login.test.tsx:112-122` |
| Critério de aceite da Tarefa 8 (US01 — tela de acesso) coberto | atendido | `Login.tsx` + `Login.test.tsx` |

## Apontamentos

Sem apontamentos. A seção fica vazia e o veredito é APROVADO.

---

### Evidência por item

**1. AP1 corrigido** — O botão desabilitado agora usa `tokens.desabilitado` (`#C7D2FE`) para o fundo e `tokens.textoSuave` (`#6B7280`) para o texto, conforme diff:
```
backgroundColor: disabled ? tokens.desabilitado : tokens.primaria,
color: disabled ? tokens.textoSuave : '#FFFFFF',
```
O token `desabilitado: '#C7D2FE'` foi adicionado ao objeto `tokens` (`Login.tsx:20`).

**2. AP2 corrigido** — O handler de clique encerra o loading em todos os desfechos:
```js
apiService.authGitHub().then(() => {
  window.location.href = '/auth/github';
}).catch((error) => {
  console.error('Erro ao iniciar autorização GitHub:', error);
}).finally(() => {
  setAuthorizing(false);
});
```
(`Login.tsx:428-436`)

**3. fillRule/clipRule** — O SVG passou de `fill-rule="evenodd" clip-rule="evenodd"` para `fillRule="evenodd" clipRule="evenodd"` (`Login.tsx:259`).

**4. Erro em authGitHub** — `apiService.authGitHub` agora envolve o `fetch` em `try/catch`, repaginando o erro após logar (`apiService.ts:40-47`). Também foi adicionado `handleGitHubCallback` para o callback/token, dentro do escopo declarado de `apiService.ts` na tarefa 8.

**5. Arquivos tocados** — O diff exato retornou exatamente três arquivos, todos previstos no plan: `Login.tsx`, `apiService.ts`, `Login.test.tsx`. Nenhum arquivo fora da lista.

**6. Teste de componente** — Duas asserções cobrem o critério da tarefa 8:
- `expect(apiService.authGitHub).toHaveBeenCalled()` após `fireEvent.click` (fluxo OAuth disparado).
- `expect(button).toBeDisabled()` após o clique (estado de carregamento), com o botão exibindo "Autorizando..." enquanto `authorizing` está true (`Login.tsx:256-257`).

**Critério de aceite da Tarefa 8** — Coberto: US01 (tela de acesso) tem o botão "Autorizar com GitHub" iniciando o fluxo OAuth e exibindo loading durante a ação.

Não há comportamento implementado que a spec não pediu, não houve escopo inflado, e não há apontamentos de R1 pendentes.
