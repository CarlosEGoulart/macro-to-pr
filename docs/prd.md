# 📄 Product Requirements Document (PRD)

**Projeto:** Macro2PR
**Versão:** 1.0.0
**Última atualização:** 2026-09-08

> 🤖 **Este documento é a fonte da verdade sobre o QUE o produto faz.** Regra de
> negócio que não estiver aqui não existe — nem para a equipe, nem para a IA.
> Tecnologia **não** se discute aqui: isso é assunto do `architecture.md`.

---

## 🎯 1. Visão Geral e Objetivo

**O problema:** Desenvolvedores de software que recebem ou formulam demandas de desenvolvimento em alto nível precisam transformar essas demandas em trabalho menor, organizado e revisável. Hoje, mesmo utilizando ferramentas de IA para desenvolver código, o desenvolvedor ainda precisa decompor manualmente uma demanda maior em várias tarefas, acompanhar o que foi feito, revisar os resultados e decidir o que realmente deve ser integrado ao projeto.

**A solução:** O Macro2PR é uma plataforma que centraliza esse processo: o desenvolvedor informa uma demanda de alto nível relacionada a um projeto, acompanha sua decomposição em tarefas menores, analisa as execuções e revisões realizadas e continua responsável por aprovar ou rejeitar as alterações antes que elas sejam encaminhadas para integração ao repositório.

**Como saberemos que deu certo:**
- Um Desenvolvedor consegue acessar o Macro2PR com sua conta GitHub, criar um Projeto associado a um Repositório disponível, registrar uma Demanda de desenvolvimento em alto nível, visualizar sua decomposição em Tarefas menores, acompanhar execuções e Revisões, aprovar ou rejeitar Resultados e, ao final, gerar um Pull Request com as alterações aprovadas.
- Um desenvolvedor consegue comprar créditos de execução, ter o pagamento confirmado de forma assíncrona e utilizar o saldo recebido para realizar execuções dentro da plataforma.

---

## 📖 2. Glossário Ubíquo

| Termo | Significa | Não confundir com |
|-------|-----------|-------------------|
| **Demanda** | Objetivo de desenvolvimento em alto nível informado pelo desenvolvedor | Tarefa (a demanda é o todo; tarefa é parte) |
| **Tarefa** | Unidade menor de trabalho derivada de uma demanda | Tentativa de execução (uma tarefa pode ter várias tentativas) |
| **Tentativa de execução** | Execução realizada para uma tarefa (pode haver várias por tarefa) | Revisão (a revisão analisa o resultado dessa tentativa) |
| **Crédito de execução** | Unidade de consumo utilizada para realizar execuções na plataforma | Saldo (crédito é a unidade de consumo; saldo é a quantidade de créditos disponíveis) |
| **Saldo** | Quantidade de créditos disponíveis na conta do desenvolvedor | Crédito de execução (saldo é o total; crédito é a unidade) |
| **Pedido de créditos** | Intenção de compra de créditos pelo desenvolvedor | Pagamento (pedido = intenção; pagamento = processamento financeiro) |
| **Pagamento** | Registro da transação de pagamento associada a um Pedido de créditos, que pode estar aguardando confirmação, confirmado ou não aprovado | Pedido de créditos (pedido representa a intenção de compra; pagamento representa o processamento financeiro dessa compra) |
| **Projeto** | Contexto de trabalho dentro do Macro2PR (agrupa demandas) | Repositório (projeto = lógico no Macro2PR; repositório = Git externo) |
| **Plano de tarefas** | Conjunto organizado de tarefas gerado a partir de uma demanda | Demanda (plano = decomposição; demanda = objetivo de alto nível) |
| **Revisão** | Análise independente do resultado de uma execução | Aprovação de resultado (revisão = análise; aprovação = decisão final) |
| **Aprovação do plano** | Decisão do desenvolvedor de aceitar o plano de tarefas e permitir que sua execução prossiga | Aprovação de resultado (aprovação do plano = autoriza execução; aprovação de resultado = aceita entregável) |
| **Aprovação de resultado** | Decisão do desenvolvedor de aceitar o resultado de uma tentativa de execução após sua revisão | Revisão (aprovação = decisão; revisão = análise) |
| **Regeneração** | Solicitação do desenvolvedor para que uma tarefa tenha uma nova tentativa de execução após um resultado não aceito | Tentativa de execução (regeneração solicita uma nova tentativa; tentativa é a ocorrência da execução) |
| **Resultado de execução** | Alterações e informações produzidas por uma tentativa de execução de uma tarefa | Tentativa de execução (resultado = entregável; tentativa = processo/ocorrência que o produz) |
| **Repositório** | Repositório de código associado ao projeto (Git externo) | Projeto (repositório = Git; projeto = contexto no Macro2PR) |
| **Pull Request** | Proposta final de alteração enviada ao repositório após conclusão e aprovação da demanda | Tarefa individual (PR = agregado final; tarefa = unidade atômica) |
| **Conta GitHub** | Conta externa autorizada pelo Desenvolvedor para disponibilizar ao Macro2PR os Repositórios aos quais ele possui acesso | Desenvolvedor (Conta GitHub representa a identidade externa autorizada; Desenvolvedor representa o usuário dentro do Macro2PR) |
| **Pacote de créditos** | Oferta previamente disponível contendo uma quantidade definida de Créditos de execução e o valor correspondente | Pedido de créditos (pacote é a oferta disponível; Pedido registra a intenção do Desenvolvedor de comprar uma dessas ofertas) |

