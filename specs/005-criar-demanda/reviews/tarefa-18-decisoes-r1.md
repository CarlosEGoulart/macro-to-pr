# Decisões — Tarefa 18, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | `GET /demands/:id` não tem `@UseGuards(JwtAuthGuard)` no `DemandsController`; apenas `@ApiBearerAuth()` (Swagger, não é guard) | conformidade | aceito | A rota deve ter proteção JWT explícita no controller, não apenas depender de guard global. |
| 2 | App.tsx não tem rota explícita `/login`; usa `path="*"` como fallback quando não há token, divergindo do plan.md | conformidade | aceito | O plan.md especifica rotas `/login`, `/projects`, `/demands/:id`; o wildcard não é a rota nomeada especificada. |
| 3 | Arquivos fora do escopo alterados: rename `.env.example` → `apps/api/.env.example` e modificação em `setupTests.ts` | conformidade | aceito | Arquivos fora dos previstos na tarefa 18 não devem ser alterados neste ciclo; devem ser revertidos ou justificados separadamente. |

Além dos apontamentos acima, o usuário reportou problemas adicionais a corrigir neste mesmo ciclo:
- Sidebar destacando dois itens ao mesmo tempo (destaque ativo incorreto)
- Modal de criar projeto fecha sozinho ao digitar no input
- Repositórios do GitHub não são listados no modal de criar projeto (repositories={[]} hardcoded)
- Não é possível visualizar a tela de detalhes das demandas (consequência de não haver projetos)
