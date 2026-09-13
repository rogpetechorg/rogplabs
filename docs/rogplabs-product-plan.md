# rogpLabs: plano de produto e experiência

## Decisão central

O rogpLabs não deve tentar ser um dashboard ou uma simulação de laboratório. Ele deve ser uma publicação viva que responde, de modo simples, a quatro perguntas:

1. O que estamos testando agora?
2. O que recomendamos adotar, testar, acompanhar ou evitar?
3. O que mudou desde a última atualização?
4. Como uma pessoa participa ou sugere o próximo conteúdo?

O radar é o índice dessas decisões. Vídeos, atualizações e pedidos são as evidências que sustentam cada item.

## Diagnóstico da tela atual

O painel "Sinal vivo" mistura quatro papéis: decoração, navegação, estado e conteúdo. Por isso ele parece complexo, sobrepõe textos e dá mais atenção à animação do que à decisão. A captura mostra o cartão de leitura cobrindo a bolinha central e o rótulo de comunidade competindo pelo mesmo espaço.

O que deve sair:

- O grande painel orbital da hero.
- A ideia de "atualizado hoje" quando não houver uma atualização editorial datada.
- Estados visuais que não levem a uma página ou a uma explicação.

O que deve permanecer:

- O posicionamento do rogpLabs como laboratório público.
- A linguagem do rogpOS: papel, grafite, violeta como cor de marca e verde apenas para estado positivo.
- Newsletter, pedidos via GitHub, YouTube, cursos e comunidade.

## Estrutura recomendada

### 1. Página inicial

A home deve ter apenas três blocos de decisão, nesta ordem:

1. **Agora no laboratório**: um experimento em destaque, seu estado, data de atualização e uma ação para ler o registro.
2. **Radar em resumo**: quatro estados com contagens e os três itens que mudaram recentemente. Não mostrar um mapa circular grande aqui.
3. **Próxima participação**: próximo vídeo ou encontro, pedido de pauta e newsletter.

A home não é o lugar para explicar toda a taxonomia. Ela convida a pessoa a entrar no registro certo.

### 2. Radar

O radar ganha uma página própria em `/radar`.

- A primeira leitura é uma lista filtrável, não o gráfico.
- Cada item mostra: nome, recomendação, resumo, data, evidência e próximo passo.
- Os filtros são `Adotar`, `Testar`, `Acompanhar` e `Evitar por enquanto`.
- O gráfico de bolinhas é opcional e complementar. Ele aparece depois da lista, em tela grande, e cada bolinha abre a mesma página de detalhe.

Isso segue a lição útil do Technology Radar: quadrantes categorizam itens e anéis expressam recomendação. O valor está na decisão escrita e no processo de revisão, não na forma circular.

### 3. Registro do laboratório

Criar `/registro` para atualizações curtas e datadas.

- Uma entrada por experimento, vídeo ou mudança de decisão.
- Cada entrada conecta a um item do radar e, quando existir, ao vídeo ou roteiro correspondente.
- O formato é curto: contexto, o que foi feito, o que aprendemos, próxima decisão.

### 4. Página de item

Criar `/radar/[slug]`.

- Estado atual e data de revisão.
- Critério usado para decidir.
- Evidências, links e vídeos relacionados.
- Histórico de mudança de estado.
- Uma pergunta aberta para a comunidade.

Esta é a unidade que dá substância ao radar. Sem ela, uma bolinha é apenas um rótulo.

### 5. Comunidade e pedidos

Usar o GitHub para a conversa que precisa permanecer pública e pesquisável:

- **Discussões** para perguntas, propostas e debates.
- **Issues** apenas quando uma proposta virar trabalho concreto ou pauta aprovada.
- Formulário do site abre um pedido já preenchido, como faz hoje.

Categorias iniciais: `Perguntas`, `Ideias de vídeo`, `Experimentos` e `Mostre o que fez`.

O YouTube fica como a conversa mais leve: enquete antes do vídeo, post após publicar e convite para a página de registro. A Comunidade do YouTube permite posts, enquetes e moderação; ela deve complementar o site, não duplicá-lo.

## Modelo de conteúdo

Manter o MVP sem banco de dados. O conteúdo fica em coleções do Astro e entra por pull request ou commit. Isso reduz custo, mantém revisão editorial e deixa cada atualização auditável.

