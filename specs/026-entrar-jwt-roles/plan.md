# Plano — Issue #26

## Decisões técnicas

- Guard de autenticação registrado globalmente via `APP_GUARD` em `app.module.ts`, com decorator `@Public()` para rotas explícitas (callback OAuth, refresh, health).
- `RolesGuard` registrado globalmente após `AuthGuard` na lista de `APP_GUARD`, lendo `user.role` do request (setado pelo `JwtStrategy.validate`).
- Decorator `@Roles(...)` lendo `ROLES_KEY` via `Reflector`, aplicado em rota admin (ex.: listagem de desenvolvedores US14).
- Swagger `.addBearerAuth()` no `DocumentBuilder` em `main.ts` + `@ApiBearerAuth()` nos controllers protegidos.
- Frontend: camada de serviço única que anexa `Authorization: Bearer <token>`; intercepta 401, limpa `localStorage` e redireciona para login.
- Token guardado em `localStorage` (justificado no `architecture.md`: risco de XSS aceitável para esta disciplina, escolha escrita e justificada).
- Ordem dos Guards: `AuthGuard` antes de `RolesGuard` para evitar 500 por `user.role` indefinido.
- Sem `passwordHash`, sem cadastro/login por senha (escopo OAuth apenas).

## Tarefas

- [x] **Tarefa 1 — Guard global + decorator `@Public()`**
  - Cobre: CA3
  - Teste primeiro: rota protegida sem marca `@Public()` e sem token responde 401; rota pública com `@Public()` passa sem token
  - Arquivos previstos: `apps/api/src/common/decorators/public.decorator.ts`, `apps/api/src/common/guards/auth.guard.ts`, `apps/api/src/app.module.ts` (`APP_GUARD`), rotas existentes marcadas com `@Public()`

- [x] **Tarefa 2 — `RolesGuard` + decorator `@Roles()` (403)**
  - Cobre: CA2
  - Teste primeiro: token de Desenvolvedor em rota com `@Roles(Role.Admin)` responde 403 (não 500, não 200); rota sem `@Roles` liberada para qualquer autenticado
  - Arquivos previstos: `apps/api/src/common/decorators/roles.decorator.ts`, `apps/api/src/common/guards/roles.guard.ts`, `apps/api/src/app.module.ts` (`APP_GUARD` ordem), rota admin existente com `@Roles(Role.Admin)`

- [x] **Tarefa 3 — Swagger Bearer Auth**
  - Cobre: CA4
  - Teste primeiro: página `/docs` exibe botão Authorize (Bearer); controllers protegidos decorados com `@ApiBearerAuth()`
  - Arquivos previstos: `apps/api/src/main.ts` (`.addBearerAuth()`), controllers protegidos com `@ApiBearerAuth()`

- [x] **Tarefa 4 — Frontend: token na camada de serviço**
  - Cobre: CA5
  - Teste primeiro: toda chamada à API feita pela camada de serviço inclui `Authorization: Bearer <token>`; token lido de `localStorage`
  - Arquivos previstos: `apps/web/src/features/auth/` (camada de serviço única), `apps/web/src/main.tsx` ou layout (injeção da camada)

- [ ] **Tarefa 5 — Frontend: 401 → login e menu por papel**
  - Cobre: CA6
  - Teste primeiro: resposta 401 da camada de serviço limpa `localStorage` e redireciona para login; menu esconde botões de Admin para Desenvolvedor
  - Arquivos previstos: camada de serviço (mesma da Tarefa 4), `apps/web/src/features/auth/` ou layout do menu

- [ ] **Tarefa 6 — Testes negativos (401 sem token, 403 papel errado) no CI**
  - Cobre: CA1, CA2
  - Teste primeiro: e2e rota protegida sem token → 401; e2e papel errado → 403; ambos rodam no GitHub Actions (`ci.yml`)
  - Arquivos previstos: `apps/api/test/auth-guard.e2e-spec.ts` (ou similar), `.github/workflows/ci.yml` (já existe, garantir execução)

- [ ] **Tarefa 7 — Documentação e fechamento**
  - Cobre: CA7
  - Teste primeiro: não aplica (documentação)
  - Arquivos previstos: `docs/architecture.md` (validade do token, localStorage, ordem dos Guards), `docs/prd.md` (US17 → Live), `specs/README.md` (spec 026 → implementada)

## Critérios sem tarefa

-
