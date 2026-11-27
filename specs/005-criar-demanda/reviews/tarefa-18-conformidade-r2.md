# PARECER DE CONFORMIDADE — TAREFA 18 (segunda passagem, r2)

**Issue:** #5 (005-criar-demanda)  
**Base SHA:** b5674112534e19f27d737471551915baf9b3a137  
**Spec:** specs/005-criar-demanda/spec.md (status: aprovada)  
**Plano:** specs/005-criar-demanda/plan.md (tarefa 18)

---

## Veredito: APROVADO

Todos os 10 pontos verificados estão CONFORME. Não há não-conformidade a reportar.

---

## Critérios verificados (conformidade contra spec.md e plan.md da tarefa 18)

| # | Ponto a verificar | Status | Evidência |
|---|-------------------|--------|-----------|
| 1 | Backend: `DemandsController` tem `@UseGuards(JwtAuthGuard)` na classe ou no método `findOne` (`@Get(':id')`) | CONFORME | `apps/api/src/modules/demands/demands.controller.ts`: `@UseGuards(JwtAuthGuard)` colocado diretamente acima de `@Controller('demands')`, portanto incide sobre todos os métodos da classe, incluindo `findOne`. Não depende apenas de `@ApiBearerAuth()`. |
| 2 | Frontend: `App.tsx` tem rota explícita `Route path="/login"` | CONFORME | `apps/web/src/App.tsx`: `<Route path="/login" element={<Login />} />` está presente (duas vezes: não autenticado renderiza Login; autenticado acessando `/login` redireciona para `/projects`). |
| 3 | Frontend: `setupTests.ts` está no estado original (apenas `import '@testing-library/jest-dom'`) | CONFORME | `apps/web/src/setupTests.ts` (linha 1): conteúdo é exatamente `import '@testing-library/jest-dom';`. Não aparece no diff vs SHA base (inalterado). |
| 4 | Frontend: não existe `apps/api/.env.example` (removido) | CONFORME | Busca por `**/.env.example` (incluindo arquivos ocultos) encontrou apenas a raiz; `apps/api/.env.example` não existe. |
| 5 | Frontend: `.env.example` está na raiz | CONFORME | Busca encontrou `/home/carlos/Work/macro-to-pr/.env.example` (raiz do repositório). |
| 6 | Frontend: Sidebar destaca apenas UM item por vez (Bug A corrigido) | CONFORME | `apps/web/src/features/layout/Sidebar.tsx`: `isActive()` calculado a partir de `location.pathname`; removido o `active: true` hardcoded; `defaultSidebarSections` usa `to`/`matchPath` com correspondências mutuamente excludentes (`/` exato, `/projects` exato, `/demands` por prefixo). |
| 7 | Frontend: `CreateProjectModal` não fecha ao clicar no input (Bug B corrigido) | CONFORME | `apps/web/src/features/projects/CreateProjectModal.tsx`: `<section style={...} onClick={(e) => e.stopPropagation()}>`, propagação interrompida no card do modal (incluindo inputs). |
| 8 | Frontend: `ProjectsSelect` carrega repositórios via `GET /projects/repositories` e passa ao `CreateProjectModal` (Bug C corrigido) | CONFORME | `apps/web/src/features/projects/ProjectsSelect.tsx`: fetch a `/projects/repositories`, armazena em estado `repositories`, passa `<CreateProjectModal repositories={repositories} ... />` (substitui o hardcoded `repositories={[]}`). |
| 9 | Escopo: apenas arquivos previstos na tarefa 18 modificados | CONFORME* | Arquivos de implementação batem com o previsto no `plan.md` (tarefa 18): controller/service/repository/e2e de `demands`, `App.tsx`, `Sidebar.tsx`, `ProjectsSelect.tsx`, `DemandDetail.tsx`, `apiService.ts`, `ProjectsSelect.test.tsx`, `DemandDetail.test.tsx`. `CreateProjectModal.tsx` tocado apenas para a correção do Bug B. Observação menor (não bloqueante): `Login.test.tsx` e `apiService.test.ts` receberam um mock de `localStorage` (infra de teste, sem regra de negócio) — não constam na lista de previstos, mas não implementam funcionalidade fora de escopo. |
| 10 | Fora de escopo respeitado (não US04, não tela `/demandas` separada, não rascunho, não tasks/tentativas) | CONFORME | `App.tsx` expõe rotas apenas `/login`, `/projects`, `/demands/:id` (não há listagem `/demandas`). `DemandDetail.tsx` inicializa `taskCount: 0` e `tasks: []` (sem entidade `Task`/tentativa). Não há salvamento de rascunho. |

*\* Observação não bloqueante em 9.*

## Apontamentos

Nenhum. Todos os 10 pontos verificados estão CONFORME. Não há não-conformidade a reportar.

## Nota sobre os Critérios de Aceite da US03 (spec.md)

A tarefa 18 foca no detalhamento/navegação (`GET /demands/:id` backend, rotas frontend, Sidebar ativa, modais, repositórios). Os CA1–CA4 foram entregues em tarefas anteriores (1–17) e não são reabertos aqui; não há regressão neles neste diff.

## Veredito final

**APROVADO** — sem apontamentos de não-conformidade.