---

## 👤 3. Atores e Permissões

| Ator | Quem é | Pode | **Não pode** |
|------|--------|------|--------------|
| **Desenvolvedor** | Usuário dono da conta; cria e gerencia seus próprios projetos, demandas e execuções | • Acessar o Macro2PR utilizando sua conta GitHub autorizada<br>• Visualizar os Repositórios disponibilizados pela conta GitHub para criação de Projeto<br>• Criar e consultar seus **Projetos**<br>• Criar **Demandas** em seus projetos<br>• Visualizar **Plano de tarefas** gerado a partir da demanda<br>• **Aprovar o plano** (autorizar execução) ou rejeitar<br>• Acompanhar **Tentativas de execução** de cada tarefa<br>• Solicitar **Regeneração** de tarefa não aceita<br>• **Aprovar resultado** ou rejeitar após **Revisão**<br>• Criar **Pedido de créditos**<br>• Consultar **Saldo** de créditos<br>• **Gerar e visualizar o Pull Request final após a conclusão e aprovação da demanda**<br>• Consultar próprio histórico de pagamentos e consumo | • Acessar projetos, demandas ou créditos de outro desenvolvedor<br>• Associar a um Projeto um Repositório ao qual sua conta GitHub autorizada não possua acesso<br>• **Alterar manualmente o estado de um pagamento**<br>• Atuar como **Admin** da plataforma |
| **Admin da plataforma** | Responsável pela operação e administração do Macro2PR | • Listar e visualizar contas de Desenvolvedores para fins de suporte | • Criar **Demanda**, **Tarefa** ou **Plano de tarefas** em nome de Desenvolvedor<br>• Aprovar **Plano** ou **Resultado de execução**<br>• Consumir **Créditos** ou alterar **Saldo** de outro Desenvolvedor<br>• Alterar manualmente **Pagamentos**<br>• Acessar **Repositórios**, **Demandas** ou credenciais externas dos Desenvolvedores<br>• Gerar **Pull Request** em nome de Desenvolvedor |

---

## 📝 4. Escopo Funcional (User Stories)

### US01 — Acessar o Macro2PR com conta GitHub · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** acessar o Macro2PR autorizando minha conta GitHub, **para que** eu possa utilizar na plataforma os Repositórios aos quais tenho acesso.

**Critérios de aceite:**
- [ ] **Dado** que ainda não vinculei uma conta GitHub ao Macro2PR, **quando** autorizo o acesso com uma conta válida, **então** passo a acessar a plataforma e os Repositórios aos quais essa conta possui acesso ficam disponíveis para criação de Projeto.
- [ ] **Dado** que nego ou interrompo a autorização da conta GitHub, **quando** retorno ao Macro2PR, **então** a vinculação não é concluída, não obtenho acesso autenticado e nenhum Repositório dessa conta é disponibilizado.
- [ ] **Dado** que determinado Repositório não está acessível pela conta GitHub autorizada, **quando** consulto os Repositórios disponíveis para criação de Projeto, **então** esse Repositório não é disponibilizado para seleção.

**Regras relacionadas:** RN08

---

### US02 — Criar Projeto · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** criar um Projeto associando um Repositório ao qual tenho acesso, **para que** eu possa organizar e executar demandas de desenvolvimento relacionadas a esse código.

**Critérios de aceite:**
- [ ] **Dado** que estou autenticado e tenho acesso a um Repositório válido, **quando** confirmo a criação do Projeto associado a ele, **então** o Projeto é criado e passa a aparecer entre meus Projetos.
- [ ] **Dado** que não tenho acesso ao Repositório escolhido ou ele não está disponível, **quando** tento criar o Projeto, **então** o Projeto não é criado e sou informado do impedimento.
- [ ] **Dado** que já existe um Projeto meu associado a este Repositório, **quando** tento criar outro Projeto para o mesmo Repositório, **então** o Projeto não é criado e sou informado da restrição.

**Regras relacionadas:** RN01, RN08

---

