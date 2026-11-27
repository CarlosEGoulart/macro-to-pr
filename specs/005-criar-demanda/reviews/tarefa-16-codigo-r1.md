O ambiente não permite executar `shell` para o `tsc`, então a avaliação de compilação será estática (baseada na leitura dos tipos no código). Apresento o parecer abaixo.

---

# Parecer do Revisor-Código — Tarefa 16

**Veredito: APONTAMENTOS**

Há ao menos um ponto **bloqueante** (violação de ID6) além de vários pontos de qualidade não-bloqueantes. Nenhum arquivo foi modificado.

---

## 1. Bloqueante — violação de ID6 (separação de camadas)

### 1.1 `AppController` acessa `DeveloperRepository` diretamente no controller

**Padrão violado:** ID6 — *"Controller só recebe request/response → delega para Service → Service usa PrismaService via repositórios tipados. Nenhum Controller acessa Prisma diretamente."*

**Evidência:** `apps/api/src/app.controller.ts`
```ts
// linha ~43-46: injeção direta do repositório no controller
constructor(
  private readonly appService: AppService,
  private readonly developerRepository: DeveloperRepository,
) {}

// linhas 48-58: controller chama o repositório direto, sem service
async getDeveloperMe(@Req() req: { user: { userId: string } }) {
  const developer = await this.developerRepository.findById(req.user.userId);
  ...
}
```

O endpoint `GET /developer/me` está implementado com a camada Service pulada: o controller injeta e chama o `DeveloperRepository` diretamente. Isso fere a separação estrita Controller → Service → Repository exigida por ID6.

**Classificação: BLOQUEANTE.** Deve-se criar um service (ou reusar um service existente de desenvolvedor) e o controller delegar a ele.

---

## 2. Não-bloqueantes / sugestões de qualidade

### 2.1 Acoplamento entre domínios: `AuthService` depende de `ProjectsRepository`

**Padrão:** separação de domínios/módulos (arquitetura modular por feature da seção 2.1 e ID8).

**Evidência:** `apps/api/src/modules/auth/auth.service.ts`, linha 6
```ts
import { ProjectsRepository } from '../projects/projects.repository.js';
```
O serviço de autenticação alcança diretamente o repositório do módulo `projects` para fazer o upsert de repositórios. Embora `ProjectsModule` exporte `ProjectsRepository` (`projects.module.ts`, linha 11), isso cria um acoplamento auth → projects. O fluxo de sincronização de repositórios teria mais coerência se fosse orquestrado por `ProjectsService` (acessado por `AuthService` via service, não direto pelo repository).

**Classificação: sugestão (não-bloqueante).** Funciona, mas fere a separação de bounded contexts.

### 2.2 Falha de rede/parse no sync de repositórios pode quebrar a emissão do JWT

**Padrão:** tratamento de erro adequado (pergunta 10 do escopo) — falha na API do GitHub no sync não deve quebrar o fluxo de autenticação.

**Evidência:** `apps/api/src/modules/auth/auth.service.ts`, linhas 146 e 166-215
```ts
// linha 146 — awaited, sem try/catch
await this.syncRepositoriesFromGitHub(account.id, accessToken);

// linhas 169-215 — syncRepositoriesFromGitHub não trata exceções de fetch/json
while (url) {
  const response: Response = await fetch(url, { ... }); // pode lançar (rede)
  ...
  const repos = (await response.json()) as Array<...>; // pode lançar (parse)
  ...
}
```

A resposta HTTP não-OK é tratada (`break`), então uma API do GitHub fora do ar **não** quebra o fluxo. Porém, um erro de rede (`fetch` rejeita) ou falha de `response.json()` lança exceção que sobe até `handleGitHubCallback` (linha 146 é `awaited`), impedindo a emissão do JWT e quebrando o fluxo de auth.

**Classificação: sugestão (não-bloqueante).** Envolver a linha 146 (ou o corpo de `syncRepositoriesFromGitHub`) em try/catch, de modo que falha no sync seja apenas logada e o JWT continue sendo emitido.

### 2.3 `getDeveloperMe` lança `Error` genérico → resulta em 500, não 404

**Padrão:** tratamento de erro adequado / contratos de resposta (ID10 — `AllExceptionsFilter`).

**Evidência:** `apps/api/src/app.controller.ts`, linhas 52-54
```ts
if (!developer) {
  throw new Error('Desenvolvedor não encontrado');
}
```
Um `Error` simples é capturado pelo `AllExceptionsFilter` e retorna 500. O adequado seria lançar `NotFoundException` (ou equivalente) para retornar 404.

**Classificação: sugestão (não-bloqueante).**

### 2.4 Ausência de `.env.example`

**Padrão:** ID17 — secrets via env; `.env.example` é o template que documenta variáveis obrigatórias (não é segredo).

