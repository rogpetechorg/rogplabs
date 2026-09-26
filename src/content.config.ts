import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const evidence = z.object({
  label: z.string(),
  url: z.union([z.string().url(), z.string().regex(/^\/[a-z0-9/_-]+$/)]),
});

const historyItem = z.object({
  date: z.coerce.date(),
  state: z.enum(['adotar', 'testar', 'acompanhar', 'evitar']),
  note: z.string(),
});

const radar = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/radar' }),
  schema: z.object({
    title: z.string(),
    area: z.string(),
    recommendation: z.enum(['adotar', 'testar', 'acompanhar', 'evitar']),
    status: z.enum(['ativo', 'em revisão', 'pausado']),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    decisionCriteria: z.string(),
    nextStep: z.string(),
    evidence: z.array(evidence).min(1),
    relatedVideo: z.string().url().optional(),
    history: z.array(historyItem).min(1),
    question: z.string(),
    featured: z.boolean().default(false),
    order: z.number().int().positive(),
  }),
});

const registro = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/registro' }),
  schema: z.object({
    title: z.string(),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    kind: z.enum(['experimento', 'decisão', 'roteiro']),
    radarSlugs: z.array(z.string()).default([]),
    videoUrl: z.string().url().optional(),
    nextDecision: z.string(),
    draft: z.boolean().default(false),
  }),
});

const videos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/videos' }),
  schema: z.object({
    title: z.string(),
    episode: z.number().int().positive(),
    status: z.enum(['em pesquisa', 'em produção', 'publicado']),
    updatedAt: z.coerce.date(),
    summary: z.string(),
    youtubeUrl: z.string().url().optional(),
    radarSlugs: z.array(z.string()).default([]),
  }),
});

export const collections = { radar, registro, videos };
