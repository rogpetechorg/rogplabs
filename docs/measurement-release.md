# rogpLabs: CRM, mensuração e descoberta

## Escopo confirmado em 26/09/2026

O usuário corrigiu o alvo: esta tarefa é exclusivamente do rogpLabs. Preservar o pedido original de mockup antes das telas, CRM na empresa correta, métricas de jornada para Metabase, conteúdo público verificável, SEO, descoberta por IA e publicação funcional. Não alterar o repositório nem o serviço rogpe.tech.

## Descoberta

Astro estático, conteúdo em coleções, Nginx e proxy de newsletter Listmonk. O formulário de comunidade abre uma issue para revisão no GitHub; não armazena lead. Há alterações locais anteriores na home, estilos, conteúdo, layout, páginas e verificações. Preservar e validar o conjunto para publicação. Commit inicial: 256147f.

Fontes: AFFiNE CJ1RRsV21c e iCR749dxkUNuulLd-vtmF; README; docs/rogplabs-product-plan.md. Identidade: laboratório editorial público da ROGPE, com método, evidência e limites. Cursos ainda em preparação; não vender turmas inexistentes. Portfólio público deriva dos registros existentes.

## Aceite e execução

1. Mockup HTML independente de home, portfólio e contato antes de alterar as telas.
2. Contato privado encaminhado ao Twenty: tenant rogpe, brand rogpLabs, system rogplabs.rogpe.tech e pipeline sales definidos no servidor. Idempotência, persistência antes da confirmação, retentativa e teste de isolamento.
3. Coleta consentida: páginas, cliques, seções, profundidade, tempo ativo, filtros, etapas de formulário, erros e saída. Não coletar valores digitados nem URL de consulta. Abandono é inferido; cliques externos não equivalem a publicação ou venda.
4. Gateway assinado com origem própria do rogpLabs e dashboard Metabase exclusivo, sem compartilhar identidade analítica com rogpe.tech.
5. SEO por rota, dados estruturados fiéis, sitemap e llms.txt gerados das páginas públicas. Metadados não garantem ranking ou citação por IA.
6. Testes de contrato e runtime; revisão responsiva; staging isolado; promoção do mesmo artefato com rollback. Preservar newsletter e navegação existentes.

## Arquitetura

Manter Astro estático. A entrada de CRM e o coletor exigem um backend que Nginx estático não fornece. Um servidor Node sem dependências de runtime servirá o build, o proxy restrito da newsletter e as duas APIs. Estado durável em volume próprio do rogpLabs, segredos somente no ambiente. Migração de runtime requer smoke de rotas, cache, cabeçalhos, newsletter, CRM e encerramento. Não criar banco ou framework adicional.

## Recursos

Swap local acima do orçamento para builds/E2E. Editar arquivos leves; builds e navegador de testes somente no servidor, sequencialmente, após verificar carga. Não interromper processos do usuário. Nenhum subagente.

## Limitações a explicitar

Consentimento, bloqueadores e falhas de rede limitam cobertura. Última seção/campo observado não comprova motivo da saída. Inscrição enviada não comprova confirmação de newsletter. Entrega ao CRM não comprova venda. Dados analíticos e operacionais permanecem separados.
