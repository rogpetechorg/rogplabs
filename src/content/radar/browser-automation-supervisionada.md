---
title: Browser automation com supervisão
area: Infraestrutura
recommendation: acompanhar
status: em revisão
updatedAt: 2026-09-20
summary: Mapear riscos e casos seguros antes de permitir que uma automação execute ações externas em nome de alguém.
decisionCriteria: Leitura pode ser automática; publicação, compra, exclusão e mudança de permissão exigem confirmação explícita e alvo visível.
nextStep: Catalogar ações reversíveis e irreversíveis em um fluxo real de navegador.
order: 6
evidence:
  - label: OWASP Top 10 for LLM Applications
    url: https://genai.owasp.org/llm-top-10/
history:
  - date: 2026-09-20
    state: acompanhar
    note: Registro inicial com foco em ações externas e reversibilidade.
question: Qual ação de navegador você nunca delegaria sem ver a confirmação final?
---

Automação de navegador mistura leitura, decisão e ações que podem afetar sistemas externos. O teste separa essas etapas e mantém a confirmação humana perto do momento de impacto.

Também vamos observar como a interface mostra o alvo, a consequência e a possibilidade de desfazer cada ação.
