---
title: MCP com princípio de menor acesso
area: Infraestrutura
recommendation: testar
status: ativo
updatedAt: 2026-09-20
summary: Testar conectores pequenos, auditáveis e com permissões explícitas antes de ligar agentes a sistemas de trabalho.
decisionCriteria: Cada ferramenta deve declarar o menor conjunto de dados e ações necessário para concluir sua função.
nextStep: Revisar um conector real e remover permissões que não aparecem no caso de uso aprovado.
order: 3
evidence:
  - label: Especificação do Model Context Protocol
    url: https://modelcontextprotocol.io/specification/
history:
  - date: 2026-09-20
    state: testar
    note: Registro inicial limitado a conectores com ações enumeradas e auditáveis.
question: Que permissão você costuma conceder por conveniência, mas quase nunca usa?
---

Conectores úteis também aumentam a superfície de risco. O teste começa pequeno: uma função clara, ações enumeradas e nenhum acesso implícito.

A avaliação vai registrar o que o agente tentou fazer, o que foi autorizado e o que foi bloqueado.
