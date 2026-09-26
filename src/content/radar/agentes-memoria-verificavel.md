---
title: Agentes com memória verificável
area: IA aplicada
recommendation: testar
status: ativo
updatedAt: 2026-09-20
summary: Comparar recuperação, custo e controle humano antes de usar memória persistente em tarefas reais.
decisionCriteria: A memória precisa mostrar de onde cada dado veio, permitir correção e não ampliar o acesso do agente sem necessidade.
nextStep: Executar o mesmo conjunto de tarefas com e sem memória e registrar precisão, custo e intervenções humanas.
featured: true
order: 1
evidence:
  - label: Registro 017 do laboratório
    url: /registro/agentes-sabem-parar
  - label: Documentação do OpenAI Agents SDK sobre sessões
    url: https://openai.github.io/openai-agents-python/sessions/
history:
  - date: 2026-09-20
    state: testar
    note: Registro inicial com critérios de origem, correção e limite de acesso.
question: Em qual tarefa uma memória do agente economizaria trabalho sem esconder decisões importantes?
---

Memória só ajuda quando o histórico pode ser conferido e corrigido. O teste separa contexto útil de lembranças que apenas parecem plausíveis.

Também vamos observar quando uma memória antiga deveria expirar. Guardar tudo cria ruído, custo e risco de uma decisão nova nascer de um dado que já perdeu validade.
