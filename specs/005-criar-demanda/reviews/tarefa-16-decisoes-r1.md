# Decisões — Tarefa 16, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | `GET /developer/me` no `AppController` acessa `DeveloperRepository` diretamente, violando ID6 (separação Controller → Service → Repository) | código + conformidade | aceito | — |
| 2 | Acoplamento `AuthService → ProjectsRepository` (bounded contexts misturados) | código | aceito | — |
| 3 | Falha de rede/parse no sync de repositórios pode quebrar a emissão do JWT (falta try/catch) | código | aceito | — |
| 4 | `getDeveloperMe` lança `Error` genérico → 500, não 404 | código | aceito | — |
| 5 | Ausência de `.env.example` com variáveis do GitHub OAuth | código | aceito | — |
| 6 | `upsertRepositoryByFullName` não usa transação nem `prisma.upsert` nativo (não atômico) | código | aceito | — |
| 7 | Falta teste e2e dedicado para "`POST /projects` só passa se houver repositório sincronizado prévio" | conformidade | aceito | — |

Todos os apontamentos da rodada 1 foram aceitos pelo usuário ("pode corrigir"). O implementador deve ser despachado novamente (Passo 6, rodada de revisão 1) para corrigir apenas estes itens.