### US03 — Criar Demanda · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** criar uma Demanda em alto nível dentro de um Projeto meu, **para que** eu possa registrar o objetivo de desenvolvimento que desejo realizar.

**Critérios de aceite:**
- [ ] **Dado** que possuo um Projeto associado a um Repositório, **quando** informo os dados obrigatórios de uma Demanda, **então** ela é criada, associada ao Projeto e passa a estar disponível para os próximos passos do fluxo.
- [ ] **Dado** que deixo um dos dados obrigatórios da Demanda vazio, **quando** tento criá-la, **então** a criação é impedida e sou informado sobre o que precisa ser preenchido.
- [ ] **Dado** que tento criar uma Demanda em um Projeto que não me pertence, **quando** realizo a ação, **então** a criação é impedida e sou informado de que não tenho permissão.

---

### US04 — Gerar Plano de Tarefas · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** gerar um Plano de Tarefas a partir de uma Demanda minha, **para que** o trabalho necessário seja decomposto em unidades menores e organizadas antes da execução.

**Critérios de aceite:**
- [ ] **Dado** que possuo uma Demanda associada a um Projeto e com seus dados obrigatórios preenchidos, **quando** solicito a geração do Plano de Tarefas, **então** é produzido um plano associado à Demanda contendo uma ou mais Tarefas que representam partes do trabalho necessário.
- [ ] **Dado** que as Tarefas possuem dependências entre si, **quando** o plano é gerado, **então** essas dependências ficam representadas no Plano de Tarefas.
- [ ] **Dado** que as informações disponíveis na Demanda e no Projeto não permitem elaborar um plano executável, **quando** solicito sua geração, **então** nenhuma execução é iniciada e sou informado de que são necessárias informações adicionais.
- [ ] **Dado** que o Plano de Tarefas foi gerado, **quando** a geração termina, **então** ele fica disponível para minha revisão antes que qualquer Tarefa seja executada.

---

### US05 — Aprovar ou rejeitar Plano de Tarefas · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** aprovar ou rejeitar um Plano de Tarefas gerado para minha Demanda, **para que** eu decida se o trabalho planejado pode seguir para execução.

**Critérios de aceite:**
- [ ] **Dado** que existe um Plano de Tarefas gerado para uma Demanda minha, **quando** aprovo o plano, **então** ele passa a estar autorizado para execução e suas Tarefas ficam aptas a seguir para o fluxo de execução.
- [ ] **Dado** que existe um Plano de Tarefas gerado para uma Demanda minha, **quando** o rejeito e informo o motivo da rejeição, **então** o plano é rejeitado e nenhuma de suas Tarefas pode ser executada.
- [ ] **Dado** que aprovo um Plano de Tarefas, **quando** a aprovação é concluída, **então** nenhuma Tarefa é iniciada automaticamente apenas por causa dessa aprovação.
- [ ] **Dado** que tento aprovar ou rejeitar um Plano de Tarefas pertencente à Demanda de outro Desenvolvedor, **quando** realizo a ação, **então** ela é impedida e sou informado de que não tenho permissão.

**Regras relacionadas:** RN02, RN03

---

### US06 — Iniciar execução de Tarefa · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** iniciar a execução de uma Tarefa pertencente a um Plano de Tarefas aprovado, **para que** o trabalho planejado seja realizado e produza um resultado que possa ser revisado.

**Critérios de aceite:**
- [ ] **Dado** que uma Tarefa pertence a um Plano de Tarefas aprovado, suas dependências necessárias foram atendidas e possuo créditos suficientes para a execução, **quando** solicito sua execução, **então** uma nova Tentativa de execução é iniciada para essa Tarefa.
- [ ] **Dado** que uma Tarefa pertence a um Plano que não foi aprovado, **quando** solicito sua execução, **então** a execução é impedida e sou informado do motivo.
- [ ] **Dado** que uma Tarefa possui dependências ainda não atendidas, **quando** solicito sua execução, **então** a execução é impedida e sou informado quais dependências impedem seu início.
- [ ] **Dado** que não possuo créditos suficientes para iniciar a execução, **quando** solicito a ação, **então** ela é impedida e sou informado de que meu saldo é insuficiente.
- [ ] **Dado** que uma Tentativa de execução termina produzindo um Resultado de execução, **quando** a tentativa é finalizada, **então** o resultado fica disponível para Revisão antes de qualquer Aprovação de resultado.
- [ ] **Dado** que uma Tentativa de execução não consegue produzir um resultado por uma falha, **quando** ela termina, **então** a falha fica registrada e nenhum resultado é encaminhado para aprovação.

**Regras relacionadas:** RN04

---

