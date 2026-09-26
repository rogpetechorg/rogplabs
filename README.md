# rogpLabs

Laboratório público da ROGPE para testar tecnologias, registrar decisões e transformar perguntas da comunidade em novos experimentos.

## Rodar localmente

Requer Node.js 22 ou superior e pnpm 11.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Validação completa:

```bash
pnpm run check:all
```

O comando verifica tipos e schemas, gera todas as páginas e confere rotas, links internos, SEO, sitemap e contratos das APIs. Execute também `pnpm test` para validar isolamento de marca, idempotência, assinatura e persistência.

## Estrutura

- `/`: experimento em destaque, resumo do radar, registros recentes e participação.
- `/radar`: lista filtrável de decisões.
- `/radar/[slug]`: critério, evidências, histórico e pergunta aberta.
- `/registro`: atualizações datadas do laboratório.
- `/registro/[slug]`: contexto, aprendizado e próxima decisão.
- `/projetos` e `/contato`: portfólio público e solicitação privada.
- `/llms.txt`: índice das páginas públicas para ferramentas de IA.
- `/privacidade`, `/termos` e `404`: páginas operacionais.

Componentes reutilizáveis ficam em `src/components`, o layout comum em `src/layouts` e os estilos globais em `src/styles`.

## Publicar conteúdo

O conteúdo usa as Content Collections do Astro e é validado no build:

```text
src/content/
  radar/
  registro/
  videos/
```

Um item do radar precisa informar recomendação, data de revisão, resumo, critério, próximo passo, evidências, histórico e pergunta para a comunidade. Registros em rascunho usam `draft: true` e não aparecem no site nem no sitemap.

## Comunidade

Discussões abertas ficam no [GitHub Discussions](https://github.com/rogpetechorg/rogplabs/discussions). Pedidos concretos podem ser iniciados pelo formulário da home; o site abre uma issue preenchida para revisão, sem publicar em nome da pessoa.

## Newsletter

O formulário envia inscrições para a lista pública de opt-in do Listmonk por `/api/newsletter/subscribe`. O servidor Node encaminha apenas essa rota para `listmonk.rogpe.tech`, sem credencial no navegador. O assinante recebe um e-mail de confirmação antes de entrar na lista.

Antes de aceitar a inscrição, o backend verifica se o UUID aparece no formulário público do Listmonk (cache de 60 segundos). Sem essa lista, responde indisponibilidade e não encaminha o e-mail.

Não troque o UUID da lista pública por uma lista privada e não use a API administrativa no bundle.

## Deploy no Dokploy

O container Node 22 serve o build Astro na porta 80, com usuário não-root, health check em `/healthz`, página 404 real, CRM e proxy restrito da newsletter. O volume `/app/data` é obrigatório: guarda solicitações e eventos antes da confirmação, com retentativa a cada minuto. A configuração anterior de Nginx está preservada em `docker/` apenas como referência de rollback. A publicação automática por push está desativada para preservar a promoção de uma imagem testada. O script do Dokploy abaixo inicia um build; finalize sempre promovendo a imagem por revisão:

```bash
pnpm run check:all
git push origin main
pnpm run deploy:production
```

No host de implantação, construa `rogplabs-release:<revisão>` a partir do commit revisado, valide-a no ambiente isolado e execute `sh scripts/promote-release.sh <revisão>`. Esse passo mantém a imagem sem `latest`, filesystem somente leitura, limite de processos e rotação de logs. Uma publicação direta pelo Dokploy pode remover esses ajustes; confira o serviço após cada release. Nunca promova uma revisão apenas porque o build terminou.

O deploy usa `DOKPLOY_TOKEN` ou a credencial `dokploy.rogpe.tech` do Chaves no macOS. O domínio configurado é `rogplabs.rogpe.tech`.

## CRM e mensuração

`PUBLIC_ORIGIN`, `CRM_BASE_URL`, `CRM_API_KEY`, `EVENT_GATEWAY_URL`, `EVENT_GATEWAY_SOURCE`, `EVENT_GATEWAY_KEY` e `NEWSLETTER_BASE_URL` são configurações exclusivas do servidor. Não entram no build nem no navegador. Em produção, `TRUST_PROXY=true` só é válido atrás do proxy confiável. Use uma única réplica com volume persistente; expansão exige substituir o armazenamento local por uma fila compartilhada.

Tenant `rogpe`, marca `rogpLabs`, sistema `rogplabs.rogpe.tech` e pipeline `sales` são fixados pelo servidor. Contatos usam UUID idempotente no Twenty. Navegação só é coletada após opt-in; valores digitados, consulta da URL, IP e texto dos elementos não entram nos eventos. Contadores de recebimento e entrega ao CRM são operacionais, sem dados pessoais.

[Dashboard privado](https://data.rogpe.tech/dashboard/9-rogplabs-jornada-e-operacao). SQL versionado em `metabase/`. A origem de produção é `urn:rogpe:rogplabs:production`; os testes usam `urn:rogpe:rogplabs:stage`. O mapa de alvos e seções fica em `docs/measurement-map.json` e precisa ser atualizado quando as telas mudarem.

As amostras de performance são observações consentidas, não uma certificação de Core Web Vitals. Saída e abandono são inferidos; inscrição recebida não prova confirmação e lead entregue não prova venda. Consentimento e bloqueadores limitam a cobertura.

A retenção local elimina apenas cópias já entregues: contatos após 30 dias e eventos após 90 dias. Registros ainda na fila permanecem para recuperação. A retenção central do CRM/gateway segue sua própria administração. Consulte `docs/measurement-release.md` para evidências e limites da publicação.

No Swarm de produção, os backends usam os nomes internos dos serviços na rede `dokploy-network`. O teste de staging deve usar essa mesma rede: o retorno pelo IP público do host não responde a partir desse contêiner. Não substitua por IPs de contêiner nem reutilize aliases genéricos de staging.
