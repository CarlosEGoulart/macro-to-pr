# Decisões — Tarefa 12, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | CA4 não implementado — sem seletor de Projeto na tela de criar Demanda (sem GET /projects, sem teste) | conformidade | aceito | — |
| 2 | CA1 — apiService.createDemand retorna Response bruto, não o objeto com id | conformidade | aceito | — |
| 3 | CA1 — Teste não verifica envio do token Authorization | conformidade | aceito | — |
| 4 | CA1 — Teste não verifica que o objeto com id é capturado/utilizado | conformidade | aceito | — |
| 5 | Tela /demandas (detalhe) não implementada | conformidade | aceito | — |
| 6 | NC-01 — handleSubmit fecha o modal sem checar response.ok/status (trata 400/403/500 como sucesso) | código | aceito | — |

Todos os 6 apontamentos (5 de conformidade + 1 de código) foram aceitos na triagem. Sem apontamentos recusados na rodada 1.