**Evidência:** Nenhum arquivo `.env` nem `.env.example` encontrado no repositório (glob retornou vazio para raiz, `apps/api`, `apps/web`). O plano da Tarefa 16 lista verificação de `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL` em `.env` / `.env.example`, mas esses arquivos não existem.

**Classificação: sugestão (não-bloqueante).** Criar `.env.example` com as variáveis do GitHub OAuth (sem valores reais).

### 2.5 `upsertRepositoryByFullName` não usa transação nem `prisma.upsert` nativo

**Padrão:** ID8 — transações atômicas com `prisma.$transaction` quando aplicável.

**Evidência:** `apps/api/src/modules/projects/projects.repository.ts`, linhas 64-100
```ts
const existing = await this.prisma.repository.findFirst({ where: { githubAccountId, fullName } });
if (existing) { ... update ... }
return this.prisma.repository.create({ ... });
```
O find-then-update/create não é atômico: sob sincronização concorrente, duas chamadas podem enxergar `existing === null` e ambas tentar `create`, gerando duplicidade (ou erro de constraint única, se houver). O Prisma oferece `upsert` nativo, mais curto e atômico.

**Classificação: sugestão (não-bloqueante).**

---

## 3. Itens conforme o esperado (positivos)

| Item | Verificação |
|------|-------------|
| **ID6 — `ProjectsController`** | Delegará para `ProjectsService` tanto em `GET /projects` quanto no novo `GET /projects/repositories`. Não acessa Prisma diretamente. ✅ (`projects.controller.ts`) |
| **ID8 — `ProjectsService`** | Usa `ProjectsRepository` (`findDeveloperById`, `findRepositoriesByDeveloper`), não Prisma direto. ✅ (`projects.service.ts`) |
| **ID8 — `ProjectsRepository`** | `findRepositoriesByDeveloper` encapsula `prisma.repository.findMany`. ✅ (`projects.repository.ts`) |
| **ID9 — rotas protegidas** | `JwtAuthGuard` é global (`APP_GUARD` em `app.module.ts`); `GET /developer/me` e `GET /projects/repositories` não têm `@Public()`, então exigem token válido. ✅ |
| **ID10 — interceptor/filter** | Respostas passam por `TransformInterceptor` (`{ data, meta?, timestamp, path }`); exceções por `AllExceptionsFilter`. O frontend `developerProfile` faz `const { data } = await response.json()`, correto para o envelope. ✅ |
| **Frontend `HeaderUser`** | Usa `apiService.developerProfile()` com inline styles; tipos `developer: { name, avatarUrl } | null` corretos; fallback "Desenvolvedor"/"D" quando a API falha ou carrega. ✅ (`ProjectsSelect.tsx`) |
| **Testes e2e** | Usam `supertest` (`request(app.getHttpServer())`), testam 401 sem token e 200 com token, e lidam com o envelope `body.data ?? body`. ✅ (`projects.e2e-spec.ts`) |
| **Testes frontend** | Mockam `apiService.developerProfile` via `vi.spyOn` e assertam renderização de nome/avatar, ausência do hardcode "Desenvolvedor"/"D" e fallback. ✅ (`ProjectsSelect.test.tsx`, `apiService.test.ts`) |
| **Segurança** | Nenhum secret hardcoded no diff; `GITHUB_CLIENT_ID/SECRET` via `ConfigService`; token em `localStorage` (risco aceito e documentado na arch, seção 11). ✅ |

---

## 4. Nota sobre execução de comandos

Não foi possível rodar `npm run typecheck` nem os testes (`test:e2e`, `test`) pois a ferramenta `shell` está com restrição de ambiente (`Permission denied`) nesta sessão. A avaliação de compilação é estática, com base na leitura dos tipos no código; os tipos nas assinaturas lidas parecem consistentes, mas recomendo executar localmente:

```bash
cd /workspaces/macro-to-pr/apps/api && npm run typecheck
cd /workspaces/macro-to-pr/apps/web && npm run typecheck
cd /workspaces/macro-to-pr/apps/api && npm run test:e2e
cd /workspaces/macro-to-pr/apps/web && npm test
```

---

## Resumo da entrega

- **APONTAMENTOS** (não aprovado até corrigir o bloqueante).
- **Bloqueante:** `AppController.getDeveloperMe` acessa `DeveloperRepository` diretamente, violando ID6.
- **Sugestões:** desacoplar `AuthService` de `ProjectsRepository`; try/catch no sync de repositórios; usar `NotFoundException` no `getDeveloperMe`; criar `.env.example`; usar `prisma.upsert`/transação em `upsertRepositoryByFullName`.

Nenhum arquivo foi modificado, conforme o escopo de revisão somente leitura.
