import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const dist = resolve('dist');
const serverPath = resolve('server/server.mjs');
const requiredRoutes = [
  'index.html',
  '404.html',
  'radar/index.html',
  'registro/index.html',
  'privacidade/index.html',
  'termos/index.html',
  'contato/index.html',
  'projetos/index.html',
  'llms.txt',
  'robots.txt',
  'sitemap.xml',
];

for (const route of requiredRoutes) {
  if (!existsSync(join(dist, route))) throw new Error(`Build não gerou dist/${route}.`);
}

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function resolveInternalPath(href) {
  const path = href.split('#')[0].split('?')[0];
  if (!path || path.startsWith('/api/')) return null;
  if (extname(path)) return join(dist, path.replace(/^\//, ''));
  return join(dist, path.replace(/^\//, ''), 'index.html');
}

const htmlFiles = walk(dist).filter((file) => file.endsWith('.html'));
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const marker of ['<title>', 'name="description"', 'rel="canonical"', 'href="/favicon.svg"']) {
    if (!html.includes(marker)) throw new Error(`${file.replace(`${dist}/`, '')}: metadado ausente (${marker}).`);
  }
  if (/href=["']#["']/.test(html)) throw new Error(`${file.replace(`${dist}/`, '')}: link vazio encontrado.`);
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
  for (const [, href] of html.matchAll(/href=["']([^"']+)["']/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith('#')) {
      if (!ids.has(href.slice(1))) throw new Error(`${file.replace(`${dist}/`, '')}: âncora ausente (${href}).`);
      continue;
    }
    const target = resolveInternalPath(href);
    if (target && !existsSync(target)) throw new Error(`${file.replace(`${dist}/`, '')}: link interno sem destino (${href}).`);
  }
}

const home = readFileSync(join(dist, 'index.html'), 'utf8');
for (const expected of ['agora no laboratório', 'Cada posição precisa explicar o porquê', 'data-request-form', '/api/newsletter/subscribe', 'Confira seu e-mail para confirmar a inscrição.']) {
  if (!home.includes(expected)) throw new Error(`Conteúdo essencial ausente da home: ${expected}`);
}

const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8');
for (const expected of ['/radar/coding-com-gates/', '/registro/agentes-sabem-parar/']) {
  if (!sitemap.includes(expected)) throw new Error(`Sitemap não contém ${expected}.`);
}

const server = readFileSync(serverPath, 'utf8');
for (const expected of ['https://listmonk.rogpe.tech/api/public/subscription', "resolve(root, '404.html')", 'x-content-type-options', 'permissions-policy']) {
  if (!server.includes(expected)) throw new Error(`Configuração do servidor ausente: ${expected}`);
}

console.log(`Verificação concluída: ${htmlFiles.length} páginas HTML, rotas, links internos, SEO, sitemap e proxy.`);
