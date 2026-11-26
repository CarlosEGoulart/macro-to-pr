# Decisões — Tarefa 11, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | Escopo inflado: 13 arquivos fora do escopo da tarefa 11 (schema GitHubAccount, AuthController, AuthService, repositórios, CORS, jwt-auth.guard, Login.tsx, apiService.ts, index.css, plan.md) | conformidade | recusado | Os arquivos alterados são dependências do login utilizando OAuth. Sem essas correções, seria impossível acessar /projects e consequentemente impossível atingir o objetivo das demandas. |
| 2 | Tela de Demandas dentro do seletor de Projeto (código fora do escopo, não testado, código morto) | código | recusado | Sim, as demandas serão listadas como uma "previa" na tela dos projetos! |