### US07 — Obter Revisão independente do Resultado de execução · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** que o Resultado de execução de uma Tentativa seja submetido a uma Revisão independente, **para que** eu receba uma análise do que foi produzido antes de decidir se aceito ou rejeito o resultado.

**Critérios de aceite:**
- [ ] **Dado** que uma Tentativa de execução produziu um Resultado de execução, **quando** a execução é finalizada com sucesso, **então** o resultado é submetido à Revisão antes de ficar disponível para Aprovação de resultado.
- [ ] **Dado** que o Resultado de execução foi produzido por um agente responsável pela execução, **quando** a Revisão é realizada, **então** ela é conduzida por um agente distinto daquele que produziu o resultado.
- [ ] **Dado** que a Revisão foi concluída, **quando** consulto o Resultado de execução, **então** consigo visualizar o parecer da Revisão junto às informações necessárias para avaliar o que foi produzido.
- [ ] **Dado** que uma Tentativa de execução falhou sem produzir Resultado de execução, **quando** o fluxo é encerrado, **então** nenhuma Revisão de resultado é realizada e a falha permanece registrada.
- [ ] **Dado** que tento consultar a Revisão de um Resultado pertencente a outro Desenvolvedor, **quando** realizo a ação, **então** o acesso é impedido e sou informado de que não tenho permissão.

---

### US08 — Aprovar ou rejeitar Resultado de execução · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** aprovar ou rejeitar o Resultado de execução após a Revisão, **para que** eu decida se o trabalho realizado pode ser aceito ou se precisa de uma nova tentativa.

**Critérios de aceite:**
- [ ] **Dado** que existe um Resultado de execução com Revisão concluída, **quando** aprovo o resultado, **então** ele é aceito e a Tarefa passa a ser considerada concluída para fins do Plano de Tarefas.
- [ ] **Dado** que uma Tarefa aprovada era dependência de outras Tarefas, **quando** seu Resultado de execução é aprovado, **então** as Tarefas dependentes que não possuam outras dependências pendentes passam a ficar aptas a seguir para execução.
- [ ] **Dado** que rejeito o Resultado de execução e informo o motivo, **quando** confirmo a rejeição, **então** o resultado não é aceito e a Tarefa fica apta a receber uma nova Tentativa de execução por meio de Regeneração.
- [ ] **Dado** que tento aprovar ou rejeitar um Resultado de execução pertencente a outro Desenvolvedor, **quando** realizo a ação, **então** ela é impedida e sou informado de que não tenho permissão.

**Regras relacionadas:** RN05

---

### US09 — Solicitar Regeneração de Tarefa · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** solicitar uma nova Tentativa de execução para uma Tarefa cujo Resultado de execução foi rejeitado, **para que** uma nova tentativa possa produzir um novo resultado sem alterar o Plano de Tarefas.

**Critérios de aceite:**
- [ ] **Dado** que uma Tarefa possui um Resultado de execução rejeitado e tenho créditos suficientes, **quando** solicito a Regeneração, **então** uma nova Tentativa de execução é iniciada para a mesma Tarefa.
- [ ] **Dado** que uma nova Tentativa é criada por Regeneração, **quando** consulto o histórico da Tarefa, **então** as Tentativas anteriores, seus Resultados, Revisões e decisões permanecem registrados e consultáveis.
- [ ] **Dado** que a Tarefa não possui Resultado de execução rejeitado, **quando** solicito Regeneração, **então** a solicitação é impedida e sou informado do motivo.
- [ ] **Dado** que não possuo créditos suficientes, **quando** solicito Regeneração, **então** a solicitação é impedida e sou informado de que meu saldo é insuficiente.
- [ ] **Dado** que tento solicitar Regeneração para uma Tarefa pertencente a outro Desenvolvedor, **quando** realizo a ação, **então** ela é impedida e sou informado de que não tenho permissão.

**Regras relacionadas:** RN04

---

### US10 — Gerar Pull Request final da Demanda · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** gerar um Pull Request final no Repositório associado ao Projeto depois que todas as Tarefas do Plano aprovado tiverem seus Resultados aceitos, **para que** a alteração completa da Demanda possa ser submetida à integração no código.

