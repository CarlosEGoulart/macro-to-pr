# Parecer de Conformidade — Tarefa 3

**Veredito:** APROVADO

## Critérios verificados

| Critério (da spec) | Situação | Onde |
| --- | --- | --- |
| CA2 — repositório não pertence à Conta GitHub vinculada → não cria e informa impedimento | atendido | `apps/api/src/modules/projects/projects.service.ts:12-33` |
| Erro discernível (não 401 genérico): 400 com mensagem `'não pertence'` | atendido | `projects.service.ts:29-33`; `apps/api/test/projects.e2e-spec.ts:107-116` |
| Nenhuma gravação no banco na negação (Developer, GitHubAccount, RefreshToken) | atendido | `projects.service.ts:35` — `create` só é chamado após as validações |
| Nenhuma chamada ao GitHub após a negação | atendido | Validação compara `githubAccountId` armazenado localmente; sem `nock`/rede (`projects.service.ts`, `apps/api/test/projects.e2e-spec.ts`) |
| Escopo respeitado (sem CA1, CA3, `POST /auth/refresh`, `ResponseInterceptor`, `ValidationPipe` global) | atendido | diff toca apenas `auth.controller.ts`, `auth.service.ts`, `auth.module.ts`, `auth-oauth-callback.e2e-spec.ts` |
| Termos do glossário (`Developer`, `GitHubAccount`, `RefreshToken`) e casos de abandono da spec | atendido | `docs/architecture.md:145-149`; `spec.md:32-34` |
| TDD — RED válido (teste falhar antes do código) | atendido (relatado pelo implementador) | `test:206-288` (reautorização: 1 conta, 1 developer, token/scopes renovados, refresh antigo revogado) |

## Apontamentos

Nenhum. O comportamento exigido pelo CA2 está implementado e isolado por conta, o escopo da tarefa não foi inflado, e os termos do glossário são respeitados.