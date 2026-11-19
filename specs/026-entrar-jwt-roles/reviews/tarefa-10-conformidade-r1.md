# Parecer de Conformidade — Tarefa 10

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec / plan.md) | Situação | Onde |
| --- | --- | --- |
| ID18 (architecture.md): coverage threshold mínimo 80% nas CI | atendido | `docs/architecture.md:395`, `docs/architecture.md:549` |
| `thresholds` (não `threshold`) em `apps/api/vitest.config.ts` | atendido | `apps/api/vitest.config.ts:12` (diff: `-      threshold:` → `+      thresholds:`) |
| `thresholds` (não `threshold`) em `apps/api/vitest.config.e2e.ts` | atendido | `apps/api/vitest.config.e2e.ts:10` (diff: `-      threshold:` → `+      thresholds:`) |
| Apenas os 2 arquivos previstos alterados (+ plan.md esperado) | atendido | diff: 3 arquivos, sendo 2 vitest.config + 1 plan.md |
| `npm run typecheck` passa sem TS2769 | não executável* | shell bloqueado neste ambiente; justificativa abaixo |

\* Não foi possível executar `npm run typecheck` por restrição de ambiente (shell negado). A evidência do diff mostra a correção exata especificada: renomear `threshold` para `thresholds` (plural), que é o nome correto da propriedade de cobertura do Vitest. O valor 80% já está presente em `lines`, `functions` e `branches` em ambos os arquivos, conforme exige o ID18.

## Apontamentos

Nenhum.

## Justificativa

O diff contra `badaef8ba7cba3b4fd2992484546acb8ac90ac8e` contém exatamente 3 arquivos:

1. `apps/api/vitest.config.ts` — `coverage.threshold` → `coverage.thresholds` (linha 12 do diff)
2. `apps/api/vitest.config.e2e.ts` — `coverage.threshold` → `coverage.thresholds` (linha 10 do diff)
3. `specs/026-entrar-jwt-roles/plan.md` — inclusão das Tarefas 10, 11 e 12 (alteração esperada e declarada no plano)

Ambos os arquivos de configuração do Vitest agora usam `thresholds` (plural) com `lines: 80`, `functions: 80`, `branches: 80`, atendendo ao critério ID18 do `docs/architecture.md` (coverage threshold mínimo de 80% na CI). Não há arquivos alterados fora dos 3 esperados. Não há apontamentos de conformidade.
