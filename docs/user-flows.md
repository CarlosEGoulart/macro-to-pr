# 🗺️ Jornadas de Usuário

**Projeto:** Macro2PR
**Versão:** 1.0.0
**Última atualização:** 2026-09-11

> 🤖 **Este documento é a fonte da verdade sobre O QUE A PESSOA VIVE na tela** —
> o caminho do primeiro clique até o objetivo, e principalmente os pontos onde ela
> trava, espera ou desiste.
>
> ✍️ **Não preencha na mão:** rode `/utf-flows`. A entrevista escolhe a história que
> merece o desenho, obriga o ponto de desistência a aparecer e cobra a decisão sobre
> ele.
>
> 🚫 **Não duplique:** regra de negócio mora no `prd.md`; estado, entidade e contrato
> moram no `architecture.md`. Aqui mora o caminho.

---

## Jornada 1 — Compra e pagamento de créditos

**Stories:** US11, US12 e US13.
**Critérios que ela marca:** sai do site e volta · depende do tempo · depende de confirmação externa · pode ser abandonada.

```mermaid
flowchart TD
    A(["Desenvolvedor autenticado"]) --> B["«pessoa» escolhe um Pacote de créditos"]
    B --> C["«pessoa» confirma a compra e cria um Pedido"]
    C --> D["«pessoa» segue para a etapa externa de pagamento"]

    D --> E["«pessoa» retorna ao Macro2PR"]
    D --> X[["Desenvolvedor abandona/fecha a etapa externa<br/>antes de visualizar a confirmação"]]
    X --> E

    E --> F{"Sessão válida?"}
    F -->|"não"| G["«pessoa» autentica-se novamente"]
    F -->|"sim"| H["«pessoa» consulta o Pedido original<br/>pela retomada da jornada ou pelo histórico"]
    G --> H

    H --> I{"Estado atual do Pedido"}
    I -->|"Pago"| J["Visualiza Pedido Pago e Saldo atualizado"]
    I -->|"Aguardando pagamento"| K["Visualiza confirmação pendente<br/>sem créditos da compra disponíveis"]
    I -->|"Não pago"| L["Visualiza Pedido Não pago<br/>sem créditos adicionados por essa compra"]

    K --> M["«pessoa» pode sair e consultar novamente mais tarde"]
    M --> E

    L --> N["«pessoa» pode iniciar uma nova compra<br/>criando um novo Pedido"]
    N --> B

    style X fill:#ffe0e0,stroke:#c62828
```

**O que decidimos sobre o nó vermelho:**

Se o Desenvolvedor fechar a etapa externa de pagamento, perder a conexão ou retornar depois, o Pedido permanece registrado e o retorno ao Macro2PR não libera créditos nem repete o pagamento. Ao voltar, ele consulta o Pedido original e visualiza seu estado atual: Pago, com o Saldo atualizado; Aguardando pagamento, enquanto a confirmação ainda não chegou; ou Não pago, sem créditos adicionados. Se a sessão tiver expirado, ele se autentica novamente antes de retomar o Pedido. A ausência de confirmação não é tratada como falha: enquanto não houver uma informação confiável sobre o pagamento, o Pedido continua aguardando. Para tentar uma nova compra após um Pedido Não pago, é necessário criar um novo Pedido.

---

## Dúvidas em aberto

| # | Dúvida | Onde ela precisa ser resolvida |
| --- | --- | --- |