**Critérios de aceite:**
- [ ] **Dado** que todas as Tarefas do Plano aprovado de uma Demanda possuem Resultados de execução aprovados, **quando** solicito a geração do Pull Request, **então** é criado um Pull Request no Repositório associado contendo o conjunto das alterações aprovadas da Demanda.
- [ ] **Dado** que pelo menos uma Tarefa do Plano aprovado ainda não possui Resultado de execução aprovado, **quando** tento gerar o Pull Request, **então** a geração é impedida e sou informado quais Tarefas ainda impedem a conclusão da Demanda.
- [ ] **Dado** que o Pull Request foi criado com sucesso, **quando** consulto a Demanda, **então** consigo acessar a referência do Pull Request correspondente.
- [ ] **Dado** que já existe um Pull Request final para aquela Demanda, **quando** solicito novamente sua geração, **então** um segundo Pull Request não é criado e sou direcionado ao Pull Request já existente.
- [ ] **Dado** que todas as Tarefas estão aprovadas, mas o Pull Request não pode ser criado por indisponibilidade ou falta de acesso ao Repositório, **quando** a tentativa de criação falha, **então** nenhum trabalho aprovado é perdido e posso tentar novamente após o impedimento ser resolvido.
- [ ] **Dado** que tento gerar o Pull Request de uma Demanda pertencente a outro Desenvolvedor, **quando** realizo a ação, **então** ela é impedida e sou informado de que não tenho permissão.

**Regras relacionadas:** RN06

---

### US11 — Criar Pedido de Créditos · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** criar um Pedido de créditos escolhendo um pacote disponível, **para que** eu possa iniciar a compra de créditos de execução.

**Critérios de aceite:**
- [ ] **Dado** que estou autenticado e existe um pacote de créditos disponível, **quando** escolho o pacote e confirmo a intenção de compra, **então** é criado um Pedido de créditos associado à minha conta, registrando a quantidade de créditos e o valor correspondente e ficando aguardando pagamento.
- [ ] **Dado** que o pacote escolhido não existe ou não está disponível para compra, **quando** tento criar o Pedido, **então** a criação é impedida e sou informado do motivo.
- [ ] **Dado** que um Pedido de créditos foi criado, **quando** consulto meu Saldo, **então** os créditos daquele Pedido ainda não estão disponíveis para uso enquanto o pagamento não tiver sido confirmado.
- [ ] **Dado** que tento criar um Pedido de créditos em nome de outro Desenvolvedor, **quando** realizo a ação, **então** ela é impedida e sou informado de que não tenho permissão.

---

### US12 — Pagar Pedido de Créditos e receber créditos · `Must Have` · `M` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** realizar o pagamento de um Pedido de créditos, **para que** os créditos adquiridos sejam adicionados ao meu Saldo somente após a confirmação do pagamento.

**Critérios de aceite:**
- [ ] **Dado** que possuo um Pedido de créditos aguardando pagamento, **quando** o pagamento é confirmado pelo meio de pagamento, **então** o Pedido passa a ser considerado pago e a quantidade correspondente de créditos é adicionada ao meu Saldo.
- [ ] **Dado** que retorno ao Macro2PR após realizar o pagamento, **quando** a confirmação do meio de pagamento ainda não foi recebida, **então** os créditos ainda não são adicionados ao meu Saldo e o Pedido permanece em `Aguardando pagamento` até que a confirmação seja conhecida.
- [ ] **Dado** que uma confirmação de pagamento é inválida ou não pode ser considerada confiável, **quando** ela é recebida, **então** o Pedido não é considerado pago e nenhum crédito é adicionado ao meu Saldo.
- [ ] **Dado** que o pagamento não é aprovado ou deixa de poder ser concluído, **quando** essa situação é conhecida pelo Macro2PR, **então** nenhum crédito é adicionado ao meu Saldo e consigo identificar que o Pedido não foi pago.
- [ ] **Dado** que a mesma confirmação de pagamento é recebida mais de uma vez, **quando** ela é processada novamente, **então** os créditos daquele Pedido não são adicionados uma segunda vez.
- [ ] **Dado** que um pagamento foi confirmado e os créditos foram adicionados, **quando** consulto meu Saldo, **então** a quantidade disponível reflete a compra realizada.

**Regras relacionadas:** RN07

---

### US13 — Consultar Saldo e Histórico de Movimentações · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Desenvolvedor, **quero** consultar meu Saldo atual e o histórico de movimentações de créditos, **para que** eu saiba quantos créditos tenho disponíveis e por quais motivos meu Saldo foi alterado.

**Critérios de aceite:**
- [ ] **Dado** que estou autenticado, **quando** consulto meu Saldo, **então** visualizo a quantidade atual de créditos disponíveis para uso.
- [ ] **Dado** que existem movimentações que alteraram meu Saldo, **quando** consulto o histórico, **então** consigo visualizar cada movimentação com sua origem, data, quantidade adicionada ou consumida e o Saldo resultante.
- [ ] **Dado** que uma compra de créditos foi confirmada, **quando** consulto o histórico, **então** encontro uma movimentação de entrada associada ao Pedido de créditos correspondente.
- [ ] **Dado** que uma execução consumiu créditos conforme a política vigente, **quando** consulto o histórico, **então** encontro uma movimentação de saída associada à respectiva Tarefa ou Tentativa de execução.
- [ ] **Dado** que ainda não houve nenhuma movimentação de créditos na minha conta, **quando** consulto o histórico, **então** visualizo meu Saldo atual e sou informado de que ainda não existem movimentações registradas.
- [ ] **Dado** que tento consultar o Saldo ou histórico pertencente a outro Desenvolvedor, **quando** realizo a ação, **então** o acesso é impedido e sou informado de que não tenho permissão.

