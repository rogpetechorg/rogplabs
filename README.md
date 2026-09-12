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

Crie uma aplicação Docker apontando para este repositório, com build type `Dockerfile`, porta interna `80` e domínio `rogplabs.rogpe.tech`. O health check é `/healthz`. O DNS do subdomínio precisa apontar para o servidor Dokploy antes da emissão do certificado.

```bash
pnpm run check:all
```

O projeto é estático. O formulário atual coleta intenção no navegador e orienta o envio para o canal da comunidade. Para operar uma newsletter de verdade, configure um provedor (Buttondown, Resend ou ConvertKit) e substitua o destino no formulário. Nunca inclua uma chave de API no bundle.
