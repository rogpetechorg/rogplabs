# rogpLabs

Laboratório público da ROGPE para experimentar tecnologias, registrar o que funcionou e construir uma comunidade que aprende em público.

## Rodar localmente

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

## Conteúdo vivo

Os itens apresentados na página inicial ficam em `src/pages/index.astro`. O fluxo editorial recomendado é:

1. Criar ou atualizar o experimento com estado `avaliar`, `testar`, `adotar` ou `pausar`.
2. Publicar o roteiro da semana e a próxima ação verificável.
3. Converter pedidos recorrentes da comunidade em issues com o rótulo `pedido-da-comunidade`.
4. Ligar o formulário da newsletter a um provedor antes de promovê-lo como inscrição ativa.

## Deploy no Dokploy

O Dokploy está configurado no ambiente de produção do ROGP Ecossistema v4, com Dockerfile, porta interna `80`, health check `/healthz` e domínio `rogplabs.rogpe.tech`. O projeto usa o repositório público como origem Git. Para publicar um commit já validado:

```bash
pnpm run check:all
git push origin main
pnpm run deploy:production
```

O comando usa `DOKPLOY_TOKEN` quando disponível ou a credencial `dokploy.rogpe.tech` do Chaves no macOS. O projeto é estático. O formulário atual coleta intenção no navegador e orienta o envio para o canal da comunidade. Para operar uma newsletter de verdade, configure um provedor (Buttondown, Resend ou ConvertKit) e substitua o destino no formulário. Nunca inclua uma chave de API no bundle.