**Regras relacionadas:** RN04

---

### US14 — Consultar contas de Desenvolvedores · `Must Have` · `S` · Status: `⚪ Draft`

**Como** Admin da plataforma, **quero** consultar as contas de Desenvolvedores cadastradas, **para que** eu possa prestar suporte básico aos usuários da plataforma.

**Critérios de aceite:**
- [ ] **Dado** que sou Admin, **quando** consulto as contas cadastradas, **então** consigo visualizar informações básicas necessárias para identificar os Desenvolvedores.
- [ ] **Dado** que sou Desenvolvedor, **quando** tento consultar a lista de contas da plataforma, **então** o acesso é impedido.
- [ ] **Dado** que sou Admin, **quando** consulto uma conta, **então** não tenho acesso ao conteúdo dos Repositórios, Demandas ou credenciais externas daquele Desenvolvedor.

---

## 🛡️ 5. Regras de Negócio (Constraints)

| ID | Regra |
|----|-------|
| **RN01** | Um mesmo Repositório não pode estar associado a mais de um Projeto do mesmo Desenvolvedor. |
| **RN02** | Motivo da rejeição de Plano de Tarefas é obrigatório. |
| **RN03** | Após rejeitar um Plano de Tarefas, o Desenvolvedor pode alterar a Demanda e/ou solicitar a geração de um novo Plano de Tarefas. O plano rejeitado permanece registrado no histórico e não é sobrescrito. Se a Demanda for alterada, um novo Plano deve ser gerado antes de qualquer execução. |
| **RN04** | **Política de consumo de créditos:**<br>• Cada Tentativa de execução consome 1 Crédito de execução.<br>• O Desenvolvedor precisa possuir crédito disponível antes de iniciar a Tentativa.<br>• O crédito é debitado quando a Tentativa efetivamente começa.<br>• Se a Tentativa for encerrada sem produzir Resultado de execução por uma falha atribuível ao Macro2PR, o crédito debitado é devolvido ao Saldo.<br>• Se a Tentativa produzir um Resultado de execução, o crédito permanece consumido mesmo que o Desenvolvedor posteriormente rejeite esse Resultado.<br>• Uma Regeneração cria uma nova Tentativa e, portanto, consome um novo Crédito de execução. |
| **RN05** | Motivo da rejeição de Resultado de execução é obrigatório. |
| **RN06** | Uma Demanda pode possuir no máximo um Pull Request final gerado pelo Macro2PR. |
| **RN07** | Uma mesma confirmação de pagamento não pode adicionar créditos ao Saldo mais de uma vez. |
| **RN08** | Um Projeto só pode ser associado a um Repositório que esteja disponível por meio da conta GitHub autorizada do Desenvolvedor. |

### Estados da **Demanda**

| Estado | Descrição |
|--------|-----------|
| **Rascunho** | Demanda criada, ainda sem Plano de Tarefas ativo para aprovação. |
| **Aguardando aprovação do plano** | Existe um Plano gerado aguardando decisão do Desenvolvedor. |
| **Aguardando novo plano** | O último Plano foi rejeitado e um novo Plano precisa ser gerado antes de qualquer execução. |
| **Plano aprovado** | Existe um Plano aprovado e suas Tarefas estão autorizadas para execução. |
| **Em execução** | O Plano aprovado entrou no ciclo de execução e ainda existem Tarefas sem Resultado aprovado. |
| **Pronta para PR** | Todas as Tarefas do Plano aprovado possuem Resultados aprovados e o Pull Request final já pode ser solicitado. |
| **Concluída** | O Pull Request final foi criado com sucesso e o fluxo da Demanda dentro do Macro2PR foi encerrado. Esse estado não significa que o Pull Request foi mergeado. |

**Transições:**
```
Rascunho → Aguardando aprovação do plano (gerar plano)
Aguardando aprovação do plano → Plano aprovado (aprovar) / Aguardando novo plano (rejeitar)
Aguardando novo plano → Rascunho (alterar demanda) / Aguardando aprovação do plano (gerar novo plano)
Plano aprovado → Em execução (iniciar 1ª tarefa)
Em execução → Pronta para PR (todas tarefas aprovadas)
Pronta para PR → Concluída (gerar PR com sucesso)
Concluída → (estado terminal)
```

### Estados do **Plano de Tarefas**

