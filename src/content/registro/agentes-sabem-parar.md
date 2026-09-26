---
title: Quando um agente precisa saber a hora de parar
publishedAt: 2026-09-20
summary: Testamos um fluxo com limite explícito de contexto, permissão e tentativas antes de pedir intervenção humana.
kind: experimento
radarSlugs:
  - agentes-memoria-verificavel
  - coding-com-gates
nextDecision: Comparar o fluxo com uma automação sem regra de parada usando as mesmas tarefas.
draft: false
---

## Contexto

Agentes tendem a insistir quando o objetivo está claro, mas o ambiente não oferece a informação ou a permissão necessária. Isso aumenta custo e pode transformar uma falha simples em uma sequência de tentativas sem evidência nova.

## O que fizemos

O fluxo recebeu três limites visíveis: contexto mínimo obrigatório, ações permitidas e número máximo de tentativas sem mudança de estado. Ao atingir um limite, o agente precisava registrar o que tentou, qual evidência encontrou e a menor decisão humana necessária.

## O que aprendemos

A regra de parada tornou a revisão mais simples porque separou falha técnica de falta de acesso. Ainda não temos uma comparação suficiente para afirmar ganho de tempo ou custo.

## Próxima decisão

Executar as mesmas tarefas com uma automação sem regra de parada e comparar tentativas, duração e qualidade do pedido de ajuda.
