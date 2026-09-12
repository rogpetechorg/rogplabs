import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const index = resolve('dist/index.html');
if (!existsSync(index)) throw new Error('Build não gerou dist/index.html.');
const html = readFileSync(index, 'utf8');
for (const expected of ['rogpLabs', 'radar do laboratório', 'Pedir um vídeo', 'Cursos em desenvolvimento']) {
  if (!html.includes(expected)) throw new Error(`Conteúdo essencial ausente: ${expected}`);
}
console.log('Verificação da página inicial concluída.');
