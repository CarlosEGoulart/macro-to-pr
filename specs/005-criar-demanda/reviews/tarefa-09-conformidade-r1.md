# Parecer de Conformidade — Tarefa 9

**Veredito:** APROVADO

## Critérios verificados

| Critério (do plano/dispatch) | Situação | Onde |
| --- | --- | --- |
| 4 arquivos previstos tocados, nenhum fora da lista | atendido | `git status --short` mostrou exatamente: `demands.controller.ts`, `demands.service.ts`, `tsconfig.build.json`, `tsconfig.json` |
| `npm run build` sem TS2307 | atendido (por análise de config) | `tsconfig.json:5` + `tsconfig.build.json:5-6` — `allowImportingTsExtensions` e `rewriteRelativeImportExtensions` |
| Quebra o loop ".js ausente impede build / build ausente impede .js" | atendido | `tsconfig.json:5`, `tsconfig.build.json:5-6` — permite importar `.ts` via extensão `.js`/`.ts` e reescreve para `.js` na emissão |
| Critério de aceite da tarefa 9 coberto | atendido | Diff alinha ao texto do plan.md: "ajuste de extensões de importação para `.ts` ou configuração de `moduleResolution`/`allowImportingTsExtensions"` |

## Apontamentos

Nenhum.

## Evidências do diff

**1. `apps/api/tsconfig.json`** (linha 5 — nova):
```
+    "allowImportingTsExtensions": true,
```
Permite que o TypeScript resolva imports com extensão `.js` apontando para arquivos `.ts`, removendo a necessidade de `.js` pré-existente para compilar.

**2. `apps/api/tsconfig.build.json`** (linhas 5-6 — novas):
```
+    "allowImportingTsExtensions": true,
+    "rewriteRelativeImportExtensions": true
```
Na emissão de build, reescreve as extensões de importação relativa para `.js`, garantindo que o código emitido esteja conforme a resolução de módulos do Node (nodenext).

**3. `apps/api/src/modules/demands/demands.controller.ts`** (linha 3 — corrigida):
```
-import { CurrentUser } from '../common/decorators/current-user.decorator.js';
+import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
```
Caminho corrigido: de `src/modules/demands/` para `src/common/decorators/` são dois níveis acima (`../../common/`), não um (`../common/`).

**4. `apps/api/src/modules/demands/demands.service.ts`** (linha 4 — corrigida):
```
-import { ProjectsRepository } from '../../projects/projects.repository.js';
+import { ProjectsRepository } from '../projects/projects.repository.js';
```
Caminho corrigido: de `src/modules/demands/` para `src/modules/projects/` é um nível acima (`../projects/`), não dois (`../../projects/`).

## Conformidade com o spec/plan

- **Escopo:** exatamente os 4 arquivos previstos no plan.md (Tarefa 9), sem arquivos fora da lista — sem escopo inflado.
- **Critério de aceite:** o plan.md exige que `npm run build` conclua sem TS2307. As mudanças de configuração e os ajustes de caminho de importação são exatamente o mecanismo necessário para eliminar o erro "não builda porque não tem .js / não tem .js porque não buildou" sob `module: "nodenext"`.
- **Não houve alteração de comportamento funcional**, apenas correção de caminhos de importação e configuração de compilação — sem inventar comportamento que a spec não pediu.

**Nota metodológica:** não foi possível executar `npm run build` neste ambiente (o shell bloqueou comandos de build/typecheck). A aprovação se baseia na análise direta do diff e do conteúdo dos arquivos de configuração, que implementam exatamente o prescrito no plan.md para a Tarefa 9.