```text
src/content/
  radar/
    agentes-memoria-verificavel.md
    coding-com-gates.md
  registro/
    2026-09-12-memoria-em-teste.md
  videos/
    agentes-sabem-parar.md
```

Campos mínimos de um item de radar:

```text
title, slug, area, recomendacao, status, updatedAt,
summary, decisionCriteria, evidenceLinks, relatedVideo,
history, questionForCommunity
```

Os únicos dados que podem aparecer como "ao vivo" são dados que vierem desse conteúdo: data da última atualização, estado atual e próximo passo. Nenhum contador deve ser inventado.

## Fases de entrega

### Fase 0: corrigir a leitura visual

- Remover o painel orbital da hero.
- Trocar por um cartão simples de "Agora no laboratório".
- Restaurar o espaço, o contraste e os componentes do rogpOS.
- Confirmar desktop e mobile antes de publicar.

**Pronto quando:** a hero cabe sem colisões, tem uma ação principal e o visitante entende em poucos segundos qual é o experimento atual.

### Fase 1: tornar o conteúdo editável

- Configurar Content Collections do Astro para `radar`, `registro` e `videos`.
- Migrar os seis itens estáticos para arquivos de conteúdo.
- Criar a página de detalhe de item e a lista `/radar`.

**Pronto quando:** mudar um estado ou publicar um registro não exige editar a página inicial manualmente.

### Fase 2: criar um radar que ajuda a decidir

- Filtros acessíveis e URL compartilhável por estado.
- Lista como visualização padrão e gráfico como modo complementar.
- Data de atualização, critério e histórico em cada item.

**Pronto quando:** alguém consegue responder "por que adotar?" ou "por que evitar?" sem sair do site.

### Fase 3: criar o ciclo da comunidade

- Habilitar GitHub Discussions e suas quatro categorias.
- Publicar um código de conduta curto e uma regra clara: discussão para ideia, issue para trabalho aprovado.
- Criar o ritual semanal: enquete no YouTube, registro no site, briefing por e-mail e debate no GitHub.

**Pronto quando:** uma pergunta pode ir do YouTube ou do site até um roteiro sem ser perdida em mensagens privadas.

### Fase 4: medir e ajustar

- Medir inscrições na newsletter, pedidos, cliques para vídeo e respostas por tema.
- Revisar semanalmente os três itens mais vistos e as perguntas sem resposta.
- Arquivar itens antigos em vez de deixar um estado desatualizado na página inicial.

**Pronto quando:** a próxima pauta nasce dos sinais reais da comunidade, não de um contador decorativo.

## Ordem de execução imediata

1. Aprovar esta estrutura de produto.
2. Implementar a Fase 0 e publicar uma página inicial simples.
3. Criar as Content Collections e migrar os seis itens atuais.
4. Entregar `/radar` e `/radar/[slug]` antes de adicionar novas animações.
5. Habilitar Discussions e rodar o primeiro ciclo de conteúdo.

## Referências verificadas

- Thoughtworks explica que os quadrantes categorizam os itens e os anéis representam a recomendação; os itens podem se mover conforme cresce a confiança. [FAQ do Technology Radar](https://www.thoughtworks.com/radar/faq)
- O construtor da Thoughtworks aceita planilha, CSV ou JSON, mas o material de origem e a discussão de revisão vêm antes da visualização. [Build Your Own Radar](https://www.thoughtworks.com/en-us/radar/byor)
- O Astro oferece Content Collections para conteúdo estruturado e validado, adequadas para um site de publicação como este. [Documentação do Astro](https://docs.astro.build/en/guides/content-collections/)
- O GitHub Discussions separa conversas abertas de issues e permite categorias, respostas marcadas e moderação. [Documentação do GitHub Discussions](https://docs.github.com/en/discussions)
- O listmonk já suporta inscrições públicas e APIs, portanto a newsletter atual pode continuar sem trocar de ferramenta. [Documentação de assinantes do listmonk](https://listmonk.app/docs/apis/subscribers/)
- O YouTube permite posts, enquetes e uma Comunidade moderada. Usar esses recursos como porta de entrada evita criar mais uma rede para administrar. [Ajuda do YouTube sobre Comunidades](https://support.google.com/youtube/answer/15739414)
