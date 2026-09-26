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

## Evidência da publicação — 26/09/2026

| Critério | Resultado observado |
|---|---|
| Mockup antes da implementação | `docs/mockup-rogplabs.html`: home, projetos, contato e visão privada de métricas |
| Conteúdo e identidade | Laboratório público rogpLabs; portfólio derivado dos registros existentes; cursos continuam em preparação |
| Isolamento do CRM | Teste público `LABS-E917EE0D`, registro `e917ee0d-9de8-4f02-bbe5-3fa5ad5899bf`, confirmado por GET HTTP 200 no Twenty com brand `rogpLabs`, system `rogplabs.rogpe.tech`, pipeline `sales` |
| Idempotência e persistência | Reenvio após reiniciar staging devolveu o mesmo protocolo e o mesmo ID do CRM |
| Entrega de produção | Snapshot: 1 contato e 25 eventos entregues, nenhum desses registros pendente |
| Metabase | Coleção 11, dashboard 9, perguntas 92/95/96/97/98. Consultas executadas; visão geral mostrou 2 sessões, 1 clique, 0 inscrições, 1 solicitação e 1 entrega ao CRM |
| Testes | 7 contratos aprovados no runtime Node 22; verificação Astro: 19 arquivos, 0 erros/avisos/hints; verificação estática: 16 páginas |
| Navegador | 9 larguras entre 320 e 1440 px, sem overflow; consentimento, recusa, revogação, formulário, filtros, storage bloqueado, 404 e índice público aprovados; 0 erros de JavaScript; 0 violações automáticas WCAG A/AA na página de contato |
| Produção | `https://rogplabs.rogpe.tech/healthz`: HTTP 200, marca rogpLabs, CRM e gateway configurados; serviço convergiu |
| Newsletter | Bloqueada: o formulário público do Listmonk não contém a lista `00329d73-0df1-435b-ab44-ee105ec9b6a7`. API do site retorna HTTP 503, preserva o e-mail no formulário e não encaminha a inscrição para outra lista |

Os primeiros registros são validações técnicas, não demanda comercial. A auditoria automática de acessibilidade não substitui avaliação manual completa. As telas não mudaram entre a revisão do navegador e a promoção final; as últimas correções foram no roteamento interno e na recuperação da fila.

### Runtime e reversão

Artefato promovido: `rogplabs-release:2d65950`, imagem `sha256:5f784620ba05aad8068c712e393d2e915d73153c0bea1066d2765acba727d79d`. Construído a partir do commit 2d65950, testado na mesma rede interna de produção e promovido sem reconstrução.

Imagem anterior Nginx: 49.123.540 bytes. Imagem final Node: 168.371.007 bytes. O crescimento vem da inclusão do runtime necessário às APIs; não houve alegação de redução de imagem. Snapshot em repouso: 13,3 MiB, CPU 0,00%, 11 PIDs. Isso não é um teste de capacidade sob carga. Limites aplicados: 256 MiB, 0,5 CPU e 64 PIDs. Usuário node, filesystem somente leitura, capacidades removidas, logs de 5 MiB com duas rotações, volume `rogplabs-production-data:/app/data`.

`docker buildx build --check` passou sem avisos. Build final, inspeção de camadas e smoke do runtime passaram. A configuração Compose do gateway foi validada antes de atualizar somente sua fonte de eventos. O site é serviço Swarm gerido por aplicação Dokploy; seu gate de configuração é a inspeção do serviço e do volume.

O acesso público ao próprio host não respondia a partir do Swarm. CRM, gateway e Listmonk usam nomes internos específicos de produção em `dokploy-network`, persistidos no Dokploy. A origem `urn:rogpe:rogplabs:stage` continua separada da origem de produção nas consultas, embora ambas entrem no gateway central. Os contatos sintéticos usam nomes ou contextos de teste. Os eventos iniciais de validação estão registrados neste relatório.

A publicação automática por push foi desativada. `scripts/promote-release.sh` mantém os limites e a imagem por revisão. Imagens anteriores foram preservadas; a publicação original tem a tag `rogplabs-rollback:256147f-6063c`. Nenhum volume foi removido. Uma reversão deve preservar `/app/data` e verificar novamente os endpoints e o CRM.

### Pendência e próximo passo

Restaurar no Listmonk a lista pública rogpLabs com o UUID original, confirmar double opt-in, domínio público e envio de confirmação. O serviço estava sob recuperação em outra tarefa e não foi reiniciado ou alterado por esta entrega. Depois da restauração, o backend volta a verificar a presença da lista a cada 60 segundos; validar o fluxo de confirmação com um destinatário autorizado antes de declarar a newsletter funcional. Não apontar o formulário para a lista padrão de outra finalidade.

### Handoff

Publicado rogpLabs com home editorial, portfólio, contato privado, SEO e índice para IA. CRM e telemetria têm roteamento fixo para rogpLabs; gateway assinado e cinco consultas em dashboard privado. Sete testes de contrato, nove viewports e entrega real confirmados. Fila de produção entregue; rollback e volume preservados. Única pendência observada: newsletter depende da lista original no Listmonk. Próxima ação: concluir a recuperação dessa lista na tarefa responsável e testar confirmação; não alterar os serviços de outras marcas.
