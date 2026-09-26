---
title: Coding com IA e gates reais
area: Prática
recommendation: adotar
status: ativo
updatedAt: 2026-09-20
summary: Usar IA com escopo claro, testes, revisão e evidência antes de integrar uma mudança.
decisionCriteria: A entrega precisa ser reproduzível, revisável e passar pelos mesmos critérios técnicos exigidos de qualquer alteração humana.
nextStep: Registrar o tempo de revisão e as regressões encontradas em tarefas de tamanhos diferentes.
order: 5
evidence:
  - label: Registro 017 do laboratório
    url: /registro/agentes-sabem-parar
  - label: Repositório público do rogpLabs
    url: https://github.com/rogpetechorg/rogplabs
history:
  - date: 2026-09-20
    state: adotar
    note: Registro inicial com testes, revisão, critério de parada e evidência por requisito.
question: Qual gate evita mais retrabalho no seu fluxo hoje?
---

Velocidade de geração não substitui validação. A prática recomendada mantém o escopo pequeno, faz a ferramenta localizar o código antes de alterar e exige uma prova para cada critério de aceite.

Quando a tarefa não tem teste possível, o registro deve explicar qual inspeção foi feita e o que ainda depende de verificação humana.
