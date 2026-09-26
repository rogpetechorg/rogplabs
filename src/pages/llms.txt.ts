import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
export const GET: APIRoute = async () => {
  const radar = await getCollection('radar');
  const records = await getCollection('registro', ({ data }) => !data.draft);
  const base = 'https://rogplabs.rogpe.tech';
  const lines = ['# rogpLabs', '', '> Laboratório editorial público da ROGPE sobre IA, programação e experimentos técnicos.', '', 'Este índice descreve somente conteúdo público. Demonstrações não são benchmarks; recomendações têm contexto e data. Cursos permanecem em preparação.', '', '## Navegação', `- [Projetos e evidências](${base}/projetos/)`, `- [Contato](${base}/contato/)`, `- [Privacidade](${base}/privacidade/)`, '', '## Radar', ...radar.map(item => `- [${item.data.title}](${base}/radar/${item.id}/): ${item.data.summary}`), '', '## Registros', ...records.map(item => `- [${item.data.title}](${base}/registro/${item.id}/): ${item.data.summary}`), ''];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