| Estado | Descrição |
|--------|-----------|
| **Gerado** | Plano criado a partir de uma Demanda, aguardando decisão do Desenvolvedor. |
| **Aprovado** | Desenvolvedor aprovou o plano; Tarefas estão autorizadas para execução. |
| **Rejeitado** | Desenvolvedor rejeitou o plano (motivo obrigatório); permanece no histórico, não é sobrescrito. |

**Transições:**
```
Gerado → Aprovado (aprovar) / Rejeitado (rejeitar)
Aprovado → (sem transições de saída — aprovação é definitiva para esta instância)
Rejeitado → (estado terminal desta instância — nova geração = nova instância em Gerado)
```

> **Regra:** Um Plano Aprovado não pode posteriormente ser rejeitado nem voltar para Gerado. Enquanto um Plano estiver no estado Gerado, o Desenvolvedor pode rejeitá-lo e solicitar uma nova geração. Nesse caso, o Plano rejeitado permanece no histórico e a nova geração cria uma nova instância no estado Gerado.

### Estados da **Tarefa**

| Estado | Descrição |
|--------|-----------|
| **Pendente** | Pertence a um Plano aprovado, mas possui dependências ainda não atendidas. |
| **Apta** | Todas as dependências estão atendidas e a Tarefa está elegível para que o Desenvolvedor solicite uma execução. |
| **Em execução** | Existe uma Tentativa de execução em andamento para a Tarefa. |
| **Aguardando revisão** | A Tentativa produziu Resultado de execução e a Revisão independente ainda não foi concluída. |
| **Aguardando decisão** | A Revisão foi concluída e o Resultado aguarda decisão do Desenvolvedor. |
| **Aprovada** | O Resultado foi aprovado e a Tarefa é considerada concluída para fins do Plano. |
| **Rejeitada** | O Resultado foi rejeitado e a Tarefa pode receber uma nova Tentativa por Regeneração. |

**Regra inicial:** ao ter o Plano aprovado, uma Tarefa sem dependências pendentes fica **Apta**; uma Tarefa com dependências pendentes fica **Pendente**.

**Transições:**
```
Pendente → Apta                    (dependências atendidas)
Apta → Em execução                 (Tentativa iniciada)
Em execução → Aguardando revisão   (Tentativa produziu Resultado)
Em execução → Apta                 (Tentativa falhou sem Resultado)
Aguardando revisão → Aguardando decisão   (Revisão concluída)
Aguardando decisão → Aprovada      (Desenvolvedor aprova)
Aguardando decisão → Rejeitada     (Desenvolvedor rejeita)
Rejeitada → Em execução            (Regeneração válida solicitada)
```

### Estados da **Tentativa de execução**

| Estado | Descrição |
|--------|-----------|
| **Em execução** | A Tentativa começou e está sendo processada. |
| **Concluída com resultado** | Terminou produzindo Resultado de execução. |
| **Falhou** | Terminou sem produzir Resultado de execução. |

> **Política de crédito:** Definida na **RN04** — se falha atribuível ao Macro2PR → devolução; caso contrário → crédito consumido.

**Transições:**
```
Em execução → Concluída com resultado
Em execução → Falhou

Concluída com resultado e Falhou são estados terminais daquela Tentativa;
uma nova execução sempre cria uma nova instância de Tentativa.
```

### Estados do **Pedido de Créditos**

| Estado | Descrição |
|--------|-----------|
| **Aguardando pagamento** | Pedido criado, mas ainda sem confirmação de pagamento. |
| **Pago** | O pagamento do Pedido foi confirmado e os créditos correspondentes foram adicionados ao Saldo. |
| **Não pago** | O pagamento não foi concluído com sucesso e nenhum crédito foi adicionado. |

**Transições:**
- `Aguardando pagamento` → `Pago` quando o pagamento é confirmado.
- `Aguardando pagamento` → `Não pago` quando o Macro2PR toma conhecimento de que o pagamento não foi aprovado ou não pode mais ser concluído.

> `Pago` e `Não pago` são **estados terminais** deste Pedido no escopo atual.
>
> **Regra:** Quando um Pedido de Créditos chega ao estado **Não pago**, ele não pode ser reutilizado para uma nova tentativa de pagamento. Caso o Desenvolvedor queira tentar novamente, deverá criar um novo Pedido de Créditos.

### Estados do **Pagamento**

| Estado | Descrição |
|--------|-----------|
| **Aguardando confirmação** | Existe uma transação de pagamento associada ao Pedido, mas sua confirmação definitiva ainda não foi conhecida pelo Macro2PR. |
| **Confirmado** | O meio de pagamento confirmou que a transação foi concluída com sucesso. |
| **Não aprovado** | O meio de pagamento informou que a transação não foi concluída com sucesso. |

