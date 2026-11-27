# Decisões — Tarefa 17, rodada 1

| # | Apontamento (resumo) | Parecer | Decisão | Justificativa |
|---|---|---|---|---|
| 1 | Migration `20261127001835_add_type_priority_to_demand/migration.sql` está untracked (não aparece no `git diff` do SHA base); sem `git add`, não entra no commit e o CI não aplica colunas `type`/`priority`, fazendo o e2e de CA1 falhar | código | aceito | Sem o `git add` da migration, o arquivo não viaja na branch e o banco de testes/CI continua sem as colunas `type`/`priority`, deixando o CA1 incompleto apesar do código de produção e do teste estarem corretos. |
