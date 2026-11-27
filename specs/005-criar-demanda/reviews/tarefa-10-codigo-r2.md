# Parecer de Código — Tarefa 10, Rodada 2

**Veredito:** APROVADO

## Apontamentos (bloqueiam)

Nenhum.

## Análise por critério (conforme plano da Tarefa 10)

| Critério | Avaliação |
|----------|-----------|
| **AP1 corrigido** | Sim. `projects.module.ts` agora declara `exports: [ProjectsRepository]` (linha 11); `demands.module.ts` importa `ProjectsModule` (linha 5) e o inclui em `imports` (linha 9); `demands.module.ts` **não** declara `ProjectsRepository` em seus próprios `providers` (linha 11: apenas `DemandsService, DemandsRepository`). |
| **ID6 (separação estrita de camadas)** | Respeitado. `ProjectsModule` continua dono de `ProjectsRepository` e o expõe explicitamente via `exports`; `DemandsModule` não assume titularidade do provider alheio, apenas consome o que é exportado. Cada módulo é dono de seu provider. |
| **TypeScript / tipos / imports** | Sem `any`. Imports com extensão `.js`, consistentes com o restante da base (Nest v12 ESM, ajuste da Tarefa 9). Tipos corretos. |
| **Duplicação / providers órfãos** | Não há. `ProjectsRepository` aparece uma única vez como provider (em `ProjectsModule`) e uma única vez como export. Não sobrou provider órfão em `DemandsModule`. |
| **Boas práticas de NestJS DI** | Corretas. Uso padrão de cross-module DI via `exports` + `imports`. Injetar o `ProjectsRepository` diretamente no `DemandsService` (e não via `ProjectsService`) evita indireção sem ganho — o architecture.md (ID8) determina que o Service acesse o Repository, não o Prisma direto. |

## Evidência do diff

`apps/api/src/modules/projects/projects.module.ts`:
```
   providers: [ProjectsService, ProjectsRepository],
+  exports: [ProjectsRepository],
```

`apps/api/src/modules/demands/demands.module.ts`:
```
+import { ProjectsModule } from '../projects/projects.module.js';
 import { PrismaModule } from '../../prisma/prisma.module.js';
 
 @Module({
-  imports: [PrismaModule],
+  imports: [PrismaModule, ProjectsModule],
   controllers: [DemandsController],
   providers: [DemandsService, DemandsRepository],
 })
```

O `DemandsService` (arquivo pré-existente, não tocado por este diff) injeta `ProjectsRepository` no construtor (linha 10) e o usa em `create()` para a regra de permissão CA3 (`findProjectByIdAndDeveloper`). Com a exportação/importação acima, o NestJS resolve a dependência sem `UnknownDependenciesException`, atendendo ao teste de aceitação da tarefa (`npm run start` sobe sem exceção de DI).

## Sugestões (não bloqueantes)

Nenhuma exigida para este diff. A solução é minimal e correta.

## Observações fora do escopo deste diff (candidatas a Issue de manutenção)

- `demands.service.ts:23` faz uma checagem `project.developerId !== developerId` que é redundante com o filtro já aplicado em `projects.repository.ts:30-38` (`findProjectByIdAndDeveloper` filtra por `developerId` no `where`). Arquivo **não tocado** por este diff — registro apenas como observação, não como bloqueio desta tarefa.