**Transições:**
- `Aguardando confirmação` → `Confirmado`
- `Aguardando confirmação` → `Não aprovado`

> `Confirmado` e `Não aprovado` são **terminais** para aquela ocorrência de Pagamento.
>
> **RN07:** Uma mesma confirmação não pode adicionar créditos ao Saldo mais de uma vez.

---

## 🚫 6. Fora de Escopo (Non-goals)

| Item | Motivo |
|------|--------|
| **Assinatura recorrente / planos mensais** | Escopo focado em venda avulsa de créditos; renovação/cancelamento adicionam complexidade desnecessária ao MVP. |
| **Colaboração entre contas** | Cada Projeto pertence a um único Desenvolvedor neste escopo; compartilhamento de Projetos, convites e papéis de colaboração ficam para evolução futura. |
| **Cancelamento de Demanda** | Nenhuma story define esse fluxo; manter estados simples. |
| **Merge automático do Pull Request** | O Macro2PR encerra seu fluxo ao criar o PR; merge é decisão fora da plataforma. |
| **Cadastro e edição de pacotes de créditos pelo Admin** | Os pacotes de créditos existem no produto, mas sua criação/edição administrativa não faz parte deste escopo; serão ofertas previamente disponíveis. |
| **Notificações (e-mail, push, in-app)** | Não é requisito funcional do escopo mínimo; pode ser adicionado depois. |
| **Dashboard de métricas/analytics para o Desenvolvedor** | Fora do escopo de pedidos/pagamentos e decomposição de demandas. |
| **Edição manual do Plano de Tarefas** | Neste escopo, o Desenvolvedor pode aprovar ou rejeitar o Plano; caso o rejeite, pode alterar a Demanda e/ou solicitar uma nova geração. Alterar individualmente Tarefas ou dependências do Plano gerado fica fora de escopo. |
| **Múltiplos Projetos do mesmo Desenvolvedor associados ao mesmo Repositório** | Fora de escopo conforme RN01; cada Repositório pode estar associado a apenas um Projeto por Desenvolvedor neste semestre. |

---

## ⚙️ 7. Requisitos Não Funcionais (Qualidade)

| ID | Requisito | Justificativa para defesa |
|----|-----------|---------------------------|
| **NFR01** | **Isolamento de dados** — Um Desenvolvedor não pode acessar Projetos, Demandas, créditos, pagamentos ou resultados pertencentes a outro Desenvolvedor. | O Macro2PR trabalha com código, demandas e créditos pertencentes a contas diferentes; misturar ou expor dados entre Desenvolvedores comprometeria diretamente a confiança no produto. |
| **NFR02** | **Rastreabilidade** — Tentativas de execução, Resultados, Revisões, rejeições, regenerações e movimentações de créditos devem permanecer registradas de forma que o Desenvolvedor consiga entender o histórico das decisões. | O Desenvolvedor precisa conseguir entender como uma Tarefa evoluiu, quais Tentativas ocorreram, quais Revisões foram produzidas e por que um resultado foi aceito ou rejeitado. |
| **NFR03** | **Consistência financeira** — Uma compra ou confirmação não pode creditar o Saldo mais de uma vez, e movimentações de crédito não podem deixar o Saldo inconsistente. | O Saldo determina se o Desenvolvedor pode executar novas Tarefas; duplicar créditos, perder movimentações ou produzir um Saldo incorreto afeta diretamente o uso pago da plataforma. |
| **NFR04** | **Proteção de informações sensíveis** — Credenciais e informações necessárias para acessar serviços externos não devem ser expostas ao usuário nem armazenadas de forma insegura. | O Macro2PR depende de autorizações para acessar serviços externos em nome do Desenvolvedor; essas informações não podem ficar expostas a usuários indevidos ou aparecer inadvertidamente no produto. |
| **NFR05** | **Resiliência do fluxo** — Uma falha temporária durante execução, revisão, pagamento ou criação do Pull Request não deve apagar resultados, decisões ou créditos já registrados corretamente. | Execuções, Revisões, pagamentos e criação de Pull Requests podem depender de operações demoradas ou externas; uma falha temporária não deve fazer o Desenvolvedor perder trabalho ou decisões já registradas. |
| **NFR06** | **Usabilidade e acessibilidade básica** — Ações críticas devem apresentar estado de processamento e resultado, e os controles principais devem poder ser identificados e utilizados também por navegação via teclado. | O Desenvolvedor acompanha operações que podem levar tempo e toma decisões críticas de aprovação e rejeição; ele precisa perceber claramente o estado dessas ações e conseguir operar os controles principais por teclado. |

---

## 📅 8. Histórico

| Data | Versão | O que mudou |
|------|--------|-------------|
| 2026-09-08 | 1.0.0 | Versão inicial via `/utf-prd` — entrevista completa |
