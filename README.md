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
4. Publicar o briefing apenas depois de revisar a lista de opt-in no Listmonk.

## Newsletter

O formulário envia inscrições para a lista pública de opt-in do Listmonk por meio de `/api/newsletter/subscribe`. O Nginx encaminha essa rota para `listmonk.rogpe.tech`, sem expor credenciais no navegador. O assinante recebe um e-mail de confirmação antes de entrar na lista.

Para manter essa integração segura, não substitua o UUID da lista pública por uma lista privada e não envie inscrições pela API administrativa. O endpoint público precisa permanecer protegido pelo opt-in do Listmonk e por uma política de privacidade publicada antes do primeiro disparo.

## Deploy no Dokploy

O Dokploy está configurado no ambiente de produção do ROGP Ecossistema v4, com Dockerfile, porta interna `80`, health check `/healthz` e domínio `rogplabs.rogpe.tech`. O projeto usa o repositório público como origem Git. Para publicar um commit já validado:

```bash
pnpm run check:all
git push origin main
pnpm run deploy:production
```

O comando usa `DOKPLOY_TOKEN` quando disponível ou a credencial `dokploy.rogpe.tech` do Chaves no macOS. O projeto é estático, com um proxy Nginx específico para a inscrição da newsletter. Nunca inclua uma chave de API no bundle.
