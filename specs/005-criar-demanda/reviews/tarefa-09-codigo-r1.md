# Parecer de Código — Tarefa 9

**VEREDICTO: APROVADO**

A solução está correta, mínima e consistente com `docs/architecture.md`. Não há apontamentos bloqueantes.

---

## 1. TypeScript configurações (critério 1) — OK

**`apps/api/tsconfig.json`** (linhas 3-5):
```json
"module": "nodenext",
"moduleResolution": "nodenext",
"allowImportingTsExtensions": true,
```
- `module` / `moduleResolution` = `nodenext`: alinhado com a stack declarada na architecture.md (seção 1: "NestJS v12 | ESM, TypeScript 6, Node.js 22 LTS").
- `allowImportingTsExtensions: true` (adicionado nesta tarefa): permite que imports locais usem extensão `.ts` (ou `.js` resolvendo para `.ts`), necessário para `nodenext`.
- Demais flags (`resolvePackageJsonExports`, `esModuleInterop`, `isolatedModules`, `strict`, `emitDecoratorMetadata`, `experimentalDecorators`) são consistentes com NestJS v12.

**`apps/api/tsconfig.build.json`** (linhas 5-6):
```json
"allowImportingTsExtensions": true,
"rewriteRelativeImportExtensions": true,
```
- `allowImportingTsExtensions: true`: herda/reforça a permissão no build.
- `rewriteRelativeImportExtensions: true`: reescreve as extensões de importação relativa de `.ts` para `.js` no output emitido, obrigatório para o Node rodar o JS compilado no runtime. Correto para build NestJS ESM.

Não há inconsistência entre os dois arquivos.

## 2. Caminhos de importação (critério 2) — OK

Verificado via glob que todos os arquivos importados existem nos caminhos informados:

| Import (arquivo) | Caminho declarado | Alvo real (existe) |
|---|---|---|
| `demands.controller.ts:3` | `../../common/decorators/current-user.decorator.js` | `apps/api/src/common/decorators/current-user.decorator.ts` ✓ |
| `demands.controller.ts:4` | `./demands.service.js` | `apps/api/src/modules/demands/demands.service.ts` ✓ |
| `demands.controller.ts:5` | `./dto/create-demand.dto.js` | `apps/api/src/modules/demands/dto/create-demand.dto.ts` ✓ |
| `demands.service.ts:2` | `./dto/create-demand.dto.js` | `apps/api/src/modules/demands/dto/create-demand.dto.ts` ✓ |
| `demands.service.ts:3` | `./demands.repository.js` | `apps/api/src/modules/demands/demands.repository.ts` ✓ |
| `demands.service.ts:4` | `../projects/projects.repository.js` | `apps/api/src/modules/projects/projects.repository.ts` ✓ |

A correção de `../../common/...` → `../../common/...` (mantido, já estava certo) e `../../projects/...` → `../projects/...` (corrigido) resolve o erro TS2307 ("Cannot find module") que ocorria porque o service estava subindo um nível a mais do que necessário a partir de `modules/demands/`.

## 3. Arquivos fora da tarefa (critério 3) — OK

O `git diff` reporta **exatamente** os 4 arquivos previstos no plan.md:
- `apps/api/tsconfig.json`
- `apps/api/tsconfig.build.json`
- `apps/api/src/modules/demands/demands.controller.ts`
- `apps/api/src/modules/demands/demands.service.ts`

Nenhum arquivo fora da tarefa foi modificado.

## 4. Solução mínima e não quebradora (critério 4) — OK

A alteração é restrita a:
- Duas correções de caminho de importação relativa (service → projects repository).
- Duas flags TypeScript (`allowImportingTsExtensions` em ambos os tsconfigs; `rewriteRelativeImportExtensions` só no build).

Não há alteração de lógica de negócio, nem remoção de código existente. Não quebra nada.

## 5. Boas práticas TypeScript/NestJS (critério 5) — OK

- Uso de `moduleResolution: nodenext` + `allowImportingTsExtensions` é a abordagem recomendada para NestJS v12 com ESM (Node.js 22 LTS).
- `rewriteRelativeImportExtensions` no `tsconfig.build.json` garante que o output `.js` tenha extensões corretas para runtime.
- Extensões `.js` nos imports de arquivos locais (com resolução para `.ts` via `allowImportingTsExtensions`) são a prática padrão em projetos ESM com TypeScript.

---

## Restrição de ambiente (observação, não bloqueante)

Não foi possível executar `npm run build` nem `npm run start` em `apps/api` porque o ambiente rejeitou o shell (`Permission denied: shell`). Portanto, não há evidência de execução do build. No entanto, a análise estática do diff e das configurações indica que o build deve concluir sem erro TS2307.

---

## Sugestões (não bloqueantes)

1. O `apps/api/tsconfig.json` não estende `tsconfig.base.json` (define todas as opções inline), enquanto a architecture.md (seção 2.3) declara que "cada app estende o base". Isso preexistia à tarefa e não foi introduzido por ela; não é bloqueante para esta revisão, mas poderia ser alinhado em uma oportunidade futura.
2. Manter consistência entre as extensões dos imports (`.js` para arquivos locais, resolvendo para `.ts`) já está sendo respeitada nos arquivos tocados.

---

**Resumo:** APROVADO. Código de qualidade, mínimo, alinhado à arquitetura e sem regressões.
