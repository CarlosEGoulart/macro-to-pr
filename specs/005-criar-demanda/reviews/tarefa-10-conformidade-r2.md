# Parecer de Conformidade — Tarefa 10, Rodada 2

## Veredito: APROVADO

O apontamento aceito na triagem R1 foi corrigido integralmente. A conformidade contra o spec/plan está atendida.

---

## 1. O apontamento foi corrigido? — SIM

Evidência via `git diff 686dff0...`:

**`apps/api/src/modules/demands/demands.module.ts`**
- Adicionado `import { ProjectsModule } from '../projects/projects.module.js';`
- `imports` passou de `[PrismaModule]` para `[PrismaModule, ProjectsModule]`
- `providers` continua `[DemandsService, DemandsRepository]` — **`ProjectsRepository` NÃO está mais duplicado aqui** ✓

**`apps/api/src/modules/projects/projects.module.ts`**
- Adicionado `exports: [ProjectsRepository]` — o repositório agora é exportado pelo módulo dono ✓

Isso implementa exatamente o prescrito: `ProjectsModule` detém e exporta `ProjectsRepository`; `DemandsModule` o consome via importação de módulo, sem redeclarar o provider (ID6 respeitada).

---

## 2. `npm run start` sobe sem `UnknownDependenciesException`?

**Não pôde ser executado empiricamente:** o sandbox bloqueia comandos `npm`, `node` e `npx` (`Permission denied: shell`). Apenas `git` e comandos de filesystem estão disponíveis.

Validação estática (leitura do código), que é suficiente para julgar a correção de DI:

- `DemandsService` injeta `ProjectsRepository` (linha 10 de `demands.service.ts`) → a dependência é real e necessária.
- `ProjectsRepository` é `provided` por `ProjectsModule` (linha 10 de `projects.module.ts`) e agora `exported` (linha 11).
- `DemandsModule` `imports` `ProjectsModule` → `ProjectsRepository` fica disponível para injeção em `DemandsService`.
- `ProjectsRepository` depende de `PrismaService`, fornecido por `PrismaModule`, que `ProjectsModule` já importa → cadeia de dependências completa.

Com essa configuração, o NestJS resolve `ProjectsRepository` via importação de módulo, não havendo provider desconhecido. A exceção `UnknownDependenciesException` não deve ocorrer.

---

## 3. Critério de aceite da Tarefa 10 coberto? — SIM

O critério de aceitação é: "`npm run start` em `apps/api` sobe a API na porta 3000 sem `UnknownDependenciesException`; o endpoint `GET /auth/github` responde".

A correção de DI remove a causa raiz que impediria o backend de subir (provider duplicado / não resolvido no `DemandsModule`). Com o DI correto, o `AppModule` (que importa `DemandsModule`) instancia o grafo de dependências sem exceção, permitindo que a API suba e `GET /auth/github` responda. Critério coberto.

---

## 4. Apenas os arquivos necessários foram tocados? — SIM (com ressalva de tracking)

Arquivos modificados (contra o SHA base):
1. `apps/api/src/modules/demands/demands.module.ts` — **necessário e previsto** para a tarefa ✓
2. `apps/api/src/modules/projects/projects.module.ts` — **necessário** (é onde fica o `exports`) ✓
3. `specs/005-criar-demanda/plan.md` — modificado, mas **não é um arquivo de código previsto para a Tarefa 10** (o plan lista apenas `demands.module.ts`). A alteração no plan apenas marca a **Tarefa 9** como `[x]`; a **Tarefa 10 permanece `[ ]`** no plano. É uma inconsistência de tracking, não um bloqueio de código.

---

## Observação sobre limitações

Não foi possível rodar `npm run start` (nem `npm run build`/`typecheck`) devido a restrições do ambiente de execução (sandbox bloqueia `npm`/`node`/`npx`). O veredito se baseia na análise estática direta dos arquivos modificados e na cadeia de dependências do NestJS, que está correta.

Se desejar, pode rodar localmente:
```bash
cd /workspaces/macro-to-pr/apps/api && npm run start
```
e confirmar que não há `UnknownDependenciesException` e que `GET /auth/github` responde.
