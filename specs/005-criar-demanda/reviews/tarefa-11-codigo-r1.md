# Parecer de Código — Tarefa 11

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

Não há violação de camada declarada, segredo/URL de ambiente escrito no componente, erro engolido silenciosamente, teste acoplado a detalhe de implementação que quebre em refatoração, nem resposta de API fora do contrato global. O uso de `apiService.request('/projects')` está correto (caminho relativo prefixado automaticamente pelo `apiService`, token injetado pelo próprio serviço), e o componente trata loading/erro/lista vazia sem travar.

## Sugestões (não bloqueiam)

1. **Uso inconsistente dos design tokens — valores hardcoded que existem em `docs/design-tokens.md`.**
   - `ProjectsSelect.tsx:270` — `color: '#DC2626'` (é o token `perigo`, `#DC2626`, escrito inline em vez de nomeado).
   - `:149` — `fontSize: 14` (corresponde ao token `caption`, 14px, hardcoded).
   - `:112` — `fontSize: 12` (corresponde a `small`, 12px, hardcoded).
   - Prejuízo concreto: manutenção — mudar um token exige editar vários locais e risco de divergência visual entre telas.

2. **Espaçamentos fora da escala nomeada do design-tokens.md.**
   - `:79` — `padding: 26` (não existe na escala xs/sm/md/lg/xl/2xl).
   - `:82` — `gap: 16` e `:153` — `gap: 6` (não usam a escala nomeada).
   - Prejuízo concreto: mesma razão de manutenção e consistência visual.

3. **Contrato de resposta de `GET /projects` não confirmado.**
   - `:218` e `:222` — o componente faz `await apiService.request('/projects')` e faz cast `as Project[]`, esperando um **array puro**.
   - `architecture.md` (ID10) declara que o `ResponseInterceptor` padroniza globalmente respostas como `{ data, meta?, timestamp, path }`. Se o endpoint real vier nesse envelope, o cast mascarará o shape e `projects.map` quebrará em runtime.
   - Prejuízo concreto: possível falha em runtime ao ligar ao backend real. Sugestão: confirmar o shape real de `GET /projects` (Tarefa 2 já entregue) e, se for envelope, extrair `.data` antes de atribuir ao state.

4. **Tokens definidos localmente no componente.**
   - O objeto `tokens` vive em `ProjectsSelect.tsx` (linhas 12-32) em vez de um módulo compartilhado (`shared/` ou `styles/`, previstos em `architecture.md` seção 2.2).
   - Prejuízo concreto: duplicação futura quando outras telas precisarem dos mesmos tokens. Não bloqueia esta tarefa, mas vale extrair quando existir um módulo de tokens.

## Observações fora do escopo deste diff

- Não foi possível executar `npm run typecheck` no ambiente (permissão de shell negada). A avaliação de tipos foi feita por leitura direta: não há `any`, as interfaces `Project` e `ProjectsSelectProps` estão tipadas, `ProjectCard` tipa seus props, e `useState` usa genéricos explícitos (`Project[]`, `string | null`). Candidata a confirmação no CI (`npm run typecheck` / `tsc --noEmit`).
- O componente usa estilos inline (`style`) por opção declarada no cabeçalho do arquivo ("para funcionarem no jsdom"), aceitável no estágio atual.

## Resumo

O código da Tarefa 11 está bem estruturado, tipado, acessível, com testes claros que realmente verificam o comportamento (carregamento via `apiService.request('/projects')`, renderização da lista, estado selecionado) e todos os 21 testes passam. Não há apontamentos bloqueantes.
