---
title: RAG genérico sem avaliação
area: IA aplicada
recommendation: evitar
status: pausado
updatedAt: 2026-09-20
summary: Evitar prometer busca confiável enquanto não houver um conjunto de perguntas e respostas que meça a recuperação.
decisionCriteria: A solução só avança quando a equipe consegue medir cobertura, precisão e falhas importantes com exemplos do próprio domínio.
nextStep: Montar um conjunto pequeno de avaliação antes de escolher banco, modelo ou estratégia de fragmentação.
order: 4
evidence:
  - label: Guia de avaliação do OpenAI Cookbook
    url: https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals
history:
  - date: 2026-09-20
    state: evitar
    note: Registro inicial recomenda pausar o uso até existir um conjunto de avaliação do domínio.
question: Quais cinco perguntas não podem falhar no seu caso de uso?
---

Uma demonstração de RAG pode parecer convincente mesmo quando recupera o trecho errado. Sem perguntas de referência, a equipe não sabe se uma mudança melhorou o sistema ou apenas mudou a aparência da resposta.

O próximo passo vem antes da arquitetura: escolher exemplos reais e definir o que conta como resposta suficiente